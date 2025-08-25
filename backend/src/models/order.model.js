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
    // Added PARTIALLY_FILLED to the enum
    enum: ['OPEN', 'FILLED', 'CANCELLED', 'PARTIALLY_FILLED'],
    default: 'OPEN',
  },
}, { timestamps: true });

// --- ADD THESE INDEXES ---

// 1. Compound Index for the Matching Engine
// This is the most important index. It makes finding matching orders for a trade extremely fast.
// It tells Mongo to pre-sort orders by market, then outcome, then status, and finally by price.
orderSchema.index({ market: 1, outcome: 1, status: 1, price: 1 });

// 2. Index for Finding a User's Orders
// This speeds up fetching all orders for the "Your Orders" page.
orderSchema.index({ user: 1 });


const Order = mongoose.model('Order', orderSchema);

export default Order;
