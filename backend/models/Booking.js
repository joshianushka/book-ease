import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: String,
  date: { type: String, required: true },        
  startTime: { type: String, required: true },   
  endTime: { type: String, required: true },     
  status: { type: String, enum: ['confirmed', 'pending', 'cancelled', 'completed', 'no-show'], default: 'pending' },
  paymentStatus: { type: String, enum: ['free', 'pending', 'paid','failed'], default: 'free' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  amount: {
  type: Number,
  required: true,
  min: [0, 'Amount must be a positive number'],
},
receiptTokenHash: {
  type: String,
  unique: true,
  sparse: true,
},
},
{ timestamps: true })

export default mongoose.model('Booking', bookingSchema)

