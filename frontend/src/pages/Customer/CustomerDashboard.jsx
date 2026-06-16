import React, { useEffect, useState } from 'react';
import axios from '../../services/api.js';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useCoins } from '../../context/CoinsContext';
import ProductCard from '../../components/Product/ProductCard';
import { 
  User, MapPin, ShoppingBag, Award, ShieldAlert, ShieldCheck, CheckCircle2, ChevronRight, Copy, Share2, ClipboardCheck, Heart, Sparkles, Leaf, Coins, Receipt, Hourglass, XCircle
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user, updateProfile, addAddress, deleteAddress, refreshUser } = useAuth();
  const { wishlist } = useCart();
  const { balance } = useCoins();
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  
  // Profile state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileMessage, setProfileMessage] = useState('');
  
  // Address state
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [addrMessage, setAddrMessage] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Selected order details modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Clipboard copy state
  const [copied, setCopied] = useState(false);

  // Security activity state
  const [loginHistory, setLoginHistory] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(extension)) {
      setUploadError('Allowed image formats: JPG, JPEG, PNG, WEBP.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds the 5MB limit.');
      return;
    }

    setUploadError('');
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        setProfileMessage('✅ Profile photo updated successfully.');
        refreshUser();
      } else {
        setUploadError(res.data.message || 'Upload failed.');
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload file. Size limit or extension blocked.');
    } finally {
      setUploading(false);
    }
  };
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('/api/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        console.error('Failed to load user orders:', err.message);
      } finally {
        setLoadingOrders(false);
      }
    };

    const fetchRecommendations = async () => {
      try {
        const res = await axios.get('/api/products/ai/recommendations');
        if (res.data.success) {
          setRecommendations(res.data.products || []);
        }
      } catch (err) {
        console.error('Failed to load recommendations:', err.message);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    const fetchSecurityData = async () => {
      try {
        const historyRes = await axios.get('/api/auth/login-history');
        if (historyRes.data.success) {
          setLoginHistory(historyRes.data.loginHistory || []);
        }
        const alertsRes = await axios.get('/api/auth/security-alerts');
        if (alertsRes.data.success) {
          setSecurityAlerts(alertsRes.data.securityAlerts || []);
        }
      } catch (err) {
        console.error('Failed to load user security activity:', err.message);
      }
    };

    fetchOrders();
    fetchRecommendations();
    fetchSecurityData();
    refreshUser();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    try {
      const res = await updateProfile(profileName, profilePhone);
      if (res.success) {
        setProfileMessage('✅ Profile updated successfully.');
      }
    } catch (err) {
      setProfileMessage('Failed to update profile.');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddrMessage('');
    try {
      const res = await addAddress({
        street,
        city,
        state: stateName,
        zipCode,
        country: 'India',
        isDefault: user.addresses?.length === 0
      });
      if (res.success) {
        setAddrMessage('✅ Address added successfully.');
        setStreet('');
        setCity('');
        setStateName('');
        setZipCode('');
        setShowAddressForm(false);
      }
    } catch (err) {
      setAddrMessage('Failed to save address.');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await deleteAddress(id);
    } catch (e) {
      console.error(e.message);
    }
  };

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTierDetails = (tier) => {
    const mapping = {
      Bronze: { label: 'Bronze TIER', next: 500, multiplier: '0% off checkout', color: 'badge-bronze' },
      Silver: { label: 'Silver TIER', next: 1500, multiplier: '2% off checkout', color: 'badge-silver' },
      Gold: { label: 'Gold TIER', next: 4000, multiplier: '5% off checkout', color: 'badge-gold' },
      Platinum: { label: 'Platinum TIER', next: 10000, multiplier: '10% off checkout', color: 'badge-platinum' }
    };
    return mapping[tier || 'Bronze'];
  };

  const tierDetails = getTierDetails(user?.tier);
  const nextTierProgress = user ? Math.min(100, Math.round((user.rewardPoints / tierDetails.next) * 100)) : 0;

  // Timeline events styling
  const timelineStages = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
  const getStageIndex = (status) => timelineStages.indexOf(status);

  return (
    <div className="min-h-screen pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-grid-pattern relative">
      <div className="absolute top-20 right-1/4 w-96 h-96 aura-glow-primary pointer-events-none rounded-full"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Profile & Gamification */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* User Profile Summary */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <User size={16} className="text-emerald-500" />
              <span>My Profile</span>
            </h3>

            {/* Profile Picture Secure Upload */}
            <div className="flex flex-col items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-darkBorder/40">
              <div className="relative group">
                <div className="w-16 h-16 rounded-full border-2 border-emerald-500/30 overflow-hidden bg-slate-100 dark:bg-darkBorder/40 flex items-center justify-center text-slate-700 dark:text-slate-200">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-black uppercase">{user?.name ? user.name[0] : 'U'}</span>
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white cursor-pointer shadow-md transition-colors border border-white dark:border-darkCard">
                  <span className="text-[11px] font-bold">+</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {uploading ? 'Uploading Photo...' : 'Update Avatar (Max 5MB)'}
              </span>
              {uploadError && <div className="text-[9px] font-bold text-red-500 text-center">{uploadError}</div>}
            </div>

            {profileMessage && <div className="text-[10px] font-bold text-emerald-500">{profileMessage}</div>}

            <form onSubmit={handleProfileUpdate} className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2.5 outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Phone</label>
                <input
                  type="tel"
                  required
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2.5 outline-none text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Email (Locked)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="bg-slate-100 dark:bg-darkBorder/20 text-slate-400 border border-transparent rounded-xl px-3 py-2.5 outline-none cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl cursor-pointer"
              >
                Update Details
              </button>
            </form>
          </div>

          {/* Gamification Dashboard widgets */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Award size={16} className="text-emerald-500" />
              <span>Reward & Loyalty Center</span>
            </h3>

            {/* Current level summary */}
            <div className={`p-4 rounded-xl text-white flex justify-between items-center ${tierDetails.color}`}>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest block opacity-90">{tierDetails.label}</span>
                <span className="font-extrabold text-lg block mt-0.5">{user?.rewardPoints || 0} Points</span>
              </div>
              <span className="text-3xl">👑</span>
            </div>

            {/* Tier progress bar */}
            {user?.tier !== 'Platinum' && (
              <div className="text-xs">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 uppercase">
                  <span>Progress to Next Tier</span>
                  <span>{nextTierProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-darkBorder overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${nextTierProgress}%` }}></div>
                </div>
                <span className="text-[9px] text-slate-500 mt-1 block">
                  Earn {tierDetails.next - (user?.rewardPoints || 0)} more points to level up.
                </span>
              </div>
            )}

            <div className="text-xs space-y-2 border-t border-slate-100 dark:border-darkBorder/40 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Discount Multiplier:</span>
                <span className="font-bold text-emerald-500">{tierDetails.multiplier}</span>
              </div>
            </div>

            {/* Referral system code */}
            <div className="border-t border-slate-100 dark:border-darkBorder/40 pt-4 flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Refer a Friend</span>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-darkBorder/30 border border-slate-200 dark:border-darkBorder/30 flex justify-between items-center text-xs">
                <code className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">{user?.referralCode}</code>
                <button
                  onClick={copyReferralCode}
                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors cursor-pointer"
                  title="Copy referral code"
                >
                  {copied ? <ClipboardCheck size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <span className="text-[9px] text-slate-500 leading-snug">
                Earn 150 points for each friend who verifies their account with your code.
              </span>
            </div>

            {/* Device Tracking & Security Logs */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>Recent Login Activity</span>
              </h3>
              
              {securityAlerts.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Active Warnings</span>
                  {securityAlerts.map((alert, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/15 text-red-500 text-[10px]">
                      <div className="font-bold flex items-center gap-1">
                        <span>⚠️</span>
                        <span>{alert.title}</span>
                      </div>
                      <p className="mt-0.5 text-slate-500 dark:text-slate-400">{alert.message}</p>
                      <span className="text-[8px] text-slate-405 mt-1 block">{new Date(alert.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Login History</span>
                {loginHistory.length === 0 ? (
                  <div className="text-[10px] text-slate-400 text-center py-2">No login logs recorded.</div>
                ) : (
                  loginHistory.map((log, i) => (
                    <div key={i} className="p-2 rounded-xl bg-slate-50/50 dark:bg-darkBorder/20 border border-slate-100 dark:border-darkBorder/40 flex flex-col text-[10px]">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-800 dark:text-slate-200">{log.device} • {log.browser}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold ${
                          log.status === 'success' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-red-500/10 text-red-650'
                        }`}>{log.status}</span>
                      </div>
                      <div className="flex justify-between text-[8px] text-slate-400 dark:text-slate-500 mt-1">
                        <span>IP: {log.ipAddress}</span>
                        <span>{new Date(log.loginTime).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Unlocked Achievements list */}
            <div className="border-t border-slate-100 dark:border-darkBorder/40 pt-4 flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unlocked Achievements</span>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                {user?.achievements && user.achievements.length > 0 ? (
                  user.achievements.map((ach, idx) => (
                    <div 
                      key={idx}
                      className="p-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400 text-xs flex gap-2 items-center"
                    >
                      <span className="text-base">🏆</span>
                      <div>
                        <strong className="block text-[10px] font-bold">{ach.title}</strong>
                        <span className="text-[9px] opacity-80">{ach.description}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-500 italic">No achievements unlocked yet. Make a purchase to start!</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Order history list & Addresses */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Statistics Grid */}
          {(() => {
            const pendingOrders = orders.filter(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled').length;
            const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered').length;
            const cancelledOrders = orders.filter(o => o.orderStatus === 'cancelled').length;
            const totalSpent = orders.reduce((sum, o) => sum + o.netAmount, 0);
            
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                {/* Total Orders Card */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Total Purchases</span>
                    <strong className="text-base font-black text-slate-900 dark:text-slate-100">{orders.length} Orders</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><ShoppingBag size={14} /></div>
                </div>

                {/* Pending Orders Card */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Pending Orders</span>
                    <strong className="text-base font-black text-slate-900 dark:text-slate-100">{pendingOrders} Active</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500"><Hourglass size={14} /></div>
                </div>

                {/* Delivered Orders Card */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Delivered</span>
                    <strong className="text-base font-black text-slate-900 dark:text-slate-100">{deliveredOrders} Shipped</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><CheckCircle2 size={14} /></div>
                </div>

                {/* Cancelled Orders Card */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Cancelled</span>
                    <strong className="text-base font-black text-slate-900 dark:text-slate-100">{cancelledOrders} Revoked</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-red-500/10 text-red-500"><XCircle size={14} /></div>
                </div>

                {/* Wishlist Items Card */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Wishlist Items</span>
                    <strong className="text-base font-black text-slate-900 dark:text-slate-100">{wishlist.length} Items</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500"><Heart size={14} /></div>
                </div>

                {/* Reward Coins Card */}
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">SmartCoins</span>
                    <strong className="text-base font-black text-slate-900 dark:text-slate-100">{balance} Coins</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500"><Coins size={14} /></div>
                </div>

                {/* Total Amount Spent Card */}
                <div className="col-span-2 p-3.5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Total Amount Spent</span>
                    <strong className="text-base font-black text-emerald-600 dark:text-emerald-400">₹{totalSpent.toLocaleString()} Spent</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><Receipt size={14} /></div>
                </div>
              </div>
            );
          })()}

          {/* Order history summary */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShoppingBag size={16} className="text-emerald-500" />
              <span>Purchase History</span>
            </h3>

            {loadingOrders ? (
              <div className="flex flex-col gap-3.5 animate-pulse py-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-3.5 border-b border-slate-100 dark:border-darkBorder/30">
                    <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800"></div>
                    <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800"></div>
                    <div className="h-4 w-14 rounded bg-slate-200 dark:bg-slate-800"></div>
                    <div className="h-4.5 w-16 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                    <div className="h-4 w-8 rounded bg-slate-200 dark:bg-slate-800"></div>
                  </div>
                ))}
              </div>
            ) : orders.length > 0 ? (
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[600px] text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-darkBorder/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 pr-2">Reference</th>
                      <th className="pb-3 px-2">Date</th>
                      <th className="pb-3 px-2">Bill Total</th>
                      <th className="pb-3 px-2">Tracking</th>
                      <th className="pb-3 pl-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr 
                        key={order._id}
                        className="border-b border-slate-100 dark:border-darkBorder/40 hover:bg-slate-50/20 dark:hover:bg-darkBorder/10 transition-colors"
                      >
                        <td className="py-4 pr-2 font-bold text-slate-700 dark:text-slate-200 truncate max-w-[80px]">
                          #{order._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="py-4 px-2 text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-2 font-extrabold text-slate-800 dark:text-slate-200">
                          ₹{order.netAmount.toLocaleString()}
                        </td>
                        <td className="py-4 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            order.orderStatus === 'delivered'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : (order.orderStatus === 'shipped' || order.orderStatus === 'out_for_delivery' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-600')
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-4 pl-2 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-emerald-500 hover:underline font-bold flex items-center gap-0.5 ml-auto text-[10px] cursor-pointer"
                          >
                            <span>Track</span>
                            <ChevronRight size={10} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <span className="text-xs text-slate-500 py-8 text-center italic">No orders submitted. Click Shop All to browse products!</span>
            )}
          </div>

          {/* Delivery Addresses manager */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MapPin size={16} className="text-emerald-500" />
                <span>My Addresses</span>
              </h3>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs text-emerald-500 font-bold hover:underline cursor-pointer"
              >
                {showAddressForm ? 'Cancel' : '+ Add Address'}
              </button>
            </div>

            {addrMessage && <div className="text-[10px] font-bold text-emerald-500">{addrMessage}</div>}

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="grid grid-cols-2 gap-3 text-xs pt-2 border-b border-slate-100 dark:border-darkBorder/40 pb-4">
                <div className="col-span-2 flex flex-col gap-1">
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Street Address, Block Name"
                    className="w-full bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2.5 outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2.5 outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="State"
                    className="w-full bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2.5 outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Zip / Pin code"
                    className="w-full bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2.5 outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Address
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user?.addresses && user.addresses.length > 0 ? (
                user.addresses.map((addr, idx) => (
                  <div 
                     key={idx}
                     className="p-4 rounded-xl border border-slate-200 dark:border-darkBorder/60 bg-slate-50/50 dark:bg-darkBorder/20 flex flex-col justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <strong className="font-extrabold text-slate-800 dark:text-slate-200">Address Option #{idx + 1}</strong>
                        {addr.isDefault && (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1 rounded border border-emerald-500/20">DEFAULT</span>
                        )}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 leading-normal">{addr.street}, {addr.city}, {addr.state} - {addr.zipCode}</p>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-[10px] text-red-500 hover:underline font-bold self-start mt-1 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-500 py-2 italic">No address listings found.</span>
              )}
            </div>
          </div>

          {/* AI-Powered Product Recommendations */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles size={16} className="text-emerald-500 animate-pulse" />
              <span>AI Personalized Picks</span>
            </h3>

            {loadingRecommendations ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex flex-col gap-3 p-4 rounded-2xl border border-slate-100 dark:border-darkBorder bg-slate-50/50 dark:bg-darkBorder/10">
                    <div className="bg-slate-200 dark:bg-slate-800 rounded-xl aspect-video"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mt-2"></div>
                  </div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {recommendations.slice(0, 3).map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic py-2">No recommendations available. Keep shopping to train our smart recommendations engine!</span>
            )}
          </div>
        </div>
      </div>

      {/* Selected Order Tracking Timeline Modal Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl p-6 bg-white dark:bg-darkCard border border-slate-200/50 dark:border-darkBorder flex flex-col gap-6 glass shadow-2xl relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div>
              <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                Track Order Timeline
              </h3>
              <p className="text-[10px] text-slate-500">
                Reference ID: {selectedOrder._id} • Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Simulated timeline tracking visual */}
            <div className="flex flex-col gap-4 pl-4 border-l border-slate-200 dark:border-darkBorder relative max-h-60 overflow-y-auto pr-1 py-1">
              {timelineStages.map((stage, idx) => {
                const currentStageIdx = getStageIndex(selectedOrder.orderStatus);
                const isCompleted = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;

                // Match with event description if matches
                const matchingEvent = selectedOrder.trackingTimeline?.find(e => e.status === stage);
                
                return (
                  <div key={stage} className="relative flex gap-4 items-start text-xs">
                    {/* Circle Pin indicator */}
                    <div className={`absolute -left-[22px] w-2.5 h-2.5 rounded-full border-2 transition-all ${
                      isCompleted 
                        ? 'bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-500/20 scale-110' 
                        : 'bg-white dark:bg-darkBg border-slate-300 dark:border-slate-700'
                    } ${isCurrent ? 'animate-ping' : ''}`} />

                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <strong className={`font-bold capitalize ${isCompleted ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                          {stage.replace(/_/g, ' ')}
                        </strong>
                        {matchingEvent && (
                          <span className="text-[9px] text-slate-500">
                            {new Date(matchingEvent.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                        {matchingEvent?.description || `Awaiting stage: ${stage.replace(/_/g, ' ')}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-105 dark:border-darkBorder/40 pt-4 flex justify-between text-xs font-bold">
              <span>Items Total Bill:</span>
              <span className="text-emerald-555 font-extrabold text-sm">₹{selectedOrder.netAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
