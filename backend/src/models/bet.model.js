import mongoose from 'mongoose';

const betSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market',
    required: true,
  },
  outcome: {
    type: String,
    enum: ['YES', 'NO'],
    required: true,
  },
  shares: {
    type: Number,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

const Bet = mongoose.model('Bet', betSchema);

export default Bet;