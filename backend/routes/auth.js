import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Business from '../models/Business.js'
import validator from 'validator'
import redisClient from '../redis.js'
import userAuth from '../middleware/auth.js'

const router = Router()
const makeToken = (id) =>jwt.sign(
    { id: id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '30m' }
  )


router.post('/register', async (req, res) => {
  try {
    const { name, slug, email, password } = req.body
    if (!name || !slug || !email || !password)
      return res.status(400).json({ message: 'All fields required' })

    if(!validator.isEmail(email)) return res.status(400).json({ message: 'Invalid email' })

    const exists = await Business.findOne({ $or: [{ email }, { slug }] })
    if (exists) return res.status(400).json({ message: 'Email or URL already taken' })

    const hashed = await bcrypt.hash(password, 10)
    const business = await Business.create({
      name, slug: slug.toLowerCase().trim(), email, password: hashed,
    })
    res.status(201).json({ message: 'Registration successful. Please log in.' })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
})

router.post('/login', async (req, res) => {
  try{
  const { email, password } = req.body
  const business = await Business.findOne({ email })
  if (!business || !(await bcrypt.compare(password, business.password)))
    return res.status(400).json({ message: 'Wrong email or password' })

  const token = makeToken(business._id)

  res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60 * 1000
    })

  res.json({
    message: 'Logged in successfully',
    business: { id: business._id, name: business.name, slug: business.slug },
  })
}catch (e) {
  res.status(500).json({ message: e.message });
}
})

router.post('/logout', userAuth, async (req, res) => {

  const{token}=req.cookies;
  const payload=jwt.decode(token);
  if(!payload){
    return res.status(400).json({message:'Invalid token'})
  }

  await redisClient.set(`token:${token}`,"Blacklisted");
  await redisClient.expireAt(`token:${token}`,payload.exp);

  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
  res.json({ message: 'Logged out successfully' })
})

export default router;
