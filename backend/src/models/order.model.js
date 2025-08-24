import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
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
  price: {
    type: Number,
    required: true,
    min: 0.01,
    max: 9.99,
  },
  quantity: {
    type: Number,
    required: true,
  },
  quantityFilled: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['OPEN', 'FILLED', 'CANCELLED'],
    default: 'OPEN',
  },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;