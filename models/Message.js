const mongoose = require('mongoose');
const { getModel } = require('../services/dbService');

const MessageSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = getModel('Message', MessageSchema);
