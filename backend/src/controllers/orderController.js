import mongoose from 'mongoose';
import Market from '../models/market.model.js';
import User from '../models/user.model.js';
import Order from '../models/order.model.js';
import Holding from '../models/holding.model.js';

const MAX_PAYOUT = 10;

const executeTrade = async (buyer, seller, tradePrice, tradeQuantity, market, outcome, session) => {
    const tradeValue = tradeQuantity * tradePrice;

    await User.findByIdAndUpdate(buyer._id, { $inc: { virtual_balance: -tradeValue } }, { session });
    await User.findByIdAndUpdate(seller._id, { $inc: { virtual_balance: tradeValue } }, { session });

    await Holding.findOneAndUpdate(
        { user: buyer._id, market: market._id, outcome },
        { $inc: { shares: tradeQuantity } },
        { upsert: true, new: true, session }
    );
    await Holding.findOneAndUpdate(
        { user: seller._id, market: market._id, outcome },
        { $inc: { shares: -tradeQuantity } },
        { session }
    );
};

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

    const cost = quantity * price;
    if (user.virtual_balance < cost) throw new Error('Insufficient funds.');

    user.virtual_balance -= cost;
    await user.save({ session });

    const opposingOutcome = outcome === 'YES' ? 'NO' : 'YES';
    const matchingPrice = MAX_PAYOUT - price;

    const matchingOrders = await Order.find({
      market: marketId,
      outcome: opposingOutcome,
      price: { $gte: matchingPrice },
      status: 'OPEN',
      user: { $ne: userId }
    }).sort({ price: -1, createdAt: 1 }).session(session);

    let quantityToFill = quantity;

    for (const match of matchingOrders) {
      if (quantityToFill === 0) break;

      const tradeQuantity = Math.min(quantityToFill, match.quantity - match.quantityFilled);
      const sellerPrice = MAX_PAYOUT - match.price;
      const tradeValue = tradeQuantity * sellerPrice;

      const seller = await User.findById(match.user).session(session);

      await User.findByIdAndUpdate(user._id, { $inc: { virtual_balance: tradeValue } }, { session });
      await User.findByIdAndUpdate(seller._id, { $inc: { virtual_balance: -tradeValue } }, { session });

      await Holding.findOneAndUpdate({ user: user._id, market: marketId, outcome }, { $inc: { shares: tradeQuantity } }, { upsert: true, session });
      await Holding.findOneAndUpdate({ user: seller._id, market: marketId, outcome: opposingOutcome }, { $inc: { shares: -tradeQuantity } }, { session });

      match.quantityFilled += tradeQuantity;
      if (match.quantityFilled >= match.quantity) {
        match.status = 'FILLED';
      }
      await match.save({ session });
      quantityToFill -= tradeQuantity;
    }

    if (quantityToFill > 0) {
      const newOrder = new Order({ user: userId, market: marketId, outcome, price, quantity: quantityToFill });
      await newOrder.save({ session });
    }

    await session.commitTransaction();

    const io = req.app.get('io');
    const updatedUser = await User.findById(userId);
    io.emit('orderbook:update', { marketId });
    io.emit('user:update', { userId: user._id, newBalance: updatedUser.virtual_balance });

    res.status(201).json({ success: true, message: 'Order placed successfully.' });

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, error: error.message });
  } finally {
    session.endSession();
  }
};

export const getOrderBookForMarket = async (req, res) => {
    try {
        const { marketId } = req.params;
        const orders = await Order.find({ market: marketId, status: 'OPEN' }).sort({ price: -1 });

        const orderBook = {
            YES: orders.filter(o => o.outcome === 'YES'),
            NO: orders.filter(o => o.outcome === 'NO'),
        };

        res.json(orderBook);
    } catch (error) {
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