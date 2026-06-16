const mongoose = require('mongoose');
const { getModel } = require('../services/dbService');

const SupportTicketSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['order', 'refund', 'coins', 'general'], default: 'general' },
  orderId: { type: String },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = getModel('SupportTicket', SupportTicketSchema);
