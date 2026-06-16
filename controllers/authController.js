const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { JWT_SECRET, REFRESH_TOKEN_SECRET } = require('../middleware/auth');
const CoinWallet = require('../models/CoinWallet');
const CoinTransaction = require('../models/CoinTransaction');

// Simple User Agent Parser
const parseUserAgent = (ua) => {
  if (!ua) return { device: 'Unknown Device', browser: 'Unknown Browser' };
  
  let browser = 'Unknown Browser';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('MSIE') || ua.includes('Trident')) browser = 'Internet Explorer';
  
  let device = 'Desktop';
  if (ua.includes('Mobi')) device = 'Mobile';
  else if (ua.includes('Tablet')) device = 'Tablet';
  
  if (ua.includes('iPhone')) device = 'iPhone';
  else if (ua.includes('iPad')) device = 'iPad';
  else if (ua.includes('Android')) device = 'Android Mobile';
  else if (ua.includes('Macintosh')) device = 'Mac';
  else if (ua.includes('Windows')) device = 'Windows PC';
  else if (ua.includes('Linux')) device = 'Linux Workstation';

  return { device, browser };
};

// Validate Password Policy
const validatePasswordStrength = (pwd) => {
  const minLength = pwd.length >= 8;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasLowercase = /[a-z]/.test(pwd);
  const hasDigit = /\d/.test(pwd);
  const hasSpecial = /[@$!%*?&._#-]/.test(pwd);
  return minLength && hasUppercase && hasLowercase && hasDigit && hasSpecial;
};

// Set Secure Authentication Cookies
const setAuthCookies = (res, userId, role) => {
  const accessToken = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId, role }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

  // Set Access Token Cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000 // 15 mins
  });

  // Set Refresh Token Cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return { accessToken, refreshToken };
};

