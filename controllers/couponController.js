const Coupon = require('../models/Coupon');

const applyCoupon = async (req, res) => {
  try {
    const { code, totalAmount } = req.body;
    
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required.' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code.' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'Coupon code is inactive.' });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ success: false, message: 'Coupon code has expired.' });
    }

    if (totalAmount < coupon.minPurchase) {
      return res.status(400).json({ 
        success: false, 
        message: `Min purchase of ₹${coupon.minPurchase} required to apply this coupon.` 
      });
    }

    // Apply calculations
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = totalAmount * (coupon.value / 100);
    } else {
      discountAmount = coupon.value;
    }

    return res.json({
      success: true,
      message: 'Coupon applied successfully!',
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount
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

const createCoupon = async (req, res) => {
  try {
    const { code, type, value, minPurchase, expiryDays = 30 } = req.body;

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists.' });
    }

    const expiryDate = new Date(Date.now() + expiryDays * 24 * 3600 * 1000).toISOString();

    const newCoupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value: parseFloat(value),
      minPurchase: parseFloat(minPurchase || 0),
      isActive: true,
      expiryDate
    });

    return res.status(201).json({ success: true, message: 'Coupon created successfully.', coupon: newCoupon });
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

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    return res.json({ success: true, coupons });
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

const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });

    const updated = await Coupon.findByIdAndUpdate(
      req.params.id, 
      { isActive: !coupon.isActive }, 
      { new: true }
    );

    return res.json({ 
      success: true, 
      message: `Coupon ${updated.code} is now ${updated.isActive ? 'Active' : 'Inactive'}.`,
      coupon: updated 
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

module.exports = {
  applyCoupon,
  createCoupon,
  getCoupons,
  toggleCouponStatus
};
