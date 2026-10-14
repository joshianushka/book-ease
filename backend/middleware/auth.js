import jwt from 'jsonwebtoken'
import redisClient from '../redis.js'

export default async function auth(req, res, next) {
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).json({ message: 'No token' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.businessId = decoded.id
    const isBlacklisted = await redisClient.get(`token:${token}`)
    if (isBlacklisted) {
      return res.status(401).json({ message: 'Token is invalid' })
    }
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}