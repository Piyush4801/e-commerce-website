require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./services/dbService');

// Models for seeding
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Coupon = require('./models/Coupon');
const Review = require('./models/Review');
const Notification = require('./models/Notification');
const FraudReport = require('./models/FraudReport');

// Dummy Data Seeder
const { generateDummyData } = require('./data/dummyData');
const path = require('path');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5001;

// Basic Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://plus.unsplash.com", "https://source.unsplash.com", "https://*.unsplash.com", "*"],
      connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"],
    },
  },
}));
app.use(xssClean());
app.use(cookieParser());

// CORS configuration with Credentials support
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json());

// Log requests
const requestLogger = require('./middleware/logger');
app.use(requestLogger);

// Stricter Rate Limiter for Authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 50 : 1000,
  message: { 
    success: false, 
    message: 'You have attempted multiple logins recently. Please wait a few minutes.' 
  },
  skip: (req, res) => {
    // Skip rate limiter for admin demo credentials during development
    if (process.env.NODE_ENV !== 'production' && req.body && req.body.emailOrMobile === 'piyush24@gmail.com') {
      console.log('⚡ [Rate Limit Bypass]: Skipping rate limiter for Admin demo login in development.');
      return true;
    }
    return false;
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Failsafe & Logging Wrapper middleware
const authLimiterWrapper = (req, res, next) => {
  try {
    authLimiter(req, res, (err) => {
      if (err) {
        console.warn('⚠️ [Rate Limiter Error]:', err.message);
        return next(); // Failsafe: do not block logins if rate limiter fails
      }
      
      const limitInfo = req.rateLimit;
      if (limitInfo) {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        console.log(`📊 [Rate Limit Tracker] IP: ${ip} | Route: ${req.originalUrl} | Current: ${limitInfo.current} | Limit: ${limitInfo.limit} | Remaining: ${limitInfo.remaining}`);
      }
      next();
    });
  } catch (err) {
    console.warn('⚠️ [Rate Limiter Exception]:', err.message);
    next(); // Failsafe
  }
};

app.use('/api/auth/login', authLimiterWrapper);
app.use('/api/auth/register', authLimiterWrapper);

// General Rate Limiter for non-auth API endpoints
// Development: 500 req / 15min  |  Production: 150 req / 15min
// High-frequency polling routes (e.g. /api/notifications) are excluded to avoid
// exhausting the shared bucket and blocking page navigation / registration.
const isDev = process.env.NODE_ENV !== 'production';
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 500 : 150,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  skip: (req) => {
    // Skip rate limiter for high-frequency polling routes so they never
    // exhaust the shared counter and accidentally block other users.
    const POLLING_ROUTES = ['/api/notifications', '/api/auth/profile'];
    return POLLING_ROUTES.some(route => req.path.startsWith(route.replace('/api', '')));
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', apiLimiter);
console.log(`🛡️  [Rate Limiter] General API limiter: ${isDev ? 500 : 150} req / 15min (${isDev ? 'development' : 'production'} mode). Polling routes excluded.`);

// Static Uploads Folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Namespace
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Static Frontend Files
app.use(express.static(path.join(__dirname, 'public')));

// Wildcard fallback to serve React SPA
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Secure generic error handling (no stack trace exposure)
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: 'Something went wrong. Please try again.'
  });
});

// Database seeding function
const seedDatabase = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      console.log('📦 Database already has products. Skipping dummy data seeding.');
      return;
    }

    console.log('🌱 Database is empty. Generating 100+ dummy products, customers, and orders...');
    const data = generateDummyData();

    // Insert Users
    for (let u of data.users) {
      await User.create(u);
    }
    console.log(`✅ Loaded ${data.users.length} Users.`);

    // Insert Products
    for (let p of data.products) {
      await Product.create(p);
    }
    console.log(`✅ Loaded ${data.products.length} Products.`);

    // Insert Coupons
    for (let c of data.coupons) {
      await Coupon.create(c);
    }
    console.log(`✅ Loaded ${data.coupons.length} Coupons.`);

    // Insert Reviews
    for (let r of data.reviews) {
      await Review.create(r);
    }
    console.log(`✅ Loaded ${data.reviews.length} Reviews.`);

    // Insert Orders
    for (let o of data.orders) {
      await Order.create(o);
    }
    console.log(`✅ Loaded ${data.orders.length} Orders.`);

    // Insert Notifications
    for (let n of data.notifications) {
      await Notification.create(n);
    }
    console.log(`✅ Loaded ${data.notifications.length} Notifications.`);

    // Insert Fraud Reports
    for (let f of data.fraudReports) {
      await FraudReport.create(f);
    }
    console.log(`✅ Loaded ${data.fraudReports.length} Fraud Reports.`);

    console.log('🌱 Data seeding completed successfully.');
  } catch (error) {
    console.error('❌ Data seeding failed:', error.message);
  }
};

const ensureDefaultAccounts = async () => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');

    // 1. Ensure Default Admin
    const adminEmail = 'piyush24@gmail.com';
    let admin = await User.findOne({ email: adminEmail });
    const hashedAdminPassword = bcrypt.hashSync('Piyush4801@#$', 12);
    if (!admin) {
      admin = await User.create({
        name: 'Piyush Admin',
        email: adminEmail,
        password: hashedAdminPassword,
        phone: '+919999999999',
        role: 'admin',
        status: 'active',
        addresses: [],
        rewardPoints: 0,
        tier: 'Platinum'
      });
      console.log('🌱 [Auto Seed]: Admin account piyush24@gmail.com created successfully.');
    } else {
      await User.findByIdAndUpdate(admin._id || admin.id, { $set: { password: hashedAdminPassword } });
      console.log('🌱 [Auto Seed]: Admin account piyush24@gmail.com verified.');
    }
  } catch (err) {
    console.error('❌ [Auto Seed Failed]:', err.message);
  }
};

// Start Server
const startServer = async () => {
  // Connect to DB (Mongo or Fallback)
  await connectDB();

  // Run database seed
  if (process.env.SEED_DATABASE === 'true') {
    await seedDatabase();
  }

  // Ensure Admin and Seller exist with correct credentials
  await ensureDefaultAccounts();

  // Startup lockout cleanup task
  try {
    const User = require('./models/User');
    const users = await User.find({});
    let clearedCount = 0;
    for (let u of users) {
      if (u.failedLoginAttempts > 0 || u.lockUntil) {
        await User.findByIdAndUpdate(u._id, { $set: { failedLoginAttempts: 0, lockUntil: null } });
        clearedCount++;
      }
    }
    if (clearedCount > 0) {
      console.log(`🔓 [Startup Cleanup]: Reset failed login counters and lockouts for ${clearedCount} users.`);
    }
  } catch (cleanupErr) {
    console.error('⚠️ [Startup Cleanup Failed]:', cleanupErr.message);
  }

  const http = require('http');
  const { Server } = require('socket.io');

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  app.set('socketio', io);

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join personal user room
    socket.on('join_room', (userId) => {
      socket.join(userId);
      console.log(`🚪 User ${userId} joined room`);
    });

    // Handle real-time messaging
    socket.on('send_message', (data) => {
      // Relays to the counterpart recipient room
      if (data.recipientId) {
        io.to(data.recipientId).emit('receive_message', data);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  server.listen(PORT, () => {
    console.log(`🚀 SmartCart AI Backend listening on port ${PORT}`);
  });
};

startServer();
