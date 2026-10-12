import mongoose from 'mongoose'

const daySchema = new mongoose.Schema({
  day: Number,          
  open: String,         
  close: String,        
  isOff: { type: Boolean, default: false },
}, { _id: false })

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },   
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  workingHours: {
    type: [daySchema],
    default: [1, 2, 3, 4, 5, 6, 0].map((d) => ({
      day: d, open: '09:00', close: '18:00', isOff: d === 0,
    })),
  },
}, { timestamps: true })

export default mongoose.model('Business', businessSchema)