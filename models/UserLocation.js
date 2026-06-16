const mongoose = require('mongoose');
const { getModel } = require('../services/dbService');

const UserLocationSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  address: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = getModel('UserLocation', UserLocationSchema);
