import mongoose from 'mongoose';

const marketSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['OPEN', 'RESOLVED'],
    default: 'OPEN',
  },
  outcome: {
    type: String,
    enum: ['YES', 'NO', 'UNDETERMINED'],
    default: 'UNDETERMINED',
  },
}, {
  timestamps: true,
});

const Market = mongoose.model('Market', marketSchema);

export default Market;