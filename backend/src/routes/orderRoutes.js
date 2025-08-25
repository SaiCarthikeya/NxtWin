import express from 'express';
import { 
    placeOrder, 
    getOrderBookForMarket, 
    getMyOrdersForMarket, 
    getAllMyOrders 
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/place', placeOrder);

// --- THIS IS THE FIX ---
// The more specific routes are now listed BEFORE the general :marketId route.
router.get('/my-orders', getAllMyOrders);
router.get('/my-orders/:marketId/:userId', getMyOrdersForMarket);

// This general route will now only match if the others don't.
router.get('/:marketId', getOrderBookForMarket);

export default router;