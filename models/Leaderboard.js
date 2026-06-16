const mongoose = require('mongoose');
const { getModel } = require('../services/dbService');

const LeaderboardSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  totalCoinsEarned: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = getModel('Leaderboard', LeaderboardSchema);
