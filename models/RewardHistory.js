const mongoose = require('mongoose');
const { getModel } = require('../services/dbService');

const RewardHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  rewardType: { type: String, required: true },
  rewardValue: { type: String, required: true },
  receivedAt: { type: Date, default: Date.now }
});

module.exports = getModel('RewardHistory', RewardHistorySchema);
