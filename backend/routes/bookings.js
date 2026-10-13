import { Router } from 'express'
import auth from '../middleware/auth.js'
import Business from '../models/Business.js'
import Service from '../models/Service.js'
import Razorpay from 'razorpay'
import Booking from '../models/Booking.js'
import mongoose from 'mongoose'
import crypto from 'crypto'


const router = Router()
const toMin = (t) => parseInt(t.slice(0, 2)) * 60 + parseInt(t.slice(3))
const toTime = (m) =>
  String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')

const createReceiptToken = () =>
  crypto.randomBytes(32).toString('hex')

const hashReceiptToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex')

const getRazorpay = () =>
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
    : null



  router.post('/create-order', async (req, res) => {
  try {
    const {
      slug,
      serviceId,
      date,
      startTime,
      customerName,
      customerEmail,
      customerPhone,
    } = req.body

    const razorpay = getRazorpay()

    if (!razorpay) {
      return res.status(500).json({
        message: 'Razorpay is not configured',
      })
    }

    const business = await Business.findOne({ slug })

    if (!business) {
      return res.status(404).json({
        message: 'Business not found',
      })
    }

    const service = await Service.findOne({
      _id: serviceId,
      business: business._id,
    })

    if (!service) {
      return res.status(404).json({
        message: 'Service not found for this business',
      })
    }

    
    const start = toMin(startTime)
    const endTime = toTime(start + service.duration)

    const clash = await Booking.findOne({
  business: business._id,
  date,
  startTime: { $lt: endTime },
  endTime: { $gt: startTime },

  $or: [
    { status: 'confirmed' },
    {
      status: 'pending',
      pendingExpiresAt: { $gt: new Date() },
    },
  ],
})

    if (clash) {
      return res.status(409).json({
        message: 'Slot is unavailable',
      })
    }

    
    if (
  !Number.isFinite(service.price) ||
  service.price <= 0 ||
  !Number.isFinite(service.duration) ||
  service.duration <= 0
) {
  return res.status(400).json({
    message: 'Invalid service price or duration',
  })
}

    const amount = Math.round(service.price * 100)

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `booking_${new mongoose.Types.ObjectId()}`,
    })

    const receiptToken = createReceiptToken()

const pendingExpiresAt = new Date(Date.now() + 15 * 60 * 1000)

const booking = await Booking.create({
  business: business._id,
  service: service._id,
  customerName,
  customerEmail,
  customerPhone,
  date,
  startTime,
  endTime,
  amount: service.price,
  status: 'pending',
  paymentStatus: 'pending',
  razorpayOrderId: order.id,
  receiptTokenHash: hashReceiptToken(receiptToken),
  pendingExpiresAt,
})

    res.status(201).json({
      bookingId: booking._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      businessName: business.name,
      serviceName: service.name,
      customerName,
      receiptToken,
    })
  } catch (err) {
    console.error('Create order error:', err)
    res.status(500).json({
      message: 'Failed to create payment order',
    })
  }
})




router.post('/verify-payment', async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body

  
    if (
      !bookingId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details.',
      })
    }

    
    const booking = await Booking.findOne({
      _id: bookingId,
      razorpayOrderId: razorpay_order_id,
    })

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking or payment order not found.',
      })
    }

    
    const razorpay = getRazorpay()

    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway is not configured.',
      })
    }

    
    const expectedSignature = crypto
      .createHmac(
        'sha256',
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    // 5. Compare signatures safely
    const expected = Buffer.from(expectedSignature, 'hex')
    const received = Buffer.from(razorpay_signature, 'hex')

    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(expected, received)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed.',
      })
    }

    
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    )

    
    if (
      payment.order_id !== razorpay_order_id ||
      payment.amount !== Math.round(booking.amount * 100) ||
      payment.currency !== 'INR'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Payment details do not match the booking.',
      })
    }

    
    if (payment.status !== 'captured') {
      return res.status(409).json({
        success: false,
        message:
          'Payment has not been captured yet. Please check the payment status again.',
        paymentStatus: payment.status,
      })
    }

    
    if (
      !['pending', 'confirmed'].includes(booking.status)
    ) {
      return res.status(409).json({
        success: false,
        message: 'This booking can no longer be confirmed.',
      })
    }

    
    booking.status = 'confirmed'
    booking.paymentStatus = 'paid'
    booking.razorpayPaymentId = razorpay_payment_id
    booking.pendingExpiresAt = undefined

    await booking.save()

    return res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed!',
      bookingId: booking._id,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
    })
  } catch (error) {
    console.error('Payment verification error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to verify payment. Please check again.',
    })
  }
})




router.get('/', auth, async (req, res) => {
  res.json(await Booking.find({ business: req.businessId }).populate('service').sort({ date: 1, startTime: 1 }))
})



router.patch('/:id', auth, async (req, res) => {
  try {
    const allowedStatuses = ['completed', 'cancelled', 'no-show']
    const { status } = req.body

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Choose completed, cancelled, or no-show.',
      })
    }

    const booking = await Booking.findOneAndUpdate(
      {
        _id: req.params.id,
        business: req.businessId,
        status: 'confirmed',
      },
      { $set: { status } },
      {returnDocument: 'after', runValidators: true }
    )

    if (!booking) {
      return res.status(409).json({
        message: 'Booking not found or its status has already been changed.',
      })
    }

    res.json({
      message: 'Booking status updated successfully',
      booking,
    })
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid booking ID' })
    }

    console.error(err)
    res.status(500).json({ message: 'Failed to update booking status' })
  }
})


export default router