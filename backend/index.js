import express from 'express';
import dns from 'dns';
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js'
import serviceRoutes from './routes/services.js'
import aiRoutes from './routes/ai.js'

import publicRoutes from './routes/public.js'
import bookingRoutes from './routes/bookings.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/ai', aiRoutes)

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(process.env.PORT, () => {
      console.log('Server on ' + process.env.PORT)
    })
  })
  .catch((err) => console.error(err))
