const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const fraudService = require('../services/fraudService');
const CoinWallet = require('../models/CoinWallet');
const CoinTransaction = require('../models/CoinTransaction');
const Leaderboard = require('../models/Leaderboard');

const placeOrder = async (req, res) => {
  try {
    const { items, couponCode, paymentMethod, shippingAddress, carbonOffsetSelected, failedAttemptsCount = 0, coinsToRedeem } = req.body;

    const user = req.user;
    const cart = { items: items || [] };

    // Debug logs
    console.log("User:", user);
    console.log("Body:", req.body);
    console.log("Cart:", cart);
    console.log("Payment:", paymentMethod);
    console.log("Address:", shippingAddress);

    // Validation checks
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not authenticated"
      });
    }

    if (!cart) {
      return res.status(400).json({
        success: false,
        message: "Cart object is missing"
      });
    }

    if (!cart.items.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required"
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required"
      });
    }

    // 1. Validate stock and compute item totals
    let totalAmount = 0;
    const orderItems = [];

    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.name} not found.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${product.name}. Only ${product.stock} available.` 
        });
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        sellerId: product.sellerId,
        ecoScore: product.sustainability.ecoScore
      });

      totalAmount += product.price * item.quantity;
    }

    // 2. Process coupon discount
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
      if (coupon) {
        if (totalAmount >= coupon.minPurchase) {
          if (coupon.type === 'percentage') {
            discountAmount = totalAmount * (coupon.value / 100);
          } else {
            discountAmount = coupon.value;
          }
        }
      }
    }

    // 3. Process carbon offset fee
    const carbonOffsetFee = carbonOffsetSelected ? 15 : 0; // ₹15 flat fee for carbon offsetting
    let netAmount = totalAmount - discountAmount + carbonOffsetFee;

    // 4. Loyalty Coins (SmartCoins) Checkout Redemption: 100 coins = ₹10 discount (max 20% of netAmount)
    let coinsDiscount = 0;
    let coinsRedeemedUsed = 0;
    if (coinsToRedeem && coinsToRedeem > 0) {
      const wallet = await CoinWallet.findOne({ userId: req.user._id });
      const availableCoins = wallet ? wallet.balance : 0;
      const actualRedeem = Math.min(coinsToRedeem, availableCoins);
      if (actualRedeem > 0) {
        const potentialDiscount = (actualRedeem / 100) * 10;
        const maxDiscount = netAmount * 0.20;
        coinsDiscount = Math.min(potentialDiscount, maxDiscount);
        coinsRedeemedUsed = Math.round((coinsDiscount / 10) * 100);
        
        // Deduct from wallet
        const newBal = availableCoins - coinsRedeemedUsed;
        await CoinWallet.findOneAndUpdate({ userId: req.user._id }, { balance: newBal, updatedAt: new Date().toISOString() });
      }
    }

    netAmount = Math.max(0, netAmount - coinsDiscount);

    // 5. Create local object structure for fraud service validation
    const tempOrder = {
      customerId: req.user._id,
      customerEmail: req.user.email,
      totalAmount: netAmount
    };

    const fraudValidation = await fraudService.evaluateTransaction(tempOrder, {
      failedPaymentAttempts: failedAttemptsCount
    });

    // 6. Deduct product stocks
    for (let item of items) {
      const product = await Product.findById(item.productId);
      const newStock = product.stock - item.quantity;
      await Product.findByIdAndUpdate(item.productId, { stock: newStock });

      // Stock warning alerts if stock drops under 5
      if (newStock <= 0) {
        await Notification.create({
          userId: product.sellerId,
          title: '🔔 Product Out Of Stock',
          message: `Your product "${product.name}" is completely out of stock.`,
          type: 'error'
        });
        const io = req.app.get('socketio');
        if (io) {
          io.to(product.sellerId).emit('notification', {
            title: '🔔 Product Out Of Stock',
            message: `"${product.name}" is completely out of stock.`,
            type: 'error'
          });
        }
      } else if (newStock <= 5) {
        await Notification.create({
          userId: product.sellerId,
          title: '🔔 Low Stock Alert',
          message: `Your product "${product.name}" is running low on stock. Only ${newStock} items left.`,
          type: 'warning'
        });
        const io = req.app.get('socketio');
        if (io) {
          io.to(product.sellerId).emit('notification', {
            title: '🔔 Low Stock Alert',
            message: `"${product.name}" is running low on stock (${newStock} remaining).`,
            type: 'warning'
          });
        }
      }
    }

    // 7. Save order record
    const timeline = [
      { status: 'pending', description: 'Order submitted and pending merchant review' }
    ];

    // If order was flagged, block payment status until review, otherwise set paid (simulated success)
    const paymentStatus = fraudValidation.isFlagged ? 'pending' : 'paid';
    const orderStatus = fraudValidation.isFlagged ? 'pending' : 'confirmed';

    if (orderStatus === 'confirmed') {
      timeline.push({ status: 'confirmed', description: 'Payment verified and order confirmed' });
    }

    console.log("Creating Order");
    const order = await Order.create({
      customerId: req.user._id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      items: orderItems,
      totalAmount,
      discountAmount: discountAmount + coinsDiscount,
      carbonOffsetFee,
      netAmount,
      couponCode: couponCode || '',
      paymentMethod,
      paymentStatus,
      orderStatus,
      shippingAddress,
      trackingTimeline: timeline,
      fraudRiskScore: fraudValidation.riskScore,
      isFlagged: fraudValidation.isFlagged,
      fraudTriggers: fraudValidation.triggers
    });

    console.log("Order Created");

    // Save redemption log transaction
    if (coinsRedeemedUsed > 0) {
      await CoinTransaction.create({
        userId: req.user._id,
        amount: -coinsRedeemedUsed,
        type: 'redeem',
        reason: `Checkout coin redemption for order #${order._id.slice(-6).toUpperCase()}`,
        orderId: order._id
      });
    }

    // Award order placement coins (₹100 Spent = 10 Coins)
    let coinsEarned = 0;
    if (!fraudValidation.isFlagged) {
      coinsEarned = Math.floor(netAmount / 100) * 10;
      if (coinsEarned > 0) {
        const wallet = await CoinWallet.findOne({ userId: req.user._id });
        const newBal = (wallet ? wallet.balance : 0) + coinsEarned;
        await CoinWallet.findOneAndUpdate({ userId: req.user._id }, { balance: newBal, updatedAt: new Date().toISOString() }, { upsert: true });

        await CoinTransaction.create({
          userId: req.user._id,
          amount: coinsEarned,
          type: 'earn',
          reason: `Order purchase rewards for order #${order._id.slice(-6).toUpperCase()}`,
          orderId: order._id
        });

        // Sync to leaderboard
        const leader = await Leaderboard.findOne({ userId: req.user._id });
        if (leader) {
          await Leaderboard.findOneAndUpdate(
            { userId: req.user._id },
            { 
              totalCoinsEarned: leader.totalCoinsEarned + coinsEarned,
              updatedAt: new Date().toISOString()
            }
          );
        } else {
          await Leaderboard.create({
            userId: req.user._id,
            userName: req.user.name,
            totalCoinsEarned: coinsEarned,
            gamesPlayed: 0
          });
        }
      }
    }

    // Real-Time Socket alerts to Seller
    const io = req.app.get('socketio');
    if (io) {
      const sellerIds = [...new Set(orderItems.map(item => item.sellerId))];
      sellerIds.forEach(async (selId) => {
        io.to(selId).emit('notification', {
          title: '🔔 New Order Received',
          message: `Order #${order._id.slice(-6).toUpperCase()} of ₹${netAmount.toLocaleString()} has been placed.`,
          type: 'success'
        });

        await Notification.create({
          userId: selId,
          title: '🔔 New Order Received',
          message: `Order #${order._id.slice(-6).toUpperCase()} of ₹${netAmount.toLocaleString()} has been placed.`,
          type: 'success'
        });
      });
    }

    // 8. Process rewards and tier upgrades (Only if order is paid/confirmed)
    let updatedUser = req.user;
    if (!fraudValidation.isFlagged) {
      const pointsEarned = Math.floor(netAmount / 10);
      const newPoints = (req.user.rewardPoints || 0) + pointsEarned;
      
      let tier = 'Bronze';
      if (newPoints >= 4000) tier = 'Platinum';
      else if (newPoints >= 1500) tier = 'Gold';
      else if (newPoints >= 500) tier = 'Silver';

      const achievements = [...(req.user.achievements || [])];
      
      if (tier !== req.user.tier) {
        achievements.push({
          title: `${tier} Loyalty Unlocked!`,
          description: `Upgraded to ${tier} tier. Enjoy custom multipliers!`
        });
      }

      if (carbonOffsetSelected) {
        const hasEcoWarrior = achievements.some(a => a.title === 'Eco Warrior');
        if (!hasEcoWarrior) {
          achievements.push({
            title: 'Eco Warrior',
            description: 'Contributed to carbon offset and purchased green products.'
          });
        }
      }

      if (netAmount > 10000) {
        const hasBigSpender = achievements.some(a => a.title === 'Big Spender');
        if (!hasBigSpender) {
          achievements.push({
            title: 'Big Spender',
            description: 'Placed a single order exceeding ₹10,000.'
          });
        }
      }

      updatedUser = await User.findByIdAndUpdate(req.user._id, {
        rewardPoints: newPoints,
        tier,
        achievements,
        updatedAt: new Date().toISOString()
      }, { new: true });

      // Notify customer
      await Notification.create({
        userId: req.user._id,
        title: '📦 Order Confirmed!',
        message: `Your order for ₹${netAmount.toLocaleString()} has been confirmed. You earned ${pointsEarned} reward points!`,
        type: 'success'
      });
    } else {
      await Notification.create({
        userId: req.user._id,
        title: '⚠️ Order Hold Alert',
        message: `Your order is undergoing a standard security check. We will notify you shortly once cleared.`,
        type: 'warning'
      });
    }

    return res.status(201).json({
      success: true,
      message: fraudValidation.isFlagged 
        ? 'Order placed on security hold for manual verification.' 
        : 'Order placed and confirmed successfully!',
      order,
      user: {
        rewardPoints: updatedUser.rewardPoints,
        tier: updatedUser.tier
      }
    });
  } catch (error) {
    req.error = error;
    console.error("ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id });
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

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Customer can see their own, Seller can see if they own items, Admin can see all
    if (req.user.role === 'customer' && order.customerId !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access.' });
    }

    return res.json({ success: true, order });
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

const getSellerOrders = async (req, res) => {
  try {
    // Return orders containing products belonging to this seller
    const allOrders = await Order.find({});
    const sellerOrders = allOrders.filter(order => 
      order.items.some(item => item.sellerId === req.user._id)
    );

    // Map item subsets relevant to this specific seller
    const tailoredOrders = sellerOrders.map(order => {
      const myItems = order.items.filter(item => item.sellerId === req.user._id);
      const myTotal = myItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return {
        ...order,
        items: myItems,
        myTotal
      };
    });

    return res.json({ success: true, orders: tailoredOrders });
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

const updateOrderStatus = async (req, res) => {
  try {
    const { status, description } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Only Seller of the item or Admin can update
    const isSeller = order.items.some(item => item.sellerId === req.user._id);
    if (req.user.role !== 'admin' && !isSeller) {
      return res.status(403).json({ success: false, message: 'Unauthorized action.' });
    }

    // Append to timeline
    const timeline = [...(order.trackingTimeline || [])];
    timeline.push({
      status,
      description: description || `Status updated to: ${status}`,
      timestamp: new Date().toISOString()
    });

    const updated = await Order.findByIdAndUpdate(orderId, {
      orderStatus: status,
      trackingTimeline: timeline,
      updatedAt: new Date().toISOString()
    }, { new: true });

    // Notify customer
    await Notification.create({
      userId: order.customerId,
      title: `📦 Order Status Update`,
      message: `Your order #${orderId.slice(-6)} status has been updated to: ${status.toUpperCase()}.`,
      type: 'info'
    });

    return res.json({ success: true, message: 'Order status updated successfully.', order: updated });
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
  placeOrder,
  getMyOrders,
  getOrderById,
  getSellerOrders,
  updateOrderStatus
};
