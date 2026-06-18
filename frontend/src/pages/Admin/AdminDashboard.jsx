import React, { useEffect, useState } from 'react';
import axios from '../../services/api.js';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Users, ShoppingBag, ShieldAlert, CheckCircle2, UserX, UserCheck, DollarSign, ListFilter, AlertTriangle, ShieldCheck 
} from 'lucide-react';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [fraudReports, setFraudReports] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [securityStats, setSecurityStats] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, sellers, fraud, security, loyalty_reviews
  
  const [actionMessage, setActionMessage] = useState('');

  // Loyalty adjusting states
  const [adjustingUserId, setAdjustingUserId] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const fetchAdminData = async () => {
    try {
      const res = await axios.get('/api/admin/analytics');
      if (res.data.success) {
        setAnalytics(res.data.analytics);
      }

      const userRes = await axios.get('/api/admin/users');
      if (userRes.data.success) {
        setUsers(userRes.data.users || []);
      }

      const fraudRes = await axios.get('/api/admin/fraud-reports');
      if (fraudRes.data.success) {
        setFraudReports(fraudRes.data.reports || []);
      }

      const reviewRes = await axios.get('/api/admin/reviews');
      if (reviewRes.data.success) {
        setReviews(reviewRes.data.reviews || []);
      }

      const ordersRes = await axios.get('/api/admin/orders');
      if (ordersRes.data.success) {
        setOrders(ordersRes.data.orders || []);
      }

      const secRes = await axios.get('/api/admin/security-dashboard');
      if (secRes.data.success) {
        setSecurityStats(secRes.data.stats);
      }
    } catch (e) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateUserStatus = async (id, status) => {
    setActionMessage('');
    try {
      const res = await axios.put(`/api/admin/users/${id}/status`, { status });
      if (res.data.success) {
        setActionMessage(`✅ User status updated to: ${status.toUpperCase()}`);
        fetchAdminData();
      }
    } catch (err) {
      setActionMessage('Failed to update user status.');
    }
  };

  const handleReviewFraud = async (reportId, action) => {
    setActionMessage('');
    try {
      const res = await axios.post(`/api/admin/fraud-reports/${reportId}/review`, { action });
      if (res.data.success) {
        setActionMessage(`✅ Fraud resolution recorded: ${action.toUpperCase()}`);
        fetchAdminData();
      }
    } catch (err) {
      setActionMessage('Failed to update fraud log.');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    setActionMessage('');
    try {
      const res = await axios.put(`/api/orders/${orderId}/status`, { status });
      if (res.data.success) {
        setActionMessage(`✅ Order successfully ${status === 'confirmed' ? 'approved' : 'declined'}.`);
        fetchAdminData();
      }
    } catch (err) {
      setActionMessage('Failed to update order status.');
    }
  };

  const handleAdjustCoins = async (userId, isDeduct = false) => {
    if (!adjustAmount || isNaN(adjustAmount)) {
      setActionMessage('⚠️ Please enter a valid coins amount.');
      return;
    }
    setActionMessage('');
    const amt = parseInt(adjustAmount) * (isDeduct ? -1 : 1);
    try {
      const res = await axios.post('/api/admin/coins/adjust', {
        userId,
        amount: amt,
        reason: adjustReason || 'Admin manual adjustment'
      });
      if (res.data.success) {
        setActionMessage(`✅ Coins updated successfully. New balance: ${res.data.balance}`);
        setAdjustAmount('');
        setAdjustReason('');
        setAdjustingUserId(null);
        fetchAdminData();
      }
    } catch (err) {
      setActionMessage('Failed to adjust user coins.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    setActionMessage('');
    try {
      const res = await axios.delete(`/api/products/reviews/${reviewId}`);
      if (res.data.success) {
        setActionMessage('✅ Review purged successfully.');
        fetchAdminData();
      }
    } catch (err) {
      setActionMessage('Failed to purge review.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin"></div>
        <span className="text-xs text-gray-400">Loading Admin Dashboard...</span>
      </div>
    );
  }

  const { customersCount = 0, sellersCount = {}, productsCount = 0, totalOrdersCount = 0, totalRevenue = 0, categoryDistribution = [], dailyAnalytics = [] } = analytics || {};

  // Pie colors
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  const pendingSellers = users.filter(u => u.role === 'seller' && u.status === 'pending_verification');
  const activeUsersList = users.filter(u => u.status !== 'pending_verification');

  return (
    <div className="min-h-screen pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-grid-pattern relative">
      <div className="absolute top-20 left-1/3 w-96 h-96 aura-glow-purple pointer-events-none rounded-full"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-black text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Admin Control Panel</span>
            <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20">
              System Controller
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Global platform statistics and security auditing logs</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 text-xs font-bold bg-white dark:bg-darkCard p-1 rounded-xl border border-gray-200/50 dark:border-darkBorder max-w-full overflow-x-auto whitespace-nowrap scrollbar-none">
          {[
            { id: 'analytics', label: 'Platform Stats' },
            { id: 'orders', label: `Order Approvals (${orders.filter(o => o.orderStatus === 'pending_admin_approval').length})` },
            { id: 'sellers', label: `Seller Approvals (${pendingSellers.length})` },
            { id: 'fraud', label: `Fraud Audit (${fraudReports.filter(r => r.status === 'pending').length})` },
            { id: 'security', label: `Security Audit (${securityStats?.allAlerts?.length || 0})` },
            { id: 'loyalty_reviews', label: 'Loyalty & Reviews' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setActionMessage(''); }}
              className={`px-4 py-2 rounded-lg transition-all shrink-0 ${
                activeTab === tab.id 
                  ? 'bg-emerald-500 text-white' 
                  : 'text-gray-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-emerald-500 text-xs font-bold text-center mb-6">
          {actionMessage}
        </div>
      )}

      {/* ==================================================== */}
      {/* 1. ANALYTICS VIEW */}
      {/* ==================================================== */}
      {activeTab === 'analytics' && (
        <div className="flex flex-col gap-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="p-4 rounded-2xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Global GMV Revenue</span>
                <strong className="text-xl font-extrabold text-slate-900 dark:text-slate-100">₹{totalRevenue.toLocaleString()}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500"><DollarSign size={16} /></div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Total shoppers</span>
                <strong className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{customersCount} Users</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500"><Users size={16} /></div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Active Merchants</span>
                <strong className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{sellersCount.active} Sellers</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500"><ShoppingBag size={16} /></div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Global Products</span>
                <strong className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{productsCount} Items</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500"><ListFilter size={16} /></div>
            </div>
          </div>

          {/* Graphics split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Global sales line chart */}
            <div className="lg:col-span-8 p-5 rounded-3xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Daily Revenue Trends</h3>
                <span className="text-[10px] text-gray-500 block">Live GMV calculations over past 7 days</span>
              </div>
              <div className="h-72 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.1)" />
                    <XAxis dataKey="date" stroke="#888888" tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                    <Tooltip formatter={value => [`₹${value.toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Popular categories Pie Chart */}
            <div className="lg:col-span-4 p-5 rounded-3xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Category Popularity</h3>
                <span className="text-[10px] text-gray-500 block">Distribution of products across catalog</span>
              </div>
              <div className="h-72 w-full text-xs relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={value => [`${value} Products`, 'Category']} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom absolute details list to fix layout overlay */}
                <div className="absolute bottom-2 left-0 right-0 flex flex-wrap gap-2 justify-center text-[9px] font-bold uppercase select-none">
                  {categoryDistribution.slice(0, 4).map((entry, index) => (
                    <span key={index} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span>{entry.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. SELLER APPROVALS VIEW */}
      {/* ==================================================== */}
      {activeTab === 'sellers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Pending Approval List */}
          <div className="lg:col-span-6 p-5 rounded-2xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <AlertTriangle className="text-amber-500 animate-pulse" size={16} />
              <span>Pending Applications ({pendingSellers.length})</span>
            </h3>

            <div className="flex flex-col gap-3.5 max-h-96 overflow-y-auto pr-1">
              {pendingSellers.length > 0 ? (
                pendingSellers.map(seller => (
                  <div 
                    key={seller._id}
                    className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex justify-between items-center text-xs"
                  >
                    <div>
                      <strong className="block font-bold text-slate-800 dark:text-slate-200">{seller.name}</strong>
                      <span className="text-gray-400 text-[10px] block mt-0.5">{seller.email}</span>
                      <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                        Address: {seller.addresses?.[0]?.street}, {seller.addresses?.[0]?.city}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleUpdateUserStatus(seller._id, 'active')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1"
                      >
                        <UserCheck size={11} />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleUpdateUserStatus(seller._id, 'suspended')}
                        className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] flex items-center gap-1"
                      >
                        <UserX size={11} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-xs text-gray-400 py-4 text-center italic">No new merchant registrations pending approval.</span>
              )}
            </div>
          </div>

          {/* Active Merchants Register list */}
          <div className="lg:col-span-6 p-5 rounded-2xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Merchant Registry</h3>
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[550px] text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-darkBorder/60 text-gray-400 font-bold uppercase tracking-wider text-[10px] pb-2">
                    <th className="pb-3 pr-2">Vendor Name</th>
                    <th className="pb-3 px-2">Role</th>
                    <th className="pb-3 px-2 text-center">Status</th>
                    <th className="pb-3 pl-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeUsersList.map(item => (
                    <tr key={item._id} className="border-b border-gray-100 dark:border-darkBorder/30 hover:bg-gray-50/20 dark:hover:bg-darkBorder/10 transition-colors">
                      <td className="py-3 pr-2 font-bold text-slate-700 dark:text-slate-200">
                        {item.name}
                        <span className="block text-[9px] text-gray-400 font-normal">{item.email}</span>
                      </td>
                      <td className="py-3 px-2 capitalize">{item.role}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          item.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 pl-2 text-right">
                        {item.status === 'active' ? (
                          <button
                            onClick={() => handleUpdateUserStatus(item._id, 'suspended')}
                            className="text-[10px] font-bold text-rose-500 hover:underline"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateUserStatus(item._id, 'active')}
                            className="text-[10px] font-bold text-emerald-500 hover:underline"
                          >
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* ORDER APPROVALS VIEW */}
      {/* ==================================================== */}
      {activeTab === 'orders' && (
        <div className="flex flex-col gap-8 animate-fade-in">
          <div className="p-5 rounded-2xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShoppingBag className="text-emerald-500" size={16} />
              <span>Pending Order Approvals</span>
            </h3>

            <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-1">
              {orders.filter(o => o.orderStatus === 'pending_admin_approval').map(order => (
                <div key={order._id} className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center text-xs">
                  <div className="flex-1">
                    <strong className="block font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </strong>
                    <div className="text-[10px] text-gray-500 flex flex-col gap-1">
                      <span>Customer: {order.customerName} ({order.customerEmail})</span>
                      <span>Total Amount: ₹{order.netAmount.toLocaleString()} ({order.paymentMethod.toUpperCase()})</span>
                      <span>Items: {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleUpdateOrderStatus(order._id, 'confirmed')}
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-md shadow-emerald-500/20"
                    >
                      <CheckCircle2 size={12} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(order._id, 'declined_by_admin')}
                      className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-md shadow-rose-500/20"
                    >
                      <UserX size={12} />
                      Decline
                    </button>
                  </div>
                </div>
              ))}
              {orders.filter(o => o.orderStatus === 'pending_admin_approval').length === 0 && (
                <span className="text-xs text-gray-400 py-8 text-center italic">No orders pending admin approval right now.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. FRAUD SAFETY AUDITS VIEW */}
      {/* ==================================================== */}
      {activeTab === 'fraud' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Active Risk Alerts list */}
          <div className="lg:col-span-8 p-5 rounded-2xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldAlert className="text-rose-500 animate-bounce" size={16} />
              <span>Fraud Risk Logs</span>
            </h3>

            <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-1">
              {fraudReports.map(report => {
                const isPending = report.status === 'pending';
                const isCrit = report.riskScore >= 75;
                return (
                  <div 
                    key={report._id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center text-xs ${
                      isPending 
                        ? (isCrit ? 'border-red-500/35 bg-red-950/20' : 'border-yellow-500/35 bg-yellow-950/20')
                        : 'border-gray-200 dark:border-darkBorder/40 bg-gray-50/20 dark:bg-darkCard/20 opacity-70'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <strong className="font-extrabold text-slate-800 dark:text-slate-200">Risk Score: {report.riskScore}%</strong>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          isPending ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-1">
                        User: {report.customerEmail} • Amount: ₹{report.totalAmount?.toLocaleString() || '0'}
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {report.triggers?.map((trig, idx) => (
                          <span key={idx} className="bg-black/25 text-red-300 px-2 py-0.5 rounded text-[9px] font-bold">
                            {trig}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    {isPending ? (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleReviewFraud(report._id, 'approve')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1"
                        >
                          <ShieldCheck size={11} />
                          <span>Clear Order</span>
                        </button>
                        <button
                          onClick={() => handleReviewFraud(report._id, 'refund')}
                          className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] flex items-center gap-1"
                        >
                          <UserX size={11} />
                          <span>Cancel Order</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Action Taken: {report.actionTaken}</span>
                    )}
                  </div>
                );
              })}

              {fraudReports.length === 0 && (
                <span className="text-xs text-gray-400 text-center py-4 italic">No security incidents flagged.</span>
              )}
            </div>
          </div>

          {/* Safety Engine info guide */}
          <div className="lg:col-span-4 p-5 rounded-2xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4 shadow-sm text-xs">
            <h4 className="font-extrabold text-slate-800 dark:text-slate-200">Security Parameters</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Our simulated Fraud Detection System scores transaction risk based on heuristic guidelines:
            </p>
            <ul className="space-y-2 text-[10px] text-gray-500 leading-relaxed list-disc pl-4">
              <li>Transactions exceeding ₹50,000 are flagged as HIGH_VALUE_TRANSACTION (+45% risk).</li>
              <li>Placing multiple orders within a 5-minute interval triggers HIGH_FREQUENCY_VELOCITY (+35% risk).</li>
              <li>Accumulating 3 consecutive failed checkout submission errors sets MULTIPLE_FAILED_PAYMENTS (+25% risk).</li>
            </ul>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. LOYALTY & REVIEWS MANAGEMENT VIEW */}
      {/* ==================================================== */}
      {activeTab === 'loyalty_reviews' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coins Adjuster Grid */}
          <div className="lg:col-span-6 p-5 rounded-2xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4 shadow-sm text-xs">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>SmartCoins Loyalty Ledger</span>
            </h3>
            
            <div className="flex flex-col gap-3.5 max-h-[450px] overflow-y-auto pr-1">
              {users.length > 0 ? (
                users.map(u => (
                  <div key={u._id} className="p-3.5 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkBorder/10 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <strong className="block font-bold text-slate-800 dark:text-slate-200">{u.name}</strong>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{u.email} • Role: {u.role.toUpperCase()}</span>
                      </div>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                        🪙 {u.coinBalance || 0}
                      </span>
                    </div>

                    {adjustingUserId === u._id ? (
                      <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-darkBorder/40 animate-slide-in">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            placeholder="Coins Amount"
                            value={adjustAmount}
                            onChange={(e) => setAdjustAmount(e.target.value)}
                            className="w-1/3 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-lg px-2.5 py-1.5 outline-none text-slate-800 dark:text-slate-100"
                          />
                          <input
                            type="text"
                            placeholder="Reason (Optional)"
                            value={adjustReason}
                            onChange={(e) => setAdjustReason(e.target.value)}
                            className="flex-1 bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-lg px-2.5 py-1.5 outline-none text-slate-800 dark:text-slate-100"
                          />
                        </div>
                        <div className="flex justify-end gap-2 text-[10px]">
                          <button
                            onClick={() => setAdjustingUserId(null)}
                            className="px-2.5 py-1 hover:underline text-gray-500 font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAdjustCoins(u._id, true)}
                            className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold"
                          >
                            Deduct
                          </button>
                          <button
                            onClick={() => handleAdjustCoins(u._id, false)}
                            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end border-t border-slate-105 dark:border-darkBorder/40 pt-2">
                        <button
                          onClick={() => {
                            setAdjustingUserId(u._id);
                            setAdjustAmount('');
                            setAdjustReason('');
                          }}
                          className="text-emerald-500 font-bold hover:underline cursor-pointer"
                        >
                          Adjust Coins
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <span className="text-xs text-gray-400 py-4 text-center italic">No active users loaded in database registries.</span>
              )}
            </div>
          </div>

          {/* Reviews Audit Grid */}
          <div className="lg:col-span-6 p-5 rounded-2xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4 shadow-sm text-xs">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>Fake Reviews Cleaner</span>
            </h3>

            <div className="flex flex-col gap-3.5 max-h-[450px] overflow-y-auto pr-1">
              {reviews.length > 0 ? (
                reviews.map(rev => (
                  <div key={rev._id} className="p-3.5 rounded-xl border border-slate-100 dark:border-darkBorder bg-slate-50/50 dark:bg-darkBorder/10 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="block text-slate-800 dark:text-slate-200">{rev.customerName}</strong>
                        <span className="text-[10px] text-gray-400 block mt-0.5">Product: <span className="font-semibold text-slate-600 dark:text-slate-350">{rev.productName}</span></span>
                      </div>
                      <span className="text-yellow-500 font-extrabold">{rev.rating} ★</span>
                    </div>
                    <p className="italic text-slate-600 dark:text-slate-300 leading-relaxed">
                      "{rev.comment}"
                    </p>
                    <div className="flex justify-between items-center border-t border-slate-100 dark:border-darkBorder/30 pt-2 text-[10px] text-gray-400">
                      <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        className="text-red-500 hover:underline font-bold cursor-pointer"
                      >
                        Purge Review
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-xs text-gray-400 text-center py-4 italic">No product reviews found on the database logs.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. SECURITY AUDIT VIEW */}
      {/* ==================================================== */}
      {activeTab === 'security' && (
        <div className="flex flex-col gap-8 animate-fade-in">
          {/* Security Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="p-4 rounded-2xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Active Users (24h)</span>
                <strong className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {securityStats?.totalActiveUsers || 0} / {securityStats?.totalUsersCount || 0}
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500"><Users size={16} /></div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Locked Accounts</span>
                <strong className={`text-xl font-extrabold ${(securityStats?.lockedAccountsCount || 0) > 0 ? 'text-red-500 animate-pulse' : 'text-slate-900 dark:text-slate-100'}`}>
                  {securityStats?.lockedAccountsCount || 0}
                </strong>
              </div>
              <div className={`p-2.5 rounded-xl ${(securityStats?.lockedAccountsCount || 0) > 0 ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 text-slate-500'}`}>
                <UserX size={16} />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Total Failed Logins</span>
                <strong className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {securityStats?.totalFailedAttempts || 0}
                </strong>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500"><AlertTriangle size={16} /></div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Security Alerts</span>
                <strong className={`text-xl font-extrabold ${(securityStats?.allAlerts?.length || 0) > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {securityStats?.allAlerts?.length || 0}
                </strong>
              </div>
              <div className={`p-2.5 rounded-xl ${(securityStats?.allAlerts?.length || 0) > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                <ShieldAlert size={16} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Locked Accounts & Alerts */}
            <div className="lg:col-span-6 flex flex-col gap-8">
              {/* Locked Accounts List */}
              <div className="p-5 rounded-2xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4 shadow-sm text-xs">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <UserX className="text-red-500" size={16} />
                  <span>Locked Accounts ({securityStats?.lockedAccounts?.length || 0})</span>
                </h3>
                
                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                  {securityStats?.lockedAccounts && securityStats.lockedAccounts.length > 0 ? (
                    securityStats.lockedAccounts.map(account => (
                      <div key={account.id} className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 flex justify-between items-center">
                        <div>
                          <strong className="block font-bold text-slate-800 dark:text-slate-200">{account.name}</strong>
                          <span className="text-gray-400 text-[10px] block mt-0.5">{account.email} • {account.role.toUpperCase()}</span>
                          <span className="text-[9px] text-red-500 block mt-1">Locked until: {new Date(account.lockUntil).toLocaleString()}</span>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await handleUpdateUserStatus(account.id, 'active');
                              fetchAdminData();
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[9px] cursor-pointer"
                        >
                          Unlock Account
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 py-2 text-center italic">No currently locked user accounts.</span>
                  )}
                </div>
              </div>

              {/* Security Alerts Feed */}
              <div className="p-5 rounded-2xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4 shadow-sm text-xs">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldAlert className="text-amber-500" size={16} />
                  <span>Active Security Alerts ({securityStats?.allAlerts?.length || 0})</span>
                </h3>

                <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
                  {securityStats?.allAlerts && securityStats.allAlerts.length > 0 ? (
                    securityStats.allAlerts.map((alert, idx) => (
                      <div key={idx} className={`p-3 rounded-xl border flex flex-col gap-1 ${
                        alert.severity === 'high' 
                          ? 'border-red-500/20 bg-red-500/5' 
                          : alert.severity === 'medium'
                          ? 'border-amber-500/20 bg-amber-500/5'
                          : 'border-blue-500/20 bg-blue-500/5'
                      }`}>
                        <div className="flex justify-between items-center">
                          <strong className="font-bold text-slate-800 dark:text-slate-200">{alert.title}</strong>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                            alert.severity === 'high' 
                              ? 'bg-red-500 text-white' 
                              : alert.severity === 'medium'
                              ? 'bg-amber-500 text-slate-900'
                              : 'bg-blue-500 text-white'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-[10px] leading-normal">{alert.message}</p>
                        <span className="text-[8px] text-gray-400 block mt-1">
                          User: {alert.userName} ({alert.userEmail}) • {new Date(alert.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 py-2 text-center italic">No security alerts logged.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Recent Login Audits */}
            <div className="lg:col-span-6 p-5 rounded-2xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4 shadow-sm text-xs">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Users className="text-emerald-500" size={16} />
                <span>Recent Login History (Audit Logs)</span>
              </h3>

              <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                {securityStats?.recentLogins && securityStats.recentLogins.length > 0 ? (
                  securityStats.recentLogins.map((log, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-gray-100 dark:border-darkBorder/40 bg-slate-50/50 dark:bg-darkBorder/20 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <strong className="text-slate-800 dark:text-slate-200">{log.userName}</strong>
                        <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                          log.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 flex flex-wrap gap-x-3 gap-y-1">
                        <span>📧 {log.userEmail}</span>
                        <span>💻 {log.device} ({log.browser})</span>
                        <span>🌐 IP: {log.ipAddress}</span>
                      </div>
                      <span className="text-[8px] text-gray-400">{new Date(log.loginTime).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 py-2 text-center italic">No login events recorded.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
