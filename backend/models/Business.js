import mongoose from 'mongoose'

const daySchema = new mongoose.Schema({
  day: Number,          
  open: String,         
  close: String,        
  isOff: { type: Boolean, default: false },
}, { _id: false })

const businessSchema = new mongoose.Schema({
 name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    minlength: [2, 'Business name must contain at least 2 characters'],
    maxlength: [80, 'Business name cannot exceed 80 characters'],
  },
  slug: {
    type: String,
    required: [true, 'Business URL is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'URL must contain lowercase letters, numbers, and single hyphens only',
    ],
  },

  
 email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address'],
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
  },

  workingHours: {
    type: [daySchema],
    default: [1, 2, 3, 4, 5, 6, 0].map((d) => ({
      day: d, open: '09:00', close: '18:00', isOff: d === 0,
    })),
  },
}, { timestamps: true })

export default mongoose.model('Business', businessSchema)

