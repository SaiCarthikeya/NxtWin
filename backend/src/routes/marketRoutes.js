import express from 'express';
import { getAllMarkets, getMarketById, resolveMarket } from '../controllers/marketController.js';

const router = express.Router();

router.get('/', getAllMarkets);
router.get('/:id', getMarketById);
router.post('/resolve', resolveMarket);

export default router;