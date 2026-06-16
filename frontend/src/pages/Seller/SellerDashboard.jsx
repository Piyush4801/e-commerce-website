import React, { useEffect, useState } from 'react';
import axios from '../../services/api.js';
import { useAuth } from '../../context/AuthContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { 
  Plus, Edit, Trash2, ArrowUpRight, TrendingUp, AlertTriangle, Package, DollarSign, Calendar 
} from 'lucide-react';

export const SellerDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState([]);
  
  // Products listing
  const [products, setProducts] = useState([]);
  
  // Orders list
  const [orders, setOrders] = useState([]);
  
  // Product Form modals
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [ecoScore, setEcoScore] = useState('C');
  const [carbonFootprint, setCarbonFootprint] = useState(5.0);

  // Status updates
  const [orderStatusUpdateId, setOrderStatusUpdateId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('processing');
  const [statusMessage, setStatusMessage] = useState('');

  const fetchSellerData = async () => {
    try {
      const res = await axios.get('/api/seller/analytics');
      if (res.data.success) {
        setAnalytics(res.data.analytics);
      }

      // Fetch products list belonging to seller
      const prodRes = await axios.get('/api/products?limit=100');
      if (prodRes.data.success) {
        setProducts(prodRes.data.products.filter(p => p.sellerName?.includes('Vendor') || p.sellerName === user?.name));
      }

      // Fetch orders
      const orderRes = await axios.get('/api/orders/seller-orders');
      if (orderRes.data.success) {
        setOrders(orderRes.data.orders || []);
      }

      // Fetch activity logs
      const logsRes = await axios.get('/api/seller/activity-logs');
      if (logsRes.data.success) {
        setActivityLogs(logsRes.data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load seller dashboard metrics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      sustainability: {
        ecoScore,
        ecoRating: ecoScore === 'A' ? 5 : (ecoScore === 'B' ? 4 : 3),
        carbonFootprint: parseFloat(carbonFootprint)
      }
    };

    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}/update`, payload);
      } else {
        await axios.post('/api/products/seller/create', payload);
      }
      setShowForm(false);
      clearForm();
      fetchSellerData();
    } catch (err) {
      console.error('Failed to save product details:', err.message);
    }
  };

  const clearForm = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setStock('');
    setCategory('Electronics');
    setDescription('');
    setEcoScore('C');
    setCarbonFootprint(5.0);
  };

  const handleEditClick = (prod) => {
    setEditingProduct(prod);
    setName(prod.name);
    setPrice(prod.price);
    setStock(prod.stock);
    setCategory(prod.category);
    setDescription(prod.description);
    setEcoScore(prod.sustainability?.ecoScore || 'C');
    setCarbonFootprint(prod.sustainability?.carbonFootprint || 5.0);
    setShowForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Delete this product item?')) {
      try {
        await axios.delete(`/api/products/${id}/delete`);
        fetchSellerData();
      } catch (err) {
        console.error(err.message);
      }
    }
  };

  const handleStatusUpdate = async (orderId) => {
    setStatusMessage('');
    try {
      const res = await axios.put(`/api/orders/${orderId}/status`, {
        status: selectedStatus,
        description: `Seller updated shipment status to: ${selectedStatus.toUpperCase()}`
      });
      if (res.data.success) {
        setStatusMessage('✅ Order status updated successfully.');
        setOrderStatusUpdateId('');
        fetchSellerData();
      }
    } catch (err) {
      setStatusMessage('Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin"></div>
        <span className="text-xs text-slate-400">Loading Seller Dashboard...</span>
      </div>
    );
  }

  const { totalProducts = 0, totalOrdersCount = 0, totalRevenue = 0, salesCount = 0, salesTrend = [], forecastTrend = [], lowStockAlerts = [] } = analytics || {};

  return (
    <div className="min-h-screen pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-grid-pattern relative">
      <div className="absolute top-20 left-1/4 w-96 h-96 aura-glow-primary pointer-events-none rounded-full"></div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-black text-2xl text-slate-800 dark:text-slate-100">Seller Console</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
              user?.isVerifiedSeller 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20'
            }`}>
              {user?.isVerifiedSeller ? '🛡️ Verified Merchant' : '⏳ Pending Verification'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Manage products, stock alerts, and forecast demand analytics</p>
        </div>
        <button
          onClick={() => { clearForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          <Plus size={14} />
          <span>Add Product</span>
        </button>
      </div>

      {/* 1. Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-xs">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block mb-1">Sales Revenue</span>
            <strong className="text-xl font-extrabold text-slate-900 dark:text-slate-100">₹{totalRevenue.toLocaleString()}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500"><DollarSign size={16} /></div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block mb-1">Units Sold</span>
            <strong className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{salesCount} Items</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500"><Package size={16} /></div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block mb-1">Orders Count</span>
            <strong className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{totalOrdersCount} Orders</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500"><Calendar size={16} /></div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold block mb-1">Low Stock alerts</span>
            <strong className={`text-xl font-extrabold ${lowStockAlerts.length > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {lowStockAlerts.length} Flagged
            </strong>
          </div>
          <div className={`p-2.5 rounded-xl ${lowStockAlerts.length > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
            <AlertTriangle size={16} />
          </div>
        </div>
      </div>

      {/* 2. Charts (Recharts Analytics) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Past 7 Days Sales Chart */}
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Past 7 Days Revenue</h3>
            <span className="text-[10px] text-slate-500 block">Live sales monitoring dashboard</span>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.1)" />
                <XAxis dataKey="date" stroke="#888888" tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={value => [`₹${value.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Future 7 Days Predicted Sales (AI Demand Forecast) */}
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <TrendingUp size={16} className="text-emerald-500 animate-pulse" />
                <span>AI Demand Forecast</span>
              </h3>
              <span className="text-[10px] text-slate-500 block">7-day projected inventory and sales trends</span>
            </div>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase border border-emerald-500/20">
              Smart Predictor
            </span>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.1)" />
                <XAxis dataKey="date" stroke="#888888" tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={value => [`₹${value.toLocaleString()}`, 'Projected Revenue']} />
                <Bar dataKey="projectedRevenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Products inventory table */}
        <div className="lg:col-span-7 p-5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Catalog Inventory</h3>
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[550px] text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-darkBorder/60 text-slate-400 font-bold uppercase tracking-wider text-[10px] pb-2">
                  <th className="pb-3 pr-2">Product Name</th>
                  <th className="pb-3 px-2">Price</th>
                  <th className="pb-3 px-2 text-center">Stock</th>
                  <th className="pb-3 px-2 text-center">Eco Score</th>
                  <th className="pb-3 pl-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const isLow = p.stock <= 5;
                  return (
                    <tr key={p._id} className="border-b border-slate-100 dark:border-darkBorder/30 hover:bg-slate-50/20 dark:hover:bg-darkBorder/10 transition-colors">
                      <td className="py-3 pr-2 font-bold text-slate-700 dark:text-slate-200 truncate max-w-[150px]" title={p.name}>
                        {p.name}
                      </td>
                      <td className="py-3 px-2 font-semibold">₹{p.price.toLocaleString()}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                          isLow ? 'bg-red-500/15 text-red-500 animate-pulse' : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center font-black">{p.sustainability?.ecoScore}</td>
                      <td className="py-3 pl-2 text-right flex gap-1.5 justify-end">
                        <button onClick={() => handleEditClick(p)} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-500 cursor-pointer">
                          <Edit size={13} />
                        </button>
                        <button onClick={() => handleDeleteProduct(p._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 cursor-pointer">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders fulfillment list */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Customer Orders</h3>
          </div>

          {statusMessage && <div className="text-[10px] font-bold text-emerald-500">{statusMessage}</div>}

          <div className="flex flex-col gap-4 max-h-[380px] overflow-y-auto pr-1">
            {orders.map(order => (
              <div 
                key={order._id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-darkBorder/40 bg-slate-50/50 dark:bg-darkBorder/20 flex flex-col gap-2.5 text-xs"
              >
                <div className="flex justify-between font-bold">
                  <span className="text-slate-800 dark:text-slate-200">Order #{order._id.slice(-6).toUpperCase()}</span>
                  <span className="text-emerald-500">₹{(order.myTotal || order.netAmount).toLocaleString()}</span>
                </div>
                
                {/* List items */}
                <div className="text-[10px] text-slate-400 space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.name} x {item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-darkBorder/40">
                  <span className="text-[10px] text-slate-500 uppercase">Status: <strong className="font-extrabold text-emerald-500">{order.orderStatus}</strong></span>
                  
                  {orderStatusUpdateId === order._id ? (
                    <div className="flex gap-1">
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded px-1.5 py-1 text-[10px] outline-none text-slate-800 dark:text-slate-100 focus:ring-0"
                      >
                        <option value="processing">Processing</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                      </select>
                      <button
                        onClick={() => handleStatusUpdate(order._id)}
                        className="bg-emerald-500 text-white font-bold px-2 py-1 rounded text-[9px] cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setOrderStatusUpdateId(order._id); setSelectedStatus(order.orderStatus); }}
                      className="text-[10px] font-bold text-emerald-500 hover:underline cursor-pointer"
                    >
                      Update Status
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Seller Activity Logs */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Store Activity Logs</h3>
            <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto pr-1">
              {activityLogs.length === 0 ? (
                <div className="text-[10px] text-slate-400 text-center py-2">No activity logs recorded.</div>
              ) : (
                activityLogs.map((log, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-50/50 dark:bg-darkBorder/20 border border-slate-100 dark:border-darkBorder/40 flex flex-col gap-0.5 text-[10px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{log.activity}</span>
                    <span className="text-[8px] text-slate-400 dark:text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Product Form Modal (Add / Edit) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-darkCard border border-slate-200/50 dark:border-darkBorder flex flex-col gap-5 glass shadow-2xl relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div>
              <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Product'}
              </h3>
            </div>

            <form onSubmit={handleProductSubmit} className="flex flex-col gap-3.5 text-xs max-h-[420px] overflow-y-auto pr-1">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="SmartCart Keyboard"
                  className="bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="999"
                    className="bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="15"
                    className="bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Books">Books</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Sports">Sports</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Description</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product specs details..."
                  className="bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2 resize-none text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Sustainability inputs */}
              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-darkBorder/50 pt-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Eco Score</label>
                  <select
                    value={ecoScore}
                    onChange={(e) => setEcoScore(e.target.value)}
                    className="bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
                  >
                    <option value="A">Grade A (Sustainable)</option>
                    <option value="B">Grade B (Green)</option>
                    <option value="C">Grade C (Medium)</option>
                    <option value="D">Grade D (Low)</option>
                    <option value="E">Grade E (Critical)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">CO₂ Footprint (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={carbonFootprint}
                    onChange={(e) => setCarbonFootprint(e.target.value)}
                    placeholder="3.2"
                    className="bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl mt-2 cursor-pointer"
              >
                Save Details
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
