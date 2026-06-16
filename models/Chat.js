const mongoose = require('mongoose');
const { getModel } = require('../services/dbService');

const ChatSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  sellerId: { type: String, required: true },
  sellerName: { type: String, required: true },
  lastMessage: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = getModel('Chat', ChatSchema);
