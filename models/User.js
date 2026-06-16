const mongoose = require('mongoose');
const { getModel } = require('../services/dbService');

const AddressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  isDefault: { type: Boolean, default: false }
});

const PaymentMethodSchema = new mongoose.Schema({
  cardType: String,
  lastFour: String,
  expiryDate: String,
  cardHolder: String
});

const AchievementSchema = new mongoose.Schema({
  title: String,
  description: String,
  unlockedAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },

  phone: String,
  mobile: String,
  profileImage: String,
  role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer' },
  status: { type: String, enum: ['pending_verification', 'active', 'suspended'], default: 'active' }, // Default to active
  addresses: [AddressSchema],
  paymentMethods: [PaymentMethodSchema],
  
  // Gamification properties
  rewardPoints: { type: Number, default: 0 },
  tier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
  referralCode: String,
  referredBy: String,
  achievements: [AchievementSchema],

  // Security activity log
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  lastLogin: Date,
  refreshToken: String,
  isVerifiedSeller: { type: Boolean, default: false },
  loginHistory: [{
    device: String,
    browser: String,
    ipAddress: String,
    loginTime: { type: Date, default: Date.now },
    status: String
  }],
  securityAlerts: [{
    title: String,
    message: String,
    severity: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = getModel('User', UserSchema);
