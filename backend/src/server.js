import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

import connectDB from './config/db.js';
import initializeSocket from './sockets/socketHandler.js';
import marketRoutes from './routes/marketRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});

app.set('io', io);
app.use(cors());
app.use(express.json());


// All routes below this line will be protected.
app.use(ClerkExpressRequireAuth());

// These routes are now correctly placed AFTER the auth middleware.
app.use('/api/markets', marketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);


initializeSocket(io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));