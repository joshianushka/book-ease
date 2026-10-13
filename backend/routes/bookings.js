import { Router } from 'express'
import auth from '../middleware/auth.js'
import Business from '../models/Business.js'
import Service from '../models/Service.js'
import Booking from '../models/Booking.js'
import { sendMail } from '../utils/mailer.js'

const router = Router()
const toMin = (t) => parseInt(t.slice(0, 2)) * 60 + parseInt(t.slice(3))
const toTime = (m) =>
  String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')


router.post('/', async (req, res) => {
  const { slug, serviceId, date, startTime, customerName, customerEmail, customerPhone } = req.body
  const business = await Business.findOne({ slug })
  if (!business) {
  return res.status(404).json({ message: 'Business not found' })
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
  const endTime = toTime(toMin(startTime) + service.duration)

  
  const clash = await Booking.findOne({
    business: business._id, date, status: 'confirmed',
    startTime: { $lt: endTime }, endTime: { $gt: startTime },
  })
  if (clash) return res.status(409).json({ message: 'Slot just got taken, pick another' })

  const booking = await Booking.create({
    business: business._id, service: service._id,
    customerName, customerEmail, customerPhone, date, startTime, endTime,
  })

  sendMail(customerEmail, `Booking confirmed at ${business.name}`,
    `<h2>Hi ${customerName}!</h2><p>${service.name} on ${date} at ${startTime}.</p>`)
  sendMail(business.email, 'New booking',
    `<p>${customerName} booked ${service.name} on ${date} at ${startTime}.</p>`)

  res.status(201).json(booking)
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