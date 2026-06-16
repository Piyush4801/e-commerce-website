const mongoose = require('mongoose');
const { getModel } = require('../services/dbService');

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // 'all' or specific User ID
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = getModel('Notification', NotificationSchema);
