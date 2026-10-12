import { Router } from 'express'
import auth from '../middleware/auth.js'
import Service from '../models/Service.js'

const router = Router()
router.use(auth)

router.get('/', async (req, res) => {
  res.json(await Service.find({ business: req.businessId }))
})

router.post('/', async (req, res) => {
  const service = await Service.create({ ...req.body, business: req.businessId })
  res.status(201).json(service)
})

router.delete('/:id', async (req, res) => {
  await Service.deleteOne({ _id: req.params.id, business: req.businessId })
  res.json({ message: 'Deleted' })
})

export default router