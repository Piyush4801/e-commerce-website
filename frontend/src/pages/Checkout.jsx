import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCoins } from '../context/CoinsContext';
import axios from '../services/api.js';
import { 
  MapPin, CreditCard, ShieldAlert, Sparkles, CheckCircle2, ArrowRight, HelpCircle, Coins, Trash2, Calendar, ShoppingBag, Landmark, ArrowLeft, Loader2
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { LocationSelector } from '../components/Common/LocationSelector';

export const Checkout = () => {
  const { user, addAddress } = useAuth();
  const { 
    cart, coupon, carbonOffset, getSubtotal, getDiscount, getCarbonOffsetFee, getTotal, clearCart, applyCouponCode, removeCoupon 
  } = useCart();
  const { balance, coinsToRedeem, setCoinsToRedeem, computeRedeemDiscount, redeemDiscount } = useCoins();

  // Address Fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Payment Method ('cod', 'upi', 'card', 'wallet', 'netbanking')
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [simulatedState, setSimulatedState] = useState('success'); // success, failed

  // Coupon Input
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [couponStatus, setCouponStatus] = useState(''); // success, error
  const [couponLoading, setCouponLoading] = useState(false);

  // States
  const [failedPaymentAttempts, setFailedPaymentAttempts] = useState(0);
  const [checkoutError, setCheckoutError] = useState('');
  const [loadingState, setLoadingState] = useState('idle'); // idle, loading, success
  const [placedOrder, setPlacedOrder] = useState(null);

  const navigate = useNavigate();
  const { addToast } = useToast();

  // Calculate pricing
  const subtotal = getSubtotal();
  const discount = getDiscount();
  const offsetFee = getCarbonOffsetFee();
  const total = getTotal();

  // Inclusive/Simulated Tax and Shipping for layout requirements
  const shippingFee = 0; // standard free shipping
  const taxAmount = 0; // inclusive of GST
  const finalTotal = Math.max(0, total - redeemDiscount);

  // Sync redeemed coins discount
  useEffect(() => {
    computeRedeemDiscount(subtotal - discount + offsetFee);
  }, [coinsToRedeem, subtotal, discount, offsetFee]);

  // Reset coins on mount
  useEffect(() => {
    setCoinsToRedeem(0);
  }, []);

  const handleLocationChange = (cityName, coords) => {
    setStreet(cityName);
    // Parse City, State from mock address string
    const parts = cityName.split(', ');
    if (parts.length > 0) setCity(parts[0]);
    if (parts.length > 1) setStateName(parts[1]);
    setZipCode('560001'); // default fallback zipcode
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMessage('');
    try {
      const res = await applyCouponCode(couponInput.trim());
      if (res && res.success) {
        setCouponMessage('🎉 Coupon Applied Successfully');
        setCouponStatus('success');
        addToast('Promo code applied!', 'success');
      } else {
        setCouponMessage('❌ Invalid Coupon');
        setCouponStatus('error');
        addToast('Invalid coupon code.', 'error');
      }
    } catch (err) {
      setCouponMessage('❌ Invalid Coupon');
      setCouponStatus('error');
      addToast('Failed to apply coupon.', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput('');
    setCouponMessage('');
    setCouponStatus('');
    addToast('Promo code removed.', 'info');
  };

  const handleCheckoutSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Validation checks
    if (!fullName.trim()) {
      setCheckoutError('Recipient full name is required.');
      addToast('Recipient name missing.', 'warning');
      return;
    }
    if (!phone.trim()) {
      setCheckoutError('Recipient phone number is required.');
      addToast('Phone number missing.', 'warning');
      return;
    }
    if (!street.trim() || !city.trim() || !stateName.trim() || !zipCode.trim()) {
      setCheckoutError('Please provide complete shipping address details.');
      addToast('Address details incomplete.', 'warning');
      return;
    }
    if (cart.length === 0) {
      setCheckoutError('Your shopping cart is empty.');
      addToast('Cart is empty.', 'warning');
      return;
    }

    setCheckoutError('');
    setLoadingState('loading');

    try {
      // Simulate failed payments sequence
      if (simulatedState === 'failed') {
        const nextFailedCount = failedPaymentAttempts + 1;
        setFailedPaymentAttempts(nextFailedCount);
        throw new Error(`Simulated Payment Gateway Error: Transaction declined by card issuer (Attempts failed: ${nextFailedCount}).`);
      }

      // Format paymentMethod for backend schema
      // Backend expects: 'upi', 'card', 'wallet', 'netbanking', 'cod', 'debit'
      const apiPaymentMethod = paymentMethod;

      const res = await axios.post('/api/orders/place', {
        items: cart,
        couponCode: coupon?.code || '',
        paymentMethod: apiPaymentMethod,
        shippingAddress: {
          street,
          city,
          state: stateName,
          zipCode,
          country: 'India'
        },
        carbonOffsetSelected: carbonOffset,
        failedAttemptsCount: failedPaymentAttempts,
        coinsToRedeem
      });

      if (res.data.success) {
        setPlacedOrder(res.data.order);
        setLoadingState('success');
        clearCart();
        addToast("Order processed successfully!", "success");

        // Wait 1.8 seconds for success animation before redirecting
        setTimeout(() => {
          navigate('/order-success', { state: { order: res.data.order } });
        }, 1800);
      } else {
        setCheckoutError(res.data.message || 'Checkout failed.');
        setLoadingState('idle');
        addToast(res.data.message || 'Checkout failed', "error");
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Transaction processing error.';
      setCheckoutError(errMsg);
      setLoadingState('idle');
      addToast(errMsg, "error");
    }
  };

  // 1. Empty Cart Check
  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 max-w-lg mx-auto px-4 flex flex-col items-center justify-center gap-6 text-center bg-grid-pattern relative">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-darkBorder flex items-center justify-center text-3xl">
          🛒
        </div>
        <div>
          <h1 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">
            Your cart is empty
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Please add some products to your cart before proceeding to checkout.
          </p>
        </div>
        <Link 
          to="/products" 
          className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Continue Shopping</span>
        </Link>
      </div>
    );
  }

  // 2. Failsafe Error boundary check
  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12 max-w-lg mx-auto px-4 flex flex-col items-center justify-center gap-6 text-center bg-grid-pattern relative">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h1 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">
            Unable to load checkout details.
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Please check your network connection or sign in again.
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs transition-all cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-grid-pattern relative">
      {/* Loading & Success Animation Overlays */}
      {loadingState === 'loading' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[500] flex flex-col items-center justify-center gap-5 text-center px-4 animate-fade-in">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
          <div>
            <h3 className="font-extrabold text-lg text-white">Processing Transaction...</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed animate-pulse">
              Running advanced fraud score heuristics & securing catalog stocks. Please hold on.
            </p>
          </div>
        </div>
      )}

      {loadingState === 'success' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[500] flex flex-col items-center justify-center gap-5 text-center px-4 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center animate-bounce shadow-lg shadow-emerald-500/5">
            <CheckCircle2 size={44} />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-white">Order Placed Successfully!</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Generating invoice receipts. Redirecting to delivery summary page...
            </p>
          </div>
        </div>
      )}

      <h1 className="font-black text-2xl text-slate-800 dark:text-slate-100 mb-8">Secure Checkout</h1>

      {checkoutError && (
        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/15 text-red-500 text-xs flex gap-2.5 items-start mb-6 animate-pulse">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>{checkoutError}</span>
        </div>
      )}

      {/* 3-Section Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ==================================================== */}
        {/* SECTION 1: SHIPPING ADDRESS & LOCATION FEATURES */}
        {/* ==================================================== */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5 border-b border-slate-100 dark:border-darkBorder/40 pb-3">
              <MapPin size={16} className="text-emerald-500" />
              <span>Shipping Address</span>
            </h3>

            {/* Geolocation Widget */}
            <div className="bg-slate-50 dark:bg-darkBorder/25 rounded-2xl p-3 border border-slate-100 dark:border-darkBorder/20">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                📍 Location Auto-Fill Services
              </span>
              <LocationSelector onLocationChange={handleLocationChange} />
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Recipient Full Name"
                  className="w-full bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2.5 outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Delivery Contact Number"
                  className="w-full bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2.5 outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Order Notification Email"
                  className="w-full bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2.5 outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Flat No, Building, Area"
                  className="w-full bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2.5 outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City Name"
                    className="w-full bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2.5 outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">State</label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="State Name"
                    className="w-full bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2.5 outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pincode / Zipcode</label>
                <input
                  type="text"
                  required
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit Area Pincode"
                  className="w-full bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2.5 outline-none text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* SECTION 2: ORDER SUMMARY (ITEMS LIST) */}
        {/* ==================================================== */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5 border-b border-slate-100 dark:border-darkBorder/40 pb-3">
              <ShoppingBag size={16} className="text-emerald-500" />
              <span>Order Summary</span>
            </h3>

            <div className="flex flex-col gap-4.5 max-h-[500px] overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.productId} className="flex gap-3 items-center py-2.5 border-b border-slate-100 dark:border-darkBorder/20 last:border-none">
                  <img 
                    src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'} 
                    alt={item.name} 
                    className="w-12 h-12 object-cover rounded-xl bg-slate-100 shrink-0" 
                  />
                  <div className="flex-grow min-w-0 text-xs">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                      Quantity: {item.quantity} • Price: ₹{item.price.toLocaleString()}
                    </span>
                  </div>
                  <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 shrink-0 pl-1">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* SECTION 3: BILL DETAILS & PAYMENT & CHECKOUT ACTIONS */}
        {/* ==================================================== */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Coupon Redemption System */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-3.5 text-xs">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              🏷️ Promotional Coupon
            </span>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Enter Promo Code"
                disabled={!!coupon}
                className="flex-1 bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2 text-xs outline-none text-slate-800 dark:text-slate-100 disabled:opacity-75"
              />
              {coupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
                >
                  {couponLoading ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                </button>
              )}
            </form>
            {couponMessage && (
              <span className={`text-[10px] font-bold block ${couponStatus === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {couponMessage}
              </span>
            )}
          </div>

          {/* SmartCoins Loyalty System */}
          {balance > 0 && (
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">
                  <Coins size={14} className="text-yellow-500" />
                  <span>Redeem SmartCoins</span>
                </span>
                <span className="text-[10px] text-emerald-500 font-bold">Balance: {balance}</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max={Math.min(balance, Math.floor((subtotal - discount + offsetFee) * 2))}
                  value={coinsToRedeem || ''}
                  onChange={(e) => {
                    const maxRedeemLimit = Math.min(balance, Math.floor((subtotal - discount + offsetFee) * 2));
                    const val = Math.max(0, Math.min(maxRedeemLimit, parseInt(e.target.value) || 0));
                    setCoinsToRedeem(val);
                  }}
                  placeholder={`Max Limit: ${Math.min(balance, Math.floor((subtotal - discount + offsetFee) * 2))}`}
                  className="flex-1 bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2 text-xs outline-none text-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => {
                    const maxRedeemLimit = Math.min(balance, Math.floor((subtotal - discount + offsetFee) * 2));
                    setCoinsToRedeem(maxRedeemLimit);
                  }}
                  className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Max
                </button>
              </div>
              {redeemDiscount > 0 && (
                <div className="flex justify-between items-center text-yellow-600 dark:text-yellow-400 font-semibold border-t border-slate-100 dark:border-darkBorder/20 pt-2 text-[11px]">
                  <span>Applied Coins Discount:</span>
                  <span>-₹{redeemDiscount.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Payment Methods */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-3.5 text-xs">
            <h3 className="font-extrabold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <CreditCard size={13} className="text-emerald-500" />
              <span>Select Payment Method</span>
            </h3>

            <div className="flex flex-col gap-2">
              {[
                { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
                { id: 'upi', label: 'UPI / QR Scan', icon: '📱' },
                { id: 'card', label: 'Credit Card', icon: '💳' },
                { id: 'debit', label: 'Debit Card', icon: '💳' },
                { id: 'wallet', label: 'Digital Wallet', icon: '👜' }
              ].map(method => (
                <label 
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-3 rounded-xl border flex gap-3 items-center cursor-pointer select-none transition-colors ${
                    paymentMethod === method.id 
                      ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-555 font-bold' 
                      : 'border-slate-200 dark:border-darkBorder/50 hover:bg-slate-50/50 dark:hover:bg-darkBorder/20 text-slate-500'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="payment_method"
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="text-emerald-500 focus:ring-emerald-500" 
                  />
                  <span className="text-sm">{method.icon}</span>
                  <span className="text-xs text-slate-700 dark:text-slate-355">{method.label}</span>
                </label>
              ))}
            </div>

            {/* Hackathon Gateway Simulation */}
            <div className="border-t border-slate-100 dark:border-darkBorder/40 pt-3 text-[10px]">
              <span className="font-bold text-slate-400 uppercase tracking-widest block mb-2">
                Simulate gateway status
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSimulatedState('success')}
                  className={`flex-1 py-1.5 rounded-lg border font-bold text-center cursor-pointer ${
                    simulatedState === 'success' ? 'border-emerald-500/40 text-emerald-500 bg-emerald-500/5' : 'border-slate-200 dark:border-darkBorder text-slate-400 bg-transparent'
                  }`}
                >
                  Success
                </button>
                <button
                  type="button"
                  onClick={() => setSimulatedState('failed')}
                  className={`flex-1 py-1.5 rounded-lg border font-bold text-center cursor-pointer ${
                    simulatedState === 'failed' ? 'border-red-500/40 text-red-500 bg-red-500/5' : 'border-slate-200 dark:border-darkBorder text-slate-400 bg-transparent'
                  }`}
                >
                  Fail (Decline)
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Details Panel */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-3 text-xs">
            <h4 className="font-extrabold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-darkBorder/20 pb-2">
              Price Details
            </h4>

            <div className="flex justify-between items-center opacity-85">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">₹{subtotal.toLocaleString()}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between items-center text-emerald-500 font-semibold">
                <span>Coupon Discount</span>
                <span>-₹{discount.toLocaleString()}</span>
              </div>
            )}

            {offsetFee > 0 && (
              <div className="flex justify-between items-center text-emerald-555 font-semibold">
                <span>Carbon Offset Contribution</span>
                <span>+₹{offsetFee.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between items-center opacity-85">
              <span>Shipping Fee</span>
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
              </span>
            </div>

            <div className="flex justify-between items-center opacity-85">
              <span>Tax (Inclusive GST)</span>
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                {taxAmount === 0 ? '₹0' : `₹${taxAmount}`}
              </span>
            </div>

            {redeemDiscount > 0 && (
              <div className="flex justify-between items-center text-yellow-600 dark:text-yellow-400 font-semibold">
                <span>Coin Discount</span>
                <span>-₹{redeemDiscount.toLocaleString()}</span>
              </div>
            )}

            <div className="border-t border-slate-100 dark:border-darkBorder/60 pt-3 flex justify-between items-center font-black text-sm text-slate-900 dark:text-slate-100">
              <span>Grand Total</span>
              <span className="text-base text-emerald-600 dark:text-emerald-400">
                ₹{finalTotal.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleCheckoutSubmit}
              disabled={loadingState === 'loading'}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 active:scale-98 transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loadingState === 'loading' ? 'Processing...' : 'Place Order'}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
