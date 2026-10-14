import express from 'express';
import dns from 'dns';
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js'
import serviceRoutes from './routes/services.js'
import aiRoutes from './routes/ai.js'
import redisClient from './redis.js';

import publicRoutes from './routes/public.js'
import bookingRoutes from './routes/bookings.js'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/ai', aiRoutes)

const InitializeConnection=async()=>{
  try{
    await redisClient.connect();
    console.log('Redis connected');
  }catch(err){
    console.error('Redis connection error:', err);
  }
  try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  }catch(err){
    console.error('MongoDB connection error:', err);
  }

}


  InitializeConnection().then(() => {
    app.listen(process.env.PORT, () => {
      console.log('Server on ' + process.env.PORT)
    })
  })
  .catch((err) => console.error(err))
