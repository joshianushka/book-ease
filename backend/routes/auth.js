import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Business from '../models/Business.js'

const router = Router()
const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

router.post('/register', async (req, res) => {
  try {
    const { name, slug, email, password } = req.body
    if (!name || !slug || !email || !password)
      return res.status(400).json({ message: 'All fields required' })

    const exists = await Business.findOne({ $or: [{ email }, { slug }] })
    if (exists) return res.status(400).json({ message: 'Email or URL already taken' })

    const hashed = await bcrypt.hash(password, 10)
    const business = await Business.create({
      name, slug: slug.toLowerCase().trim(), email, password: hashed,
    })
    res.status(201).json({ token: makeToken(business._id), business: { id: business._id, name, slug } })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const business = await Business.findOne({ email })
  if (!business || !(await bcrypt.compare(password, business.password)))
    return res.status(400).json({ message: 'Wrong email or password' })
  res.json({
    token: makeToken(business._id),
    business: { id: business._id, name: business.name, slug: business.slug },
  })
})

export default router;