// Sign Up / Register
const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, mobile, role, referredBy } = req.body;

    // Verify database connectivity
    try {
      await User.countDocuments();
    } catch (dbErr) {
      console.error('❌ Database connection failure during registration:', dbErr);
      return res.status(500).json({ success: false, message: 'Database connection failure. Please try again later.' });
    }

    if (role && role !== 'customer') {
      return res.status(400).json({ success: false, message: 'Self-registration is restricted to customer accounts only.' });
    }

    if (!name || !email || !mobile || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All registration fields are required.' });
    }

    if (!validatePasswordStrength(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain an uppercase letter, lowercase letter, number, and special character.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Check if user exists by mobile
    const existingUserPhone = await User.findOne({
      $or: [{ phone: mobile }, { mobile }]
    });
    if (existingUserPhone) {
      return res.status(400).json({ success: false, message: 'User already exists with this mobile number.' });
    }

    // Check if user exists by email
    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    // Hash password (12 rounds)
    const hashedPassword = bcrypt.hashSync(password, 12);

    let rewardPoints = 0;
    if (referredBy) {
      const referrer = await User.findOne({ referralCode: referredBy });
      if (referrer) {
        rewardPoints = 100;
        await User.findByIdAndUpdate(referrer._id, {
          $inc: { rewardPoints: 150 },
          $push: {
            achievements: {
              title: 'Referral Champion',
              description: `Successfully referred ${name}`
            }
          }
        });
      }
    }

    const userReferralCode = `SC_${name.replace(/\s+/g, '').toUpperCase().slice(0, 4)}_${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: mobile,
      mobile,
      role: role || 'customer',
      status: 'active',
      rewardPoints,
      tier: 'Bronze',
      referralCode: userReferralCode,
      referredBy: referredBy || '',
      loginHistory: [],
      securityAlerts: []
    });

    // Set Cookies
    const { refreshToken } = setAuthCookies(res, newUser._id, newUser.role);
    await User.findByIdAndUpdate(newUser._id, { $set: { refreshToken } });

    // Welcome reward notification
    await Notification.create({
      userId: newUser._id,
      title: 'Welcome to SmartCart AI! 🎉',
      message: 'Earn reward points on every purchase and unlock tiers for flat discounts!',
      type: 'success'
    });

    // Initialize loyalty coins wallet
    await CoinWallet.findOneAndUpdate(
      { userId: newUser._id },
      { balance: 100, updatedAt: new Date().toISOString() },
      { upsert: true, new: true }
    );
    await CoinTransaction.create({
      userId: newUser._id,
      amount: 100,
      type: 'earn',
      reason: 'Welcome bonus for registration'
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        mobile: newUser.mobile,
        role: newUser.role,
        rewardPoints: newUser.rewardPoints,
        tier: newUser.tier,
        referralCode: newUser.referralCode,
        isVerifiedSeller: newUser.isVerifiedSeller
      }
    });
  } catch (error) {
    console.error('❌ Registration Handler Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong. Please try again.'
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
      return res.status(400).json({ success: false, message: 'Identifier and password are required.' });
    }

    const user = await User.findOne({
      $or: [
        { email: emailOrMobile },
        { mobile: emailOrMobile },
        { phone: emailOrMobile }
      ]
    });

    console.log(`🕵️ [Login Debug] User Found? ${!!user}`);
    if (user) {
      console.log(`🕵️ [Login Debug] Role? ${user.role}`);
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account is suspended.' });
    }

    // IP & Device Logging
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';
    const { device, browser } = parseUserAgent(userAgent);

    // Brute Force check
    if (user.lockUntil && new Date() < new Date(user.lockUntil)) {
      const remainingMin = Math.ceil((new Date(user.lockUntil) - new Date()) / (60 * 1000));
      return res.status(403).json({
        success: false,
        message: `Account is temporarily locked. Try again in ${remainingMin} minutes.`
      });
    }

    // Password validation
    const isMatch = bcrypt.compareSync(password, user.password);
    console.log(`🕵️ [Login Debug] Password Match? ${isMatch}`);
    if (!isMatch) {
      const isDevAdmin = process.env.NODE_ENV !== 'production' && user.role === 'admin';
      
      if (isDevAdmin) {
        console.log('⚡ [Lockout Bypass]: Skipping lockout count increment for Admin demo login in development.');
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials.'
        });
      }

      const failedCount = (user.failedLoginAttempts || 0) + 1;
      
      if (failedCount >= 5) {
        // Lock account for 15 minutes
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        const alert = {
          title: 'Account Locked',
          message: 'Account was temporarily locked for 15 minutes due to 5 consecutive failed login attempts.',
          severity: 'high',
          createdAt: new Date().toISOString()
        };

        await User.findByIdAndUpdate(user._id, {
          $set: { failedLoginAttempts: 0, lockUntil: lockUntil.toISOString() },
          $push: {
            securityAlerts: alert,
            loginHistory: { device, browser, ipAddress, status: 'locked', loginTime: new Date().toISOString() }
          }
        });

        return res.status(403).json({
          success: false,
          message: 'Too many failed attempts. Account locked for 15 minutes.'
        });
      }

      await User.findByIdAndUpdate(user._id, {
        $set: { failedLoginAttempts: failedCount },
        $push: {
          loginHistory: { device, browser, ipAddress, status: 'failed', loginTime: new Date().toISOString() }
        }
      });

      return res.status(400).json({
        success: false,
        message: `Invalid credentials. Attempt ${failedCount} of 5 before temporary lock.`
      });
    }

    // Suspicious Login Detection (New device/browser checking)
    let suspiciousLogin = false;
    const history = user.loginHistory || [];
    const successfulLogins = history.filter(h => h.status === 'success');
    
    if (successfulLogins.length > 0) {
      const alreadyKnown = successfulLogins.some(h => h.device === device && h.browser === browser);
      if (!alreadyKnown) {
        suspiciousLogin = true;
        const alert = {
          title: 'Suspicious Login Detected',
          message: `New login detected from device: ${device} and browser: ${browser}.`,
          severity: 'warning',
          createdAt: new Date().toISOString()
        };
        await User.findByIdAndUpdate(user._id, {
          $push: { securityAlerts: alert }
        });
      }
    }

    // Reset failed counter and update history
    await User.findByIdAndUpdate(user._id, {
      $set: { failedLoginAttempts: 0, lockUntil: null, lastLogin: new Date().toISOString() },
      $push: {
        loginHistory: { device, browser, ipAddress, status: 'success', loginTime: new Date().toISOString() }
      }
    });

    // Set Cookies
    const { refreshToken } = setAuthCookies(res, user._id, user.role);
    await User.findByIdAndUpdate(user._id, { $set: { refreshToken } });

    // Admin login activity logging
    if (user.role === 'admin') {
      await Notification.create({
        userId: 'admin',
        title: '🔑 Admin Login Detected',
        message: `Admin logged in from ${ipAddress} using ${browser} on ${device}.`,
        type: 'info'
      });
    }

    return res.json({
      success: true,
      message: 'Login successful!',
      suspiciousLogin,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        mobile: user.mobile,
        role: user.role,
        rewardPoints: user.rewardPoints || 0,
        tier: user.tier || 'Bronze',
        referralCode: user.referralCode,
        profileImage: user.profileImage,
        isVerifiedSeller: user.isVerifiedSeller
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again."
    });
  }
};

// Refresh Access Token
const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid session token.' });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account is suspended.' });
    }

    // Set cookies again (signs new access token and refreshes expiry)
    setAuthCookies(res, user._id, user.role);

    return res.json({
      success: true,
      message: 'Token refreshed.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        mobile: user.mobile,
        role: user.role,
        rewardPoints: user.rewardPoints || 0,
        tier: user.tier || 'Bronze',
        referralCode: user.referralCode,
        profileImage: user.profileImage,
        isVerifiedSeller: user.isVerifiedSeller
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        await User.findByIdAndUpdate(decoded.id, { $set: { refreshToken: null } });
      } catch (e) {}
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

// Forgot Password - Send Reset Link
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'No user registered with this email.' });

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account is suspended.' });
    }

    // Reset Token Valid for 1 hour
    const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}&email=${email}`;

    console.log(`[PASSWORD RESET LINK]: ${resetLink}`);

    await Notification.create({
      userId: 'all',
      title: '🔑 Password Reset Link',
      message: `Reset link for ${email}: ${resetLink}`,
      type: 'info'
    });

    return res.json({
      success: true,
      message: 'Password reset link generated. Check notification tray or console.'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again."
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    if (!validatePasswordStrength(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long and contain an uppercase letter, lowercase letter, number, and special character.'
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }

    const { email } = payload;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'User not found.' });

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account is suspended.' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 12);
    await User.findOneAndUpdate({ email }, { password: hashedPassword, updatedAt: new Date().toISOString() });

    return res.json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again."
    });
  }
};

// Fetch User Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again."
    });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, mobile: phone, updatedAt: new Date().toISOString() },
      { new: true }
    );
    return res.json({ success: true, message: 'Profile updated successfully.', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again."
    });
  }
};

// Add Address
const addAddress = async (req, res) => {
  try {
    const { street, city, state, zipCode, country, isDefault } = req.body;
    
    let user = req.user;
    let addresses = [...(user.addresses || [])];

    if (isDefault) {
      addresses = addresses.map(addr => ({ ...addr, isDefault: false }));
    }

    addresses.push({ street, city, state, zipCode, country, isDefault });

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { addresses, updatedAt: new Date().toISOString() },
      { new: true }
    );

    return res.json({ success: true, message: 'Address added successfully.', user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again."
    });
  }
};

// Delete Address
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    );
    return res.json({ success: true, message: 'Address removed successfully.', user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again."
    });
  }
};

// Fetch Security logs for users
const getLoginHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.json({ success: true, loginHistory: user.loginHistory || [] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

const getSecurityAlerts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.json({ success: true, securityAlerts: user.securityAlerts || [] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  addAddress,
  deleteAddress,
  refresh,
  logout,
  getLoginHistory,
  getSecurityAlerts,
  setAuthCookies
};
