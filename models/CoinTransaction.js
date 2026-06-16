const mongoose = require('mongoose');
const { getModel } = require('../services/dbService');

const CoinTransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['earn', 'redeem', 'admin_add', 'admin_remove'], required: true },
  reason: { type: String, required: true },
  orderId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = getModel('CoinTransaction', CoinTransactionSchema);
