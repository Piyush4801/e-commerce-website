import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../services/api.js';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useChat } from '../../context/ChatContext';
import ThemeToggle from './ThemeToggle';
import VoiceSearch from '../AI/VoiceSearch';
import LocationSelector from './LocationSelector';
import { useToast } from '../../context/ToastContext';
import { 
  ShoppingCart, Heart, User, LogOut, LayoutDashboard, Search, Sparkles, ShoppingBag, Menu, X, Bell, Gamepad2, HelpCircle, Trash2
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart, setIsCartOpen } = useCart();
  const { socketNotifications, setSocketNotifications } = useChat();
  const { addToast } = useToast();
  
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axios.get('/api/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (e) {
      console.error('Failed to load notifications:', e.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  const allNotifications = [...socketNotifications, ...notifications];

  const clearAllNotifications = async () => {
    try {
      await axios.post('/api/notifications/read-all');
      setNotifications([]);
      setSocketNotifications([]);
      addToast('Notifications cleared successfully', 'info');
      setShowNotifMenu(false);
    } catch (e) {
      console.error(e.message);
    }
  };

  const handleLogout = () => {
    logout();
    addToast("Logged out successfully", "success");
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search)}`);
    }
  };

  const handleVoiceResult = (text) => {
    setSearch(text);
    navigate(`/products?search=${encodeURIComponent(text)}`);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Dynamic Dashboard routing based on roles
  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'seller') return '/seller/dashboard';
    return '/dashboard';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-45 border-b border-slate-200/50 dark:border-darkBorder/60 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-500/20">
              S
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-800 dark:text-slate-100 hidden sm:inline flex items-center gap-1.5">
              SmartCart <span className="text-emerald-500 flex items-center gap-0.5 text-xs font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded-full"><Sparkles size={10} fill="currentColor" /> AI</span>
            </span>
          </Link>

          {/* Connected Location + Search Bar Section */}
          <div className="hidden md:flex flex-grow items-center gap-2 max-w-3xl">
            {/* Geolocation selector */}
            {user && (
              <div className="shrink-0 w-[240px]">
                <LocationSelector />
              </div>
            )}

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-grow flex items-center gap-1.5">
              <div className="relative w-full flex items-center bg-slate-100 dark:bg-darkBorder/40 border border-transparent focus-within:border-emerald-500/40 focus-within:bg-white dark:focus-within:bg-darkCard rounded-xl transition-all">
                <Search className="absolute left-3.5 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products, brands..."
                  className="w-full bg-transparent border-none outline-none text-xs pl-10 pr-3 py-2.5 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-0"
                />
              </div>
              {/* Voice Search button integration */}
              <VoiceSearch onTranscriptResult={handleVoiceResult} />
            </form>
          </div>

          {/* Actions Menu */}
          <div className="hidden lg:flex items-center gap-4 text-slate-600 dark:text-slate-300 shrink-0">
            <Link to="/products" className="text-xs font-semibold hover:text-emerald-500 transition-colors flex items-center gap-1">
              <ShoppingBag size={14} />
              <span>Shop All</span>
            </Link>

            {user && user.role === 'customer' && (
              <>
                <Link to="/gaming-zone" className="text-xs font-semibold hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <Gamepad2 size={14} />
                  <span>Arcade Zone</span>
                </Link>
                <Link to="/support" className="text-xs font-semibold hover:text-emerald-500 transition-colors flex items-center gap-1">
                  <HelpCircle size={14} />
                  <span>Help Center</span>
                </Link>
              </>
            )}

            {/* Dark Mode */}
            <ThemeToggle />

            {/* Notification Bell Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="relative p-2 hover:text-emerald-500 transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {allNotifications.length > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] font-black flex items-center justify-center animate-pulse">
                      {allNotifications.length}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard shadow-2xl glass p-4 z-[300] text-xs flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-darkBorder/40 pb-2">
                      <strong className="font-extrabold text-slate-800 dark:text-slate-200">Alert notifications</strong>
                      {allNotifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-[10px] text-red-500 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 size={10} />
                          <span>Clear All</span>
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 py-1">
                      {allNotifications.map((notif, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-darkBorder/30 border border-slate-200/50 dark:border-darkBorder/30">
                          <strong className="block text-[10px] font-bold text-slate-700 dark:text-slate-200">{notif.title}</strong>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">{notif.message}</p>
                        </div>
                      ))}
                      {allNotifications.length === 0 && (
                        <span className="italic text-slate-400 text-center block py-4">No notifications.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 hover:text-emerald-500 transition-colors" title="Wishlist">
              <Heart size={18} />
            </Link>

            {/* Cart */}
            <button 
              onClick={() => setIsCartOpen(true)}
              id="navbar-cart-icon" 
              className="relative p-2 hover:text-emerald-500 transition-colors cursor-pointer" 
              title="Shopping Cart"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Dashboard */}
            {user ? (
              <div className="flex items-center gap-3 border-l border-slate-200 dark:border-darkBorder/60 pl-3">
                <Link 
                  to={getDashboardPath()} 
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-500 transition-colors"
                >
                  <LayoutDashboard size={14} />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/10"
              >
                <User size={13} />
                <span>Login / Register</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl border border-slate-200 dark:border-darkBorder/60 text-slate-700 dark:text-slate-300"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-darkBorder/60 bg-white dark:bg-darkCard px-4 pt-2 pb-4 space-y-3 shadow-lg">
          {/* Location Selector for Mobile (stacked) */}
          {user && (
            <div className="w-full pb-1">
              <LocationSelector />
            </div>
          )}

          <form onSubmit={handleSearchSubmit} className="flex gap-1.5">
            <div className="relative w-full flex items-center bg-slate-100 dark:bg-darkBorder/40 rounded-xl">
              <Search className="absolute left-3 text-slate-400 h-4 w-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog..."
                className="w-full bg-transparent border-none outline-none text-xs pl-9 py-2 text-slate-800 dark:text-slate-100 focus:ring-0"
              />
            </div>
            <VoiceSearch onTranscriptResult={handleVoiceResult} />
          </form>

          <div className="flex flex-col gap-2.5 pt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Link to="/products" onClick={() => setMenuOpen(false)} className="hover:text-emerald-500 py-1.5">
              Shop All Catalog
            </Link>
            <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="hover:text-emerald-500 py-1.5 flex items-center gap-2">
              <Heart size={15} />
              <span>Wishlist</span>
            </Link>
            <button 
              onClick={() => { setIsCartOpen(true); setMenuOpen(false); }} 
              className="hover:text-emerald-500 py-1.5 flex items-center gap-2 w-full text-left cursor-pointer font-semibold"
            >
              <ShoppingCart size={15} />
              <span>Cart ({cartCount})</span>
            </button>
            
            {user ? (
              <div className="border-t border-slate-200 dark:border-darkBorder/40 pt-2 flex flex-col gap-2">
                <Link to={getDashboardPath()} onClick={() => setMenuOpen(false)} className="hover:text-emerald-500 py-1.5 flex items-center gap-2">
                  <LayoutDashboard size={15} />
                  <span>Dashboard ({user.role.toUpperCase()})</span>
                </Link>
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="text-left text-red-500 py-1.5 flex items-center gap-2 w-full cursor-pointer font-semibold"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center bg-emerald-500 text-white font-bold py-2.5 rounded-xl block mt-2"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
