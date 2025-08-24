import express from 'express';
import { placeBet } from '../controllers/betController.js';

const router = express.Router();

router.post('/place', placeBet);

export default router;