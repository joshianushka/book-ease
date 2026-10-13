import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  name: {
  type: String,
  required: [true, 'Service name is required'],
  trim: true,
  minlength: [2, 'Service name must contain at least 2 characters'],
  maxlength: [100, 'Service name cannot exceed 100 characters'],
},

  description: {
  type: String,
  trim: true,
  maxlength: [500, 'Description cannot exceed 500 characters'],
},

  price: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true,min:1},   
}, { timestamps: true })

export default mongoose.model('Service', serviceSchema)

