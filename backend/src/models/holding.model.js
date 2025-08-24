import mongoose from 'mongoose';

const holdingSchema = new mongoose.Schema({
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
    default: 0,
  },
});

holdingSchema.index({ user: 1, market: 1, outcome: 1 }, { unique: true });

const Holding = mongoose.model('Holding', holdingSchema);

export default Holding;