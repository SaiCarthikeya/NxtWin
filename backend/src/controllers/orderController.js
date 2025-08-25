import mongoose from 'mongoose';
import Market from '../models/market.model.js';
import User from '../models/user.model.js';
import Order from '../models/order.model.js';

const MAX_PAYOUT = 10;
export const getAllMyOrders = async (req, res) => {
    try {
        // Find the user in our database using the clerkId from the authenticated session
        const user = await User.findOne({ clerkId: req.auth.userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find all orders for that user and populate the 'market' field
        // to include details like the market question.
        const orders = await Order.find({ user: user._id })
            .populate('market', 'question') // This line adds the market question to each order
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error("Error in getAllMyOrders:", error);
        res.status(500).json({ error: 'Server error' });
    }
};


export const placeOrder = async (req, res) => {
    const { userId, marketId, optionChosen, quantity, price } = req.body;
    const outcome = optionChosen.toUpperCase();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const market = await Market.findById(marketId).session(session);
        const taker = await User.findById(userId).session(session);

        if (!market || market.status !== 'OPEN') throw new Error('Market is not open.');
        if (!taker) throw new Error('User not found.');

        const opposingOutcome = outcome === 'YES' ? 'NO' : 'YES';
        const matchingPrice = parseFloat((MAX_PAYOUT - price).toFixed(2));

        // --- THIS IS THE FIX ---
        // The query now looks for an EXACT price match, not less than or equal to.
        const matchingOrders = await Order.find({
            market: marketId,
            outcome: opposingOutcome,
            price: matchingPrice, // Changed from { $lte: matchingPrice }
            status: { $in: ['OPEN', 'PARTIALLY_FILLED'] },
        }).sort({ createdAt: 1 }).session(session); // Sort by oldest first

        let quantityToFill = Number(quantity);

        for (const makerOrder of matchingOrders) {
            if (quantityToFill === 0) break;

            const maker = await User.findById(makerOrder.user).session(session);
            const availableQuantity = makerOrder.quantity - makerOrder.quantityFilled;
            const tradeQuantity = Math.min(quantityToFill, availableQuantity);
            
            const takerTradeValue = tradeQuantity * price;
            const makerTradeValue = tradeQuantity * makerOrder.price;

            if (taker.virtual_balance < takerTradeValue) {
                throw new Error('Insufficient funds for this trade.');
            }

            // Execute Trade
            await User.findByIdAndUpdate(taker._id, { $inc: { virtual_balance: -takerTradeValue } }, { session });
            await User.findByIdAndUpdate(maker._id, { $inc: { virtual_balance: makerTradeValue } }, { session });
            
            // Update the maker's (existing) order
            makerOrder.quantityFilled += tradeQuantity;
            makerOrder.status = makerOrder.quantityFilled >= makerOrder.quantity ? 'FILLED' : 'PARTIALLY_FILLED';
            await makerOrder.save({ session });
            
            // Create a FILLED order for the taker's history
            const takerFilledOrder = new Order({ user: taker._id, market: marketId, outcome, price, quantity: tradeQuantity, quantityFilled: tradeQuantity, status: 'FILLED' });
            await takerFilledOrder.save({ session });
            
            quantityToFill -= tradeQuantity;
        }

        // If part of the order remains unmatched, create a new OPEN order
        if (quantityToFill > 0) {
            const costOfNewOrder = quantityToFill * price;
            if (taker.virtual_balance < costOfNewOrder) throw new Error('Insufficient funds for remaining part of order.');

            await User.findByIdAndUpdate(taker._id, { $inc: { virtual_balance: -costOfNewOrder } }, { session });
            const newOpenOrder = new Order({ user: userId, market: marketId, outcome, price, quantity: quantityToFill, status: 'OPEN' });
            await newOpenOrder.save({ session });
        }

        await session.commitTransaction();

        const io = req.app.get('io');
        const updatedTaker = await User.findById(userId);
        io.emit('orderbook:update', { marketId });
        io.emit('user:update', { userId: updatedTaker._id, newBalance: updatedTaker.virtual_balance });
        
        for (const makerOrder of matchingOrders) {
            if(makerOrder.isModified()){
                const updatedMaker = await User.findById(makerOrder.user);
                io.emit('user:update', { userId: updatedMaker._id, newBalance: updatedMaker.virtual_balance });
            }
        }

        res.status(201).json({ success: true, message: 'Order processed successfully.' });

    } catch (error) {
        await session.abortTransaction();
        console.error("Place Order Error:", error);
        res.status(400).json({ success: false, error: error.message });
    } finally {
        session.endSession();
    }
};

// ... keep getOrderBookForMarket and getMyOrdersForMarket
export const getOrderBookForMarket = async (req, res) => {
    try {
        const { marketId } = req.params;
        const orders = await Order.find({ market: marketId, status: { $in: ['OPEN', 'PARTIALLY_FILLED'] } }).sort({ price: -1 });

        const orderBook = {
            YES: orders.filter(o => o.outcome === 'YES'),
            NO: orders.filter(o => o.outcome === 'NO'),
        };

        res.json(orderBook);
    } catch (error) {
        console.error("Error in getOrderBookForMarket:", error);
        res.status(500).json({ success: false, error: 'Failed to fetch order book.' });
    }
};

export const getMyOrdersForMarket = async (req, res) => {
    try {
        const { marketId, userId } = req.params;
        const myOrders = await Order.find({ market: marketId, user: userId })
            .sort({ createdAt: -1 });
        res.json(myOrders);
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch user orders.' });
    }
};