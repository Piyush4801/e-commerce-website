const mongoose = require('mongoose');
const { getModel } = require('../services/dbService');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  sellerId: { type: String, required: true },
  ecoScore: String
});

const TimelineEventSchema = new mongoose.Schema({
  status: { type: String, required: true },
  description: String,
  timestamp: { type: Date, default: Date.now }
});

const OrderSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  customerName: String,
  customerEmail: String,
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  carbonOffsetFee: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  couponCode: String,
  
  paymentMethod: { type: String, enum: ['upi', 'card', 'wallet', 'netbanking', 'cod', 'debit'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'],
    default: 'pending'
  },
  
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  trackingTimeline: [TimelineEventSchema],
  
  // Fraud detection results
  fraudRiskScore: { type: Number, default: 0 },
  isFlagged: { type: Boolean, default: false },
  fraudTriggers: [String],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = getModel('Order', OrderSchema);
