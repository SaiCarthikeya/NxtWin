import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  virtual_balance: {
    type: Number,
    required: true,
    default: 1000,
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;