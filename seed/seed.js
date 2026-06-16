require('dotenv').config();
const { connectDB } = require('../services/dbService');
const { generateDummyData } = require('../data/dummyData');

// Models
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const FraudReport = require('../models/FraudReport');
const CoinWallet = require('../models/CoinWallet');
const CoinTransaction = require('../models/CoinTransaction');

const runSeeder = async () => {
  console.log('🌱 Starting Database Seeding...');

  // Connect to DB (Mongo or Fallback)
  const isMongo = await connectDB();
  console.log(`📡 DB Connection Mode: ${isMongo ? 'MongoDB' : 'Local JSON files'}`);

  try {
    // Clear Collections
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Coupon.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    await FraudReport.deleteMany({});
    await CoinWallet.deleteMany({});
    await CoinTransaction.deleteMany({});

    // Generate Seeding Data
    console.log('⚙️ Generating dummy data...');
    const data = generateDummyData();

    // Insert Users
    console.log(`👥 Inserting ${data.users.length} Users...`);
    for (let u of data.users) {
      await User.create(u);
    }

    // Insert Products
    console.log(`📦 Inserting ${data.products.length} Products...`);
    for (let p of data.products) {
      await Product.create(p);
    }

    // Insert Coupons
    console.log(`🎫 Inserting ${data.coupons.length} Coupons...`);
    for (let c of data.coupons) {
      await Coupon.create(c);
    }

    // Insert Reviews
    console.log(`💬 Inserting ${data.reviews.length} Reviews...`);
    for (let r of data.reviews) {
      await Review.create(r);
    }

    // Insert Orders
    console.log(`🛍️ Inserting ${data.orders.length} Orders...`);
    for (let o of data.orders) {
      await Order.create(o);
    }

    // Insert Notifications
    console.log(`🔔 Inserting ${data.notifications.length} Notifications...`);
    for (let n of data.notifications) {
      await Notification.create(n);
    }

    // Insert Fraud Reports
    console.log(`🚨 Inserting ${data.fraudReports.length} Fraud Reports...`);
    for (let f of data.fraudReports) {
      await FraudReport.create(f);
    }

    // Initialize loyalty wallets for users
    console.log('💰 Initializing loyalty coin wallets...');
    for (let u of data.users) {
      if (u.role === 'customer') {
        await CoinWallet.findOneAndUpdate(
          { userId: u._id },
          { balance: 100, updatedAt: new Date().toISOString() },
          { upsert: true, new: true }
        );
        await CoinTransaction.create({
          userId: u._id,
          amount: 100,
          type: 'earn',
          reason: 'Welcome bonus for registration'
        });
      }
    }

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed with error:', err.message);
    process.exit(1);
  }
};

runSeeder();
