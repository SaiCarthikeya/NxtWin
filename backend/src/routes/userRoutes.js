import express from 'express';
import { registerUser, getUserByClerkId, syncUser } from '../controllers/userController.js';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

const router = express.Router();
router.post('/sync', syncUser);

// PUBLIC ROUTE: This route is for the Clerk webhook to create a user.
// We will handle it separately if needed, but the manual register is better for the hackathon.

// PROTECTED ROUTE: This is for creating a user in our DB after they sign up.
router.post('/register', ClerkExpressRequireAuth(), registerUser);

// PROTECTED ROUTE: This gets the logged-in user's data from our DB.
router.get('/me', ClerkExpressRequireAuth(), getUserByClerkId);

export default router;