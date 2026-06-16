const FraudReport = require('../models/FraudReport');
const Notification = require('../models/Notification');
const Order = require('../models/Order');

const evaluateTransaction = async (orderData, userContext = {}) => {
  const triggers = [];
  let score = 0;

  // Trigger 1: High Value purchase (Limit ₹50,000)
  if (orderData.totalAmount > 50000) {
    triggers.push('HIGH_VALUE_TRANSACTION');
    score += 45;
  }

  // Trigger 2: Velocity check (Multiple orders in short span)
  if (orderData.customerId) {
    // Count orders in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentOrdersCount = await Order.countDocuments({
      customerId: orderData.customerId,
      createdAt: { $gte: fiveMinutesAgo.toISOString() }
    });

    if (recentOrdersCount >= 2) {
      triggers.push('HIGH_FREQUENCY_VELOCITY');
      score += 35;
    }
  }

  // Trigger 3: Simulated payment failures
  if (userContext.failedPaymentAttempts && userContext.failedPaymentAttempts >= 3) {
    triggers.push('MULTIPLE_FAILED_PAYMENTS');
    score += 25;
  }

  // Trigger 4: Extreme Transaction size (over ₹100,000)
  if (orderData.totalAmount > 100000) {
    triggers.push('CRITICAL_LIMIT_EXCEEDED');
    score += 20;
  }

  // Bound score at 100
  const finalScore = Math.min(score, 100);

  let isFlagged = finalScore >= 50;

  if (isFlagged) {
    // Create Fraud Report
    const report = await FraudReport.create({
      orderId: orderData._id || 'temp_' + Math.random().toString(36).substring(2, 9),
      customerId: orderData.customerId,
      customerEmail: orderData.customerEmail || 'unknown@example.com',
      totalAmount: orderData.totalAmount,
      riskScore: finalScore,
      triggers,
      status: 'pending'
    });

    // Notify admins
    await Notification.create({
      userId: 'admin',
      title: '🚨 Fraud Risk Alert!',
      message: `A high risk transaction (Score: ${finalScore}%) was flagged for User ${orderData.customerEmail || orderData.customerId}. Triggers: ${triggers.join(', ')}.`,
      type: 'error'
    });
  }

  return {
    riskScore: finalScore,
    isFlagged,
    triggers
  };
};

module.exports = {
  evaluateTransaction
};
