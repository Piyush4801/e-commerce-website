const mongoose = require('mongoose');
const { getModel } = require('../services/dbService');

const GameHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String },
  gameName: { type: String, enum: ['spin_wheel', 'memory_match'], required: true },
  score: { type: Number, default: 0 },
  coinsEarned: { type: Number, default: 0 },
  playedAt: { type: Date, default: Date.now }
});

module.exports = getModel('GameHistory', GameHistorySchema);
