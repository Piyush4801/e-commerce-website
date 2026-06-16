const mongoose = require('mongoose');
const { getModel } = require('../services/dbService');

const ReviewSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: '' },
  comment: { type: String, required: true },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = getModel('Review', ReviewSchema);
