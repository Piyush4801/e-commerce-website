const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { touchSession } = require('../services/sessionTracker');

const JWT_SECRET = process.env.JWT_SECRET || 'smartcart_ai_jwt_secret_token_123';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'smartcart_ai_refresh_token_secret_456';

// Middleware to authenticate JWT
const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;
    
    // Fallback to Auth Header for API/test clients
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      // Check for silent refresh
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        try {
          const decodedRefresh = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
          const user = await User.findById(decodedRefresh.id);
          if (user && user.refreshToken === refreshToken && user.status !== 'suspended') {
            const newAccessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
            res.cookie('accessToken', newAccessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 15 * 60 * 1000 // 15 mins
            });
            req.user = user;
            touchSession(user._id);
            return next();
          }
        } catch (e) {}
      }
      return res.status(401).json({ success: false, message: 'Access Denied. Please log in.' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found. Invalid token.' });
      }
      if (user.status === 'suspended') {
        return res.status(403).json({ success: false, message: 'Your account is suspended. Contact support.' });
      }
      req.user = user;
      touchSession(user._id);
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        // Access token expired, attempt refresh
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
          try {
            const decodedRefresh = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
            const user = await User.findById(decodedRefresh.id);
            if (user && user.refreshToken === refreshToken && user.status !== 'suspended') {
              const newAccessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
              res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000
              });
              req.user = user;
              touchSession(user._id);
              return next();
            }
          } catch (e) {}
        }
      }
      return res.status(401).json({ success: false, message: 'Invalid token or token expired.' });
    }
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Authentication failed.' });
  }
};

// Middleware to restrict by roles
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Authenticate first.' });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Access Forbidden. Requires one of roles: ${roles.join(', ')}` });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  JWT_SECRET,
  REFRESH_TOKEN_SECRET
};
