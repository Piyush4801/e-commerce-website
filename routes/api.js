const express = require('express');
const router = express.Router();


const { authenticate, authorize } = require('../middleware/auth');

// Controllers
const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController');
const sellerController = require('../controllers/sellerController');
const adminController = require('../controllers/adminController');
const hackathonController = require('../controllers/hackathonController');
const rateLimit = require('express-rate-limit');

const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per `window`
  message: { success: false, message: 'Too many requests, please try again later.' }
});

// Models
const Notification = require('../models/Notification');

// Parameter validations to prevent invalid ObjectId CastErrors
const { isValidId } = require('../services/dbService');
const validateParamId = (paramName) => {
  return (req, res, next, val) => {
    if (!isValidId(val)) {
      return res.status(400).json({ success: false, message: `Invalid ${paramName} format.` });
    }
    next();
  };
};

router.param('id', validateParamId('id'));
router.param('productId', validateParamId('productId'));
router.param('chatId', validateParamId('chatId'));
router.param('ticketId', validateParamId('ticketId'));
router.param('addressId', validateParamId('addressId'));

// ==========================================
// 1. AUTHENTICATION & PROFILE ROUTES
// ==========================================
const upload = require('../middleware/upload');

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.post('/auth/refresh', authController.refresh);
router.post('/auth/logout', authController.logout);


// Protected Auth Profiles
router.get('/auth/profile', authenticate, authController.getProfile);
router.put('/auth/profile', authenticate, authController.updateProfile);
router.post('/auth/address', authenticate, authController.addAddress);
router.delete('/auth/address/:addressId', authenticate, authController.deleteAddress);
router.get('/auth/login-history', authenticate, authController.getLoginHistory);
router.get('/auth/security-alerts', authenticate, authController.getSecurityAlerts);

// Secure file upload route
router.post('/upload', authenticate, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    
    // Auto update user profile image
    const User = require('../models/User');
    User.findByIdAndUpdate(req.user._id, { $set: { profileImage: fileUrl } })
      .then(() => {
        res.json({ success: true, message: 'File uploaded and profile image updated.', fileUrl });
      })
      .catch(next);
  });
});

// Admin Security & Platform Logs
router.get('/admin/security-dashboard', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    const User = require('../models/User');
    const users = await User.find({});
    
    let totalActiveUsers = 0;
    let totalFailedAttempts = 0;
    let lockedAccounts = [];
    let allAlerts = [];
    let recentLogins = [];
    
    const now = new Date();
    
    for (let u of users) {
      totalFailedAttempts += u.failedLoginAttempts || 0;
      
      if (u.lockUntil && new Date(u.lockUntil) > now) {
        lockedAccounts.push({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          lockUntil: u.lockUntil
        });
      }
      
      if (u.securityAlerts && u.securityAlerts.length > 0) {
        allAlerts.push(...u.securityAlerts.map(a => ({
          ...a,
          userId: u._id,
          userName: u.name,
          userEmail: u.email
        })));
      }
      
      if (u.loginHistory && u.loginHistory.length > 0) {
        recentLogins.push(...u.loginHistory.map(h => ({
          ...h,
          userId: u._id,
          userName: u.name,
          userEmail: u.email
        })));
        
        const hasRecentSuccess = u.loginHistory.some(h => 
          h.status === 'success' && 
          (now - new Date(h.loginTime)) < 24 * 60 * 60 * 1000
        );
        if (hasRecentSuccess) {
          totalActiveUsers++;
        }
      }
    }
    
    allAlerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    recentLogins.sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime));
    
    return res.json({
      success: true,
      stats: {
        totalUsersCount: users.length,
        totalActiveUsers,
        totalFailedAttempts,
        lockedAccountsCount: lockedAccounts.length,
        lockedAccounts,
        allAlerts: allAlerts.slice(0, 15),
        recentLogins: recentLogins.slice(0, 15)
      }
    });
  } catch (err) {
    next(err);
  }
});

// Admin Update Seller Verification
router.put('/admin/sellers/:id/verify', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(req.params.id, { $set: { isVerifiedSeller: req.body.isVerified } }, { new: true });
    return res.json({ success: true, message: 'Seller verification status updated successfully.', user });
  } catch (err) {
    next(err);
  }
});

