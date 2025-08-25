// src/models/user.model.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  virtual_balance: { type: Number, default: 5000 },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;