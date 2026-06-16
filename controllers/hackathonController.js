const CoinWallet = require('../models/CoinWallet');
const CoinTransaction = require('../models/CoinTransaction');
const GameHistory = require('../models/GameHistory');
const Leaderboard = require('../models/Leaderboard');
const SupportTicket = require('../models/SupportTicket');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const UserLocation = require('../models/UserLocation');
const RewardHistory = require('../models/RewardHistory');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

// ==========================================
// 1. LOCATION & MAP CONTROLLERS
// ==========================================
const updateLocation = async (req, res) => {
  try {
    const { lat, lng, address } = req.body;
    if (!lat || !lng || !address) {
      return res.status(400).json({ success: false, message: 'Missing coordinate details.' });
    }

    const updated = await UserLocation.findOneAndUpdate(
      { userId: req.user._id },
      { lat, lng, address, updatedAt: new Date().toISOString() },
      { new: true, upsert: true }
    );

    return res.json({ success: true, location: updated });
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

const getNearbySellers = async (req, res) => {
  try {
    const userLoc = await UserLocation.findOne({ userId: req.user._id });
    const userLat = userLoc ? userLoc.lat : 12.9716; // default Bangalore
    const userLng = userLoc ? userLoc.lng : 77.5946;

    // Seeding mock locations for active merchants in dummyData
    // We compute mock distance and ETA
    const mockSellers = [
      { id: 'seller_id_1', name: 'Vendor Prime Electronics', lat: userLat + 0.015, lng: userLng - 0.012 },
      { id: 'seller_id_2', name: 'Sartorial Fashion Hub', lat: userLat - 0.025, lng: userLng + 0.02 },
      { id: 'seller_id_3', name: 'SmartCart Bookstore', lat: userLat + 0.008, lng: userLng + 0.011 }
    ];

    const nearby = mockSellers.map(seller => {
      // Haversine-like direct grid offset math
      const dLat = (seller.lat - userLat) * 111; // km per degree
      const dLng = (seller.lng - userLng) * 111;
      const distance = parseFloat(Math.sqrt(dLat * dLat + dLng * dLng).toFixed(2));
      const eta = Math.ceil(distance * 3 + 5); // 3 mins per km + 5 mins prep

      return {
        ...seller,
        distance,
        eta
      };
    });

    return res.json({ success: true, sellers: nearby, userLocation: { lat: userLat, lng: userLng } });
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

// ==========================================
// 2. LOYALTY COIN WALLET CONTROLLERS
// ==========================================
const getCoinWallet = async (req, res) => {
  try {
    let wallet = await CoinWallet.findOne({ userId: req.user._id });
    if (!wallet) {
      wallet = await CoinWallet.create({ userId: req.user._id, balance: 100 }); // grant 100 welcome coins
      await CoinTransaction.create({
        userId: req.user._id,
        amount: 100,
        type: 'earn',
        reason: 'Welcome bonus for registration'
      });
    }

    const transactions = await CoinTransaction.find({ userId: req.user._id });
    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, balance: wallet.balance, transactions });
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

const claimDailyLogin = async (req, res) => {
  try {
    const todayStr = new Date().toDateString();
    
    // Find transaction of type earn for daily_login today
    const txs = await CoinTransaction.find({ 
      userId: req.user._id, 
      reason: 'Daily Check-in Loyalty Reward' 
    });
    
    const alreadyClaimed = txs.some(tx => new Date(tx.createdAt).toDateString() === todayStr);
    
    if (alreadyClaimed) {
      return res.status(400).json({ success: false, message: 'You have already claimed today\'s login coins!' });
    }

    // Award 50 coins
    let wallet = await CoinWallet.findOne({ userId: req.user._id });
    if (!wallet) {
      wallet = await CoinWallet.create({ userId: req.user._id, balance: 100 });
    }
    
    const newBal = wallet.balance + 50;
    await CoinWallet.findOneAndUpdate({ userId: req.user._id }, { balance: newBal, updatedAt: new Date().toISOString() });
    
    const transaction = await CoinTransaction.create({
      userId: req.user._id,
      amount: 50,
      type: 'earn',
      reason: 'Daily Check-in Loyalty Reward'
    });

    // Update Leaderboard
    await updateLeaderboardStats(req.user._id, req.user.name, 50, 0);

    return res.json({ success: true, balance: newBal, earned: 50 });
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

// ==========================================
// 3. GAMING ZONE CONTROLLERS
// ==========================================
const playSpinWheel = async (req, res) => {
  try {
    const todayStr = new Date().toDateString();
    
    // Check spin wheel history for today
    const lastSpins = await GameHistory.find({
      userId: req.user._id,
      gameName: 'spin_wheel'
    });
    
    const spunToday = lastSpins.some(spin => new Date(spin.playedAt).toDateString() === todayStr);
    if (spunToday) {
      return res.status(400).json({ success: false, message: 'Lucky Spin is limited to once daily!' });
    }

    // Spin outcomes
    const prizes = [5, 10, 20, 50, 100];
    const earned = prizes[Math.floor(Math.random() * prizes.length)];

    // Update wallet
    let wallet = await CoinWallet.findOne({ userId: req.user._id });
    const newBal = (wallet ? wallet.balance : 0) + earned;
    await CoinWallet.findOneAndUpdate(
      { userId: req.user._id }, 
      { balance: newBal, updatedAt: new Date().toISOString() },
      { upsert: true }
    );

    // Save transaction and history
    await CoinTransaction.create({
      userId: req.user._id,
      amount: earned,
      type: 'earn',
      reason: 'Lucky Spin Wheel Game reward'
    });

    await GameHistory.create({
      userId: req.user._id,
      userName: req.user.name,
      gameName: 'spin_wheel',
      coinsEarned: earned
    });

    await updateLeaderboardStats(req.user._id, req.user.name, earned, 1);

    return res.json({ success: true, earned, balance: newBal });
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

const submitMemoryScore = async (req, res) => {
  try {
    const { score } = req.body;
    if (score === undefined) {
      return res.status(400).json({ success: false, message: 'Score count is required.' });
    }

    // Determine coin returns based on rules
    let earned = 5;
    if (score >= 200) earned = 50;
    else if (score >= 100) earned = 20;

    let wallet = await CoinWallet.findOne({ userId: req.user._id });
    const newBal = (wallet ? wallet.balance : 0) + earned;
    await CoinWallet.findOneAndUpdate(
      { userId: req.user._id }, 
      { balance: newBal, updatedAt: new Date().toISOString() },
      { upsert: true }
    );

    await CoinTransaction.create({
      userId: req.user._id,
      amount: earned,
      type: 'earn',
      reason: `Memory Match Game (Score: ${score})`
    });

    await GameHistory.create({
      userId: req.user._id,
      userName: req.user.name,
      gameName: 'memory_match',
      score,
      coinsEarned: earned
    });

    await updateLeaderboardStats(req.user._id, req.user.name, earned, 1);

    return res.json({ success: true, earned, balance: newBal });
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

const getGameDashboard = async (req, res) => {
  try {
    const history = await GameHistory.find({ userId: req.user._id });
    const totalCoinsEarned = history.reduce((sum, h) => sum + h.coinsEarned, 0);

    const leaderboards = await Leaderboard.find({});
    leaderboards.sort((a, b) => b.totalCoinsEarned - a.totalCoinsEarned);

    return res.json({
      success: true,
      stats: {
        totalCoinsEarned,
        gamesPlayed: history.length,
        dailyStreak: 3 // Mock streak
      },
      leaderboard: leaderboards.slice(0, 10)
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

// Helper to update Leaderboard records
const updateLeaderboardStats = async (userId, userName, coins, gameInc) => {
  try {
    const leader = await Leaderboard.findOne({ userId });
    if (leader) {
      await Leaderboard.findOneAndUpdate(
        { userId },
        { 
          totalCoinsEarned: leader.totalCoinsEarned + coins, 
          gamesPlayed: leader.gamesPlayed + gameInc,
          updatedAt: new Date().toISOString()
        }
      );
    } else {
      await Leaderboard.create({
        userId,
        userName,
        totalCoinsEarned: coins,
        gamesPlayed: gameInc
      });
    }
  } catch (e) {
    console.error('Leaderboard sync failed:', e.message);
  }
};

// ==========================================
// 4. CUSTOMER HELP TICKETS
// ==========================================
const raiseSupportTicket = async (req, res) => {
  try {
    const { title, description, category, orderId } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Ticket summary details are required.' });
    }

    const ticket = await SupportTicket.create({
      userId: req.user._id,
      userName: req.user.name,
      title,
      description,
      category,
      orderId,
      status: 'open'
    });

    return res.status(201).json({ success: true, ticket });
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

const getTickets = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const tickets = await SupportTicket.find(filter);
    tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ success: true, tickets });
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

const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticketId = req.params.id;

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const updated = await SupportTicket.findByIdAndUpdate(
      ticketId, 
      { status }, 
      { new: true }
    );

    // Refund logic auto integration
    if (status === 'resolved' && ticket.category === 'refund' && ticket.orderId) {
      const order = await Order.findById(ticket.orderId);
      if (order) {
        await Order.findByIdAndUpdate(ticket.orderId, { orderStatus: 'cancelled', paymentStatus: 'failed' });
        
        await Notification.create({
          userId: ticket.userId,
          title: '💸 Refund Approved',
          message: `Your refund request for order #${order._id.slice(-6).toUpperCase()} has been approved. ₹${order.netAmount} will credit back shortly.`,
          type: 'success'
        });

        // Trigger Socket alert if connected
        const io = req.app.get('socketio');
        if (io) {
          io.to(ticket.userId).emit('notification', {
            title: '💸 Refund Approved',
            message: `Order #${order._id.slice(-6).toUpperCase()} refund resolved.`
          });
        }
      }
    }

    return res.json({ success: true, ticket: updated });
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

// ==========================================
// 5. CHAT MESSAGES CONTROLLERS
// ==========================================
const getChats = async (req, res) => {
  try {
    // For merchant (seller), match sellerId. For customers, match customerId
    const query = req.user.role === 'seller' ? { sellerId: req.user._id } : { customerId: req.user._id };
    const list = await Chat.find(query);
    list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return res.json({ success: true, chats: list });
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

const getMessages = async (req, res) => {
  try {
    const list = await Message.find({ chatId: req.params.chatId });
    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return res.json({ success: true, messages: list });
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

const initializeChat = async (req, res) => {
  try {
    const { sellerId, sellerName } = req.body;
    if (!sellerId || !sellerName) {
      return res.status(400).json({ success: false, message: 'Seller specs are required.' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({ customerId: req.user._id, sellerId });
    if (!chat) {
      chat = await Chat.create({
        customerId: req.user._id,
        customerName: req.user.name,
        sellerId,
        sellerName,
        lastMessage: 'Chat initialized'
      });
    }

    return res.json({ success: true, chat });
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

const sendChatMessage = async (req, res) => {
  try {
    const { chatId, text, recipientId } = req.body;
    if (!chatId || !text) {
      return res.status(400).json({ success: false, message: 'Message payload is missing.' });
    }

    const msg = await Message.create({
      chatId,
      senderId: req.user._id,
      senderName: req.user.name,
      text
    });

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: text,
      updatedAt: new Date().toISOString()
    });

    // Real-time socket relay
    const io = req.app.get('socketio');
    if (io && recipientId) {
      io.to(recipientId).emit('receive_message', {
        chatId,
        senderId: req.user._id,
        senderName: req.user.name,
        text,
        createdAt: msg.createdAt
      });

      // Also trigger a notification bell update if the recipient is a merchant
      io.to(recipientId).emit('notification', {
        title: '💬 New Message',
        message: `${req.user.name}: "${text.slice(0, 30)}..."`,
        type: 'info'
      });
    }

    // Save notification record to DB for persistence
    if (recipientId) {
      await Notification.create({
        userId: recipientId,
        title: '💬 New Customer Message',
        message: `Chat message from "${req.user.name}"`,
        type: 'info'
      });
    }

    return res.status(201).json({ success: true, message: msg });
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

// ==========================================
// 6. ADVANCED REVIEWS EXTENSIONS
// ==========================================
const getReviewStats = async (req, res) => {
  try {
    const { productId } = req.params;
    const list = await Review.find({ productId });

    const totalRatings = list.length;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    list.forEach(r => {
      breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
      sum += r.rating;
    });

    const averageRating = totalRatings > 0 ? parseFloat((sum / totalRatings).toFixed(1)) : 0;

    return res.json({
      success: true,
      stats: {
        averageRating,
        totalRatings,
        breakdown
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

const editReview = async (req, res) => {
  try {
    const { rating, comment, title, images } = req.body;
    const reviewId = req.params.id;

    const rev = await Review.findById(reviewId);
    if (!rev) return res.status(404).json({ success: false, message: 'Review not found.' });

    if (rev.customerId !== req.user._id) {
      return res.status(403).json({ success: false, message: 'You can only edit your own reviews.' });
    }

    const updated = await Review.findByIdAndUpdate(reviewId, {
      rating: parseInt(rating),
      comment,
      title: title || '',
      images: images || rev.images,
      updatedAt: new Date().toISOString()
    }, { new: true });

    // Recompute product ratings
    await syncProductRating(rev.productId);

    return res.json({ success: true, review: updated });
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

const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const rev = await Review.findById(reviewId);
    if (!rev) return res.status(404).json({ success: false, message: 'Review not found.' });

    // Allow user who wrote it OR Admin to delete
    if (req.user.role !== 'admin' && rev.customerId !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Unauthorized review delete.' });
    }

    await Review.deleteOne({ _id: reviewId });

    // Sync rating metrics
    await syncProductRating(rev.productId);

    return res.json({ success: true, message: 'Review removed successfully.' });
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

const syncProductRating = async (productId) => {
  try {
    const reviews = await Review.find({ productId });
    const total = reviews.length;
    const avg = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: parseFloat(avg.toFixed(1)),
      reviewCount: total
    });
  } catch (e) {
    console.error('Failed to sync ratings:', e.message);
  }
};

module.exports = {
  updateLocation,
  getNearbySellers,
  getCoinWallet,
  claimDailyLogin,
  playSpinWheel,
  submitMemoryScore,
  getGameDashboard,
  raiseSupportTicket,
  getTickets,
  updateTicketStatus,
  getChats,
  getMessages,
  initializeChat,
  sendChatMessage,
  getReviewStats,
  editReview,
  deleteReview
};
