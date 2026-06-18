const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const FraudReport = require('../models/FraudReport');
const Notification = require('../models/Notification');
const CoinWallet = require('../models/CoinWallet');
const CoinTransaction = require('../models/CoinTransaction');
const Review = require('../models/Review');

const getPlatformAnalytics = async (req, res) => {
  try {
    // 1. Gather counts
    const customersCount = await User.countDocuments({ role: 'customer' });
    const sellersCount = await User.countDocuments({ role: 'seller' });
    const productsCount = await Product.countDocuments({});
    
    const orders = await Order.find({});
    const totalOrdersCount = orders.length;

    // 2. Total platform revenue (only paid orders)
    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.netAmount, 0);

    // 3. Category distribution (Pie Chart Data)
    const categoryCounts = {};
    const categoryRevenues = {};
    const products = await Product.find({});
    
    products.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    orders.filter(o => o.paymentStatus === 'paid').forEach(o => {
      o.items.forEach(item => {
        categoryRevenues[item.ecoScore ? 'Sustainable' : 'Regular'] = 
          (categoryRevenues[item.ecoScore ? 'Sustainable' : 'Regular'] || 0) + (item.price * item.quantity);
      });
    });

    const categoryDistribution = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value
    }));

    // 4. Monthly/Daily Revenue Trend (Line Chart Data)
    // Map past 7 days platform performance
    const dailyAnalytics = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      let dayRev = 0;
      let dayOrdersCount = 0;

      orders.forEach(o => {
        const oDate = new Date(o.createdAt);
        if (oDate.toDateString() === date.toDateString()) {
          dayOrdersCount++;
          if (o.paymentStatus === 'paid') {
            dayRev += o.netAmount;
          }
        }
      });

      dailyAnalytics.push({
        date: label,
        revenue: dayRev,
        orders: dayOrdersCount
      });
    }

    // 5. Seller growth data (Simulate approved vs pending)
    const pendingSellersCount = await User.countDocuments({ role: 'seller', status: 'pending_verification' });
    const activeSellersCount = await User.countDocuments({ role: 'seller', status: 'active' });

    return res.json({
      success: true,
      analytics: {
        customersCount,
        sellersCount: {
          active: activeSellersCount,
          pending: pendingSellersCount,
          total: activeSellersCount + pendingSellersCount
        },
        productsCount,
        totalOrdersCount,
        totalRevenue,
        categoryDistribution,
        dailyAnalytics
      }
    });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Manage Users (Customers & Sellers)
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : { role: { $in: ['customer', 'seller'] } };
    
    const users = await User.find(filter);
    // Remove passwords and attach coin balance
    const safeUsers = await Promise.all(users.map(async u => {
      const wallet = await CoinWallet.findOne({ userId: u._id });
      // If mongoose doc, convert to object
      const uObj = u.toObject ? u.toObject() : u;
      const { password, ...otherInfo } = uObj;
      return {
        ...otherInfo,
        coinBalance: wallet ? wallet.balance : 0
      };
    }));

    return res.json({ success: true, users: safeUsers });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'active', 'suspended', 'pending_verification'
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const updateFields = { status };
    if (status === 'active') {
      updateFields.failedLoginAttempts = 0;
      updateFields.lockUntil = null;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });

    // Notify user of the account update
    let message = `Your account status has been updated to: ${status.toUpperCase()}.`;
    if (status === 'active' && user.role === 'seller') {
      message = `Congratulations! Your seller application has been approved. You can now list products.`;
    }

    await Notification.create({
      userId: userId,
      title: '💼 Account Status Update',
      message,
      type: status === 'active' ? 'success' : 'warning'
    });

    return res.json({ 
      success: true, 
      message: `User status changed to ${status}.`,
      user: { id: updatedUser._id, name: updatedUser.name, role: updatedUser.role, status: updatedUser.status }
    });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Fraud reports operations