// Seller Activity Logs
router.get('/seller/activity-logs', authenticate, authorize(['seller']), async (req, res, next) => {
  try {
    const Product = require('../models/Product');
    const products = await Product.find({});
    
    // filter products by this seller name
    const sellerProducts = products.filter(p => p.sellerName?.includes('Vendor Elite') || p.sellerId === req.user._id);
    
    const logs = sellerProducts.map(p => ({
      activity: `Inventory product updated: ${p.name} (Stock: ${p.stock || 0}, Price: ₹${p.price})`,
      timestamp: p.updatedAt || p.createdAt || new Date().toISOString(),
      status: 'success'
    }));
    
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 2. PRODUCT MANAGEMENT & SEARCH ROUTES
// ==========================================
router.get('/products', productController.getProducts);
router.post('/products/ai/conversational', aiRateLimiter, productController.searchConversational);
router.get('/products/ai/recommendations', authenticate, productController.getRecommendations);

router.get('/products/:id', productController.getProductById);
router.get('/products/:productId/similar', productController.getSimilar);
router.get('/products/:productId/bought-together', productController.getBoughtTogether);

// Seller / Admin Product Operations
router.post('/products/seller/create', authenticate, authorize(['seller', 'admin']), productController.createProduct);
router.put('/products/:id/update', authenticate, authorize(['seller', 'admin']), productController.updateProduct);
router.delete('/products/:id/delete', authenticate, authorize(['seller', 'admin']), productController.deleteProduct);

// Product Reviews
router.get('/products/:productId/reviews', productController.getReviews);
router.post('/products/:productId/add-review', authenticate, productController.addReview);

// ==========================================
// 3. ORDERS & SIMULATION ROUTES
// ==========================================
router.post('/orders/place', authenticate, authorize(['customer']), orderController.placeOrder);
router.get('/orders/my-orders', authenticate, authorize(['customer']), orderController.getMyOrders);
router.get('/orders/seller-orders', authenticate, authorize(['seller']), orderController.getSellerOrders);
router.get('/orders/:id', authenticate, orderController.getOrderById);
router.put('/orders/:id/status', authenticate, authorize(['seller', 'admin']), orderController.updateOrderStatus);

// ==========================================
// 4. COUPON CODE ROUTES
// ==========================================
router.post('/coupons/apply', authenticate, couponController.applyCoupon);
router.post('/coupons/create', authenticate, authorize(['admin']), couponController.createCoupon);
router.get('/coupons/all', authenticate, authorize(['admin']), couponController.getCoupons);
router.put('/coupons/:id/toggle', authenticate, authorize(['admin']), couponController.toggleCouponStatus);

// ==========================================
// 5. SELLER MANAGEMENT
// ==========================================
router.get('/seller/analytics', authenticate, authorize(['seller']), sellerController.getDashboardAnalytics);

// ==========================================
// 6. ADMIN SECURITY & GLOBAL DASHBOARD
// ==========================================
router.get('/admin/analytics', authenticate, authorize(['admin']), adminController.getPlatformAnalytics);
router.get('/admin/users', authenticate, authorize(['admin']), adminController.getUsers);
router.put('/admin/users/:id/status', authenticate, authorize(['admin']), adminController.updateUserStatus);
router.get('/admin/fraud-reports', authenticate, authorize(['admin']), adminController.getFraudReports);
router.post('/admin/fraud-reports/:id/review', authenticate, authorize(['admin']), adminController.reviewFraudReport);
router.post('/admin/coins/adjust', authenticate, authorize(['admin']), adminController.adjustUserCoins);
router.get('/admin/reviews', authenticate, authorize(['admin']), adminController.getAllReviews);

// ==========================================
// 7. NOTIFICATION SYSTEM
// ==========================================
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const list = await Notification.find({
      $or: [
        { userId: req.user._id.toString() },
        { userId: req.user.role }, // e.g. notify all 'seller' or 'admin'
        { userId: 'all' }
      ]
    });
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ success: true, notifications: list });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
});

router.post('/notifications/read-all', authenticate, async (req, res) => {
  try {
    const filter = {
      $or: [
        { userId: req.user._id.toString() },
        { userId: req.user.role },
        { userId: 'all' }
      ]
    };
    await Notification.deleteMany(filter); // clean notification tray by deleting read notifications for demo simplicity
    return res.json({ success: true, message: 'All notifications cleared.' });
  } catch (error) {
    req.error = error;
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
});

// ==========================================
// 8. HACKATHON ADVANCED FEATURES
// ==========================================

// Geolocation
router.post('/location/update', authenticate, hackathonController.updateLocation);
router.get('/location/sellers', authenticate, hackathonController.getNearbySellers);

// Loyalty Coins (SmartCoins)
router.get('/coins/wallet', authenticate, hackathonController.getCoinWallet);
router.post('/coins/daily-login', authenticate, hackathonController.claimDailyLogin);

// Games
router.post('/games/spin-wheel', authenticate, hackathonController.playSpinWheel);
router.post('/games/memory-match', authenticate, hackathonController.submitMemoryScore);
router.get('/games/dashboard', authenticate, hackathonController.getGameDashboard);

// Customer Support Tickets
router.post('/support/tickets', authenticate, hackathonController.raiseSupportTicket);
router.get('/support/tickets', authenticate, hackathonController.getTickets);
router.put('/support/tickets/:id', authenticate, authorize(['admin']), hackathonController.updateTicketStatus);

// Real-Time Chat
router.get('/chats', authenticate, hackathonController.getChats);
router.get('/chats/:chatId/messages', authenticate, hackathonController.getMessages);
router.post('/chats/create', authenticate, hackathonController.initializeChat);
router.post('/chats/send', authenticate, hackathonController.sendChatMessage);

// Advanced Product Reviews Extension
router.get('/products/:productId/reviews-stats', hackathonController.getReviewStats);
router.put('/products/reviews/:id', authenticate, hackathonController.editReview);
router.delete('/products/reviews/:id', authenticate, hackathonController.deleteReview);

module.exports = router;
