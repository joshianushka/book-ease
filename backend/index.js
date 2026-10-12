import express from 'express';
import dns from 'dns';
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(process.env.PORT, () => console.log('Server on ' + process.env.PORT))
  })
  .catch((err) => console.error(err))