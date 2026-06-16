const mongoose = require('mongoose');
const { getModel } = require('../services/dbService');

const CoinWalletSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = getModel('CoinWallet', CoinWalletSchema);
