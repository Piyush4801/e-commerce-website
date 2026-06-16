const mongoose = require('mongoose');
const { getModel } = require('../services/dbService');

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['percentage', 'flat', 'festival', 'new_user'], required: true },
  value: { type: Number, required: true }, // e.g. 10 for 10% or 150 for ₹150 flat
  minPurchase: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  expiryDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = getModel('Coupon', CouponSchema);