const getFraudReports = async (req, res) => {
  try {
    const reports = await FraudReport.find({});
    reports.sort((a, b) => b.riskScore - a.riskScore);
    return res.json({ success: true, reports });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

const reviewFraudReport = async (req, res) => {
  try {
    const { action } = req.body; // 'approve', 'refund', 'suspend'
    const reportId = req.params.id;

    const report = await FraudReport.findById(reportId);
    if (!report) return res.status(404).json({ success: false, message: 'Fraud report not found.' });

    const orderId = report.orderId;

    if (action === 'approve') {
      // Clear flag on order
      await Order.findByIdAndUpdate(orderId, {
        isFlagged: false,
        paymentStatus: 'paid',
        orderStatus: 'confirmed'
      });

      await FraudReport.findByIdAndUpdate(reportId, {
        status: 'resolved',
        actionTaken: 'approved'
      });

      await Notification.create({
        userId: report.customerId,
        title: '✅ Transaction Cleared',
        message: `Your transaction has passed verification. Your order #${orderId.slice(-6)} is now active.`,
        type: 'success'
      });

    } else if (action === 'refund') {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed',
        orderStatus: 'pending',
        isFlagged: true
      });

      await FraudReport.findByIdAndUpdate(reportId, {
        status: 'resolved',
        actionTaken: 'refunded'
      });

      await Notification.create({
        userId: report.customerId,
        title: '❌ Order Cancelled & Refunded',
        message: `Your order #${orderId.slice(-6)} was cancelled and payments refunded.`,
        type: 'error'
      });

    } else if (action === 'suspend') {
      await User.findByIdAndUpdate(report.customerId, { status: 'suspended' });
      await Order.findByIdAndUpdate(orderId, { orderStatus: 'pending' });

      await FraudReport.findByIdAndUpdate(reportId, {
        status: 'resolved',
        actionTaken: 'user_suspended'
      });
    }

    return res.json({ success: true, message: `Fraud report updated with action: ${action.toUpperCase()}` });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

const adjustUserCoins = async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;
    if (!userId || amount === undefined) {
      return res.status(400).json({ success: false, message: 'User ID and amount are required.' });
    }

    let wallet = await CoinWallet.findOne({ userId });
    if (!wallet) {
      wallet = await CoinWallet.create({ userId, balance: 100 }); // default balance
    }

    const oldBalance = wallet.balance;
    const newBalance = Math.max(0, oldBalance + parseInt(amount));

    wallet.balance = newBalance;
    wallet.updatedAt = new Date().toISOString();
    await wallet.save();

    // Log loyalty transaction
    await CoinTransaction.create({
      userId,
      amount: parseInt(amount),
      type: amount >= 0 ? 'earned' : 'spent',
      reason: reason || `Admin adjustment (Old Bal: ${oldBalance}, New Bal: ${newBalance})`
    });

    // Notify user
    await Notification.create({
      userId,
      title: '🪙 Coins Balance Adjusted',
      message: `An administrator has adjusted your loyalty coins by ${amount >= 0 ? '+' : ''}${amount} coins. Your new balance is ${newBalance}.`,
      type: 'info'
    });

    return res.json({
      success: true,
      message: `Successfully adjusted coins for user. New Balance: ${newBalance}`,
      balance: newBalance
    });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({});
    // Attach product information if we can
    const enrichedReviews = await Promise.all(reviews.map(async r => {
      const prod = await Product.findById(r.productId);
      const rObj = r.toObject ? r.toObject() : r;
      return {
        ...rObj,
        productName: prod ? prod.name : 'Unknown Product'
      };
    }));
    return res.json({ success: true, reviews: enrichedReviews });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({});
    // Sort descending by created date
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ success: true, orders });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

module.exports = {
  getPlatformAnalytics,
  getUsers,
  updateUserStatus,
  getFraudReports,
  reviewFraudReport,
  adjustUserCoins,
  getAllReviews,
  getAllOrders
};
