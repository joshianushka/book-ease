import jwt from 'jsonwebtoken'

export default function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ message: 'No token' })
  try {
    const token = header.split(' ')[1]
    req.businessId = jwt.verify(token, process.env.JWT_SECRET).id
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}
//"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhY2NlMGNhOWU2YmM1ODViZjg5NTE5YSIsImlhdCI6MTc5MTgxNDcxMCwiZXhwIjoxNzkyNDE5NTEwfQ.Ypu6ahHU-WObNtG6dqehStkgJLubJbsUA3tF_0EkIVk"