import { Router } from 'express'
import auth from '../middleware/auth.js'

const router = Router()

router.post('/describe', auth, async (req, res) => {
  const { serviceName } = req.body

  res.json({
    description: `Experience our ${serviceName} service, delivered with care and attention to detail. We focus on quality and customer satisfaction to give you a relaxing and enjoyable experience.`,
  })
})

export default router