const mongoose = require('mongoose');
const { getModel } = require('../services/dbService');

const FraudReportSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  customerId: { type: String, required: true },
  customerEmail: String,
  totalAmount: Number,
  riskScore: { type: Number, required: true }, // 0 to 100
  triggers: [{ type: String }], // e.g. ["HIGH_VALUE_TRANSACTION", "FAILED_PAYMENTS_VELOCITY"]
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
  actionTaken: { type: String, enum: ['none', 'approved', 'refunded', 'user_suspended'], default: 'none' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = getModel('FraudReport', FraudReportSchema);
