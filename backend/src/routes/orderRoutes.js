import express from 'express';
import { placeOrder, getOrderBookForMarket, getMyOrdersForMarket } from '../controllers/orderController.js';

const router = express.Router();

router.post('/place', placeOrder);
router.get('/:marketId', getOrderBookForMarket);
router.get('/my-orders/:marketId/:userId', getMyOrdersForMarket);

export default router;