import mongoose from 'mongoose';
import Market from '../models/market.model.js';
import User from '../models/user.model.js';
import Bet from '../models/bet.model.js';

const calculateCost = (poolYes, poolNo, k, shares, outcome) => {
  if (outcome === 'YES') {
    const newPoolYes = poolYes - shares;
    const newPoolNo = k / newPoolYes;
    return newPoolNo - poolNo;
  } else {
    const newPoolNo = poolNo - shares;
    const newPoolYes = k / newPoolNo;
    return newPoolYes - poolYes;
  }
};

export const placeBet = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, marketId, optionChosen, quantity } = req.body;
    const shares = Number(quantity);
    const outcome = optionChosen.toUpperCase();

    const market = await Market.findById(marketId).session(session);
    const user = await User.findById(userId).session(session);

    if (!market || !user) {
      throw new Error('Market or User not found');
    }
    if (market.status !== 'OPEN') {
      throw new Error('Market is closed');
    }

    const { yes: poolYes, no: poolNo, k } = market.liquidityPool;
    const totalCost = calculateCost(poolYes, poolNo, k, shares, outcome);
    
    if (user.virtual_balance < totalCost) {
      throw new Error('Insufficient balance');
    }
    
    if (outcome === 'YES' && shares > poolYes) throw new Error('Not enough YES shares available');
    if (outcome === 'NO' && shares > poolNo) throw new Error('Not enough NO shares available');

    user.virtual_balance -= totalCost;

    if (outcome === 'YES') {
      market.liquidityPool.yes -= shares;
      market.liquidityPool.no += totalCost;
    } else {
      market.liquidityPool.no -= shares;
      market.liquidityPool.yes += totalCost;
    }

    const newBet = new Bet({ user: userId, market: marketId, outcome, shares, cost: totalCost });

    await user.save({ session });
    await market.save({ session });
    await newBet.save({ session });
    
    await session.commitTransaction();

    const io = req.app.get('io');
    const updatedMarket = await Market.findById(marketId);

    io.emit('market-update', {
      marketId: updatedMarket._id,
      newYesPrice: updatedMarket.yes_price,
      newNoPrice: updatedMarket.no_price,
      newYesVolume: updatedMarket.liquidityPool.yes,
      newNoVolume: updatedMarket.liquidityPool.no,
    });
    
    io.emit('user-update', {
      userId: user._id,
      newBalance: user.virtual_balance,
    });

    res.status(201).json({
      success: true,
      newBalance: user.virtual_balance,
      totalCost,
      bet: newBet
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ success: false, error: error.message });
  } finally {
    session.endSession();
  }
};