import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true,min:1},   
}, { timestamps: true })

export default mongoose.model('Service', serviceSchema)