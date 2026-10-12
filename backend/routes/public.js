import { Router } from 'express'
import Business from '../models/Business.js'
import Service from '../models/Service.js'
import Booking from '../models/Booking.js'
import { generateSlots } from '../utils/slots.js'

const router = Router()


router.get('/:slug', async (req, res) => {
  const business = await Business.findOne({ slug: req.params.slug }).select('name slug')
  if (!business) return res.status(404).json({ message: 'Business not found' })
  const services = await Service.find({ business: business._id })
  res.json({ business, services })
})


router.get('/:slug/slots', async (req, res) => {
  const { serviceId, date } = req.query
  const business = await Business.findOne({ slug: req.params.slug })
  const service = await Service.findById(serviceId)
  if (!business || !service) return res.status(404).json({ message: 'Not found' })

  const bookings = await Booking.find({ business: business._id, date, status: 'confirmed' })
  const slots = generateSlots({
    workingHours: business.workingHours, date, duration: service.duration, bookings,
  })
  res.json(slots)
})

export default router