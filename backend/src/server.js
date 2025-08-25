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


const allowedOrigins = [
    "http://localhost:5173",         // Your local frontend for development
    "https://nxt-win-ten.vercel.app"  // Your deployed frontend on Vercel
];

const corsOptions = {
    origin: allowedOrigins
};

// Apply the CORS options to both Express and Socket.IO
app.use(cors(corsOptions));

const io = new Server(httpServer, {
  cors: corsOptions
});


app.set('io', io);
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