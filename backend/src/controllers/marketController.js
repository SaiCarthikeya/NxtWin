
import Market from '../models/market.model.js';
import Holding from '../models/holding.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';


export const getAllMarkets = async (req, res) => {
  try {
    const markets = await Market.find({}).sort({ createdAt: -1 });
    res.json(markets);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMarketById = async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);
    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }
    res.json(market);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const resolveMarket = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
      const { marketId, winningOption } = req.body;
      const outcome = winningOption.toUpperCase();

      const market = await Market.findById(marketId).session(session);
      if (!market || market.status === 'RESOLVED') {
          throw new Error('Market not found or already resolved');
      }

      market.status = 'RESOLVED';
      market.outcome = outcome;
      await market.save({ session });

      // Find all holdings with the winning outcome for this market
      const winningHoldings = await Holding.find({ market: marketId, outcome }).session(session);

      // Payout to the winners
      for (const holding of winningHoldings) {
          if (holding.shares > 0) {
              const payout = holding.shares * 10;
              await User.findByIdAndUpdate(holding.user, { $inc: { virtual_balance: payout } }).session(session);
          }
      }
      
      await session.commitTransaction();
      
      const io = req.app.get('io');
      io.emit('market:resolved', {
          marketId,
          winningOption: outcome,
          newStatus: 'RESOLVED',
      });

      res.json({ success: true, message: `Market resolved to ${outcome}` });
  } catch (error) {
      await session.abortTransaction();
      console.error("Resolve Market Error:", error);
      res.status(400).json({ success: false, error: error.message });
  } finally {
      session.endSession();
  }
};