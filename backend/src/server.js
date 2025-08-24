import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import initializeSocket from './sockets/socketHandler.js';
import marketRoutes from './routes/marketRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// Make io accessible to our routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/markets', marketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// Initialize socket.io event handlers
initializeSocket(io);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));