import mongoose from 'mongoose';
import Market from '../models/market.model.js';
import User from '../models/user.model.js';
import Order from '../models/order.model.js';
import Holding from '../models/holding.model.js';

const MAX_PAYOUT = 10;

export const placeOrder = async (req, res) => {
    const { userId, marketId, optionChosen, quantity, price } = req.body;
    const outcome = optionChosen.toUpperCase();
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const market = await Market.findById(marketId).session(session);
        const user = await User.findById(userId).session(session);

        if (!market || market.status !== 'OPEN') throw new Error('Market is not open.');
        if (!user) throw new Error('User not found.');
        
        const totalPotentialCost = quantity * price;
        if (user.virtual_balance < totalPotentialCost) {
            throw new Error('Insufficient funds to cover the entire potential order.');
        }

        const opposingOutcome = outcome === 'YES' ? 'NO' : 'YES';
        const matchingPrice = MAX_PAYOUT - price;

        const matchingOrders = await Order.find({
            market: marketId,
            outcome: opposingOutcome,
            price: { $gte: matchingPrice },
            status: { $in: ['OPEN', 'PARTIALLY_FILLED'] },
        }).sort({ price: -1, createdAt: 1 }).session(session);

        let quantityToFill = quantity;

        for (const match of matchingOrders) {
            if (quantityToFill === 0) break;

            const availableQuantity = match.quantity - match.quantityFilled;
            const tradeQuantity = Math.min(quantityToFill, availableQuantity);
            const tradePrice = MAX_PAYOUT - match.price;
            const tradeValue = tradeQuantity * tradePrice;
            
            const sellerUser = await User.findById(match.user).session(session);

            // Transfer funds from buyer to seller
            await User.findByIdAndUpdate(user._id, { $inc: { virtual_balance: -tradeValue } }, { session });
            await User.findByIdAndUpdate(sellerUser._id, { $inc: { virtual_balance: tradeValue } }, { session });
            
            // Transfer shares
            await Holding.findOneAndUpdate({ user: user._id, market: marketId, outcome }, { $inc: { shares: tradeQuantity } }, { upsert: true, new: true, session });
            await Holding.findOneAndUpdate({ user: sellerUser._id, market: marketId, outcome: opposingOutcome }, { $inc: { shares: -tradeQuantity } }, { upsert: true, new: true, session });
            
            // Update the matched order
            match.quantityFilled += tradeQuantity;
            match.status = match.quantityFilled >= match.quantity ? 'FILLED' : 'PARTIALLY_FILLED';
            await match.save({ session });
            
            quantityToFill -= tradeQuantity;

            // Create a "FILLED" order record for the buyer's history
            const filledOrder = new Order({ user: user._id, market: marketId, outcome, price: tradePrice, quantity: tradeQuantity, quantityFilled: tradeQuantity, status: 'FILLED' });
            await filledOrder.save({ session });
        }

        // If part of the order remains unmatched, create a new open order
        if (quantityToFill > 0) {
            const costOfNewOrder = quantityToFill * price;
            
            // Deduct cost for the new open order from user's balance
            await User.findByIdAndUpdate(user._id, { $inc: { virtual_balance: -costOfNewOrder } }, { session });
            
            // Give the user the opposing shares for their open order
            await Holding.findOneAndUpdate({ user: user._id, market: marketId, outcome: opposingOutcome }, { $inc: { shares: quantityToFill } }, { upsert: true, new: true, session });

            const newOrder = new Order({ user: userId, market: marketId, outcome, price, quantity: quantityToFill, status: 'OPEN' });
            await newOrder.save({ session });
        }

        await session.commitTransaction();

        const io = req.app.get('io');
        const updatedUser = await User.findById(userId);
        io.emit('orderbook:update', { marketId });
        io.emit('user:update', { userId: user._id, newBalance: updatedUser.virtual_balance });

        res.status(201).json({ success: true, message: 'Order processed successfully.' });

    } catch (error) {
        await session.abortTransaction();
        console.error("Place Order Error:", error);
        res.status(400).json({ success: false, error: error.message });
    } finally {
        session.endSession();
    }
};

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