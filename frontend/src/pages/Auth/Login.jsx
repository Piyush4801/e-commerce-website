import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ShieldAlert, ShieldCheck, Eye, EyeOff, Sparkles, ShoppingBag, Store, Shield } from 'lucide-react';

export const Login = ({ defaultRole }) => {
  const [selectedRole, setSelectedRole] = useState(defaultRole || 'customer');
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  // Update selected role if defaultRole prop changes
  useEffect(() => {
    if (defaultRole) {
      setSelectedRole(defaultRole);
    }
  }, [defaultRole]);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: 'Empty', color: 'bg-slate-200 text-slate-400' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[@$!%*?&._#-]/.test(pwd)) score += 1;
    switch (score) {
      case 0: case 1: case 2: return { score: 25, text: 'Weak', color: 'bg-red-500 text-red-500' };
      case 3: return { score: 50, text: 'Medium', color: 'bg-yellow-500 text-yellow-600' };
      case 4: return { score: 75, text: 'Strong', color: 'bg-blue-500 text-blue-500' };
      case 5: return { score: 100, text: 'Very Secure', color: 'bg-emerald-500 text-emerald-500' };
      default: return { score: 0, text: 'Empty', color: 'bg-slate-200 text-slate-400' };
    }
  };

  const strength = getPasswordStrength(password);

  const theme = {
    customer: {
      color: 'emerald',
      bgGlow: 'aura-glow-primary',
      badge: '👤 Customer Portal',
      icon: <ShoppingBag size={22} />,
      bgGradient: 'from-emerald-400 to-emerald-600',
      shadow: 'shadow-emerald-500/20',
      btnBg: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500/50 shadow-emerald-500/10',
      borderFocus: 'focus-within:border-emerald-500/40',
      accentText: 'text-emerald-500 hover:text-emerald-600',
      bannerBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      title: 'Welcome Back',
      subtitle: 'Sign in to your SmartCart account'
    },
    seller: {
      color: 'blue',
      bgGlow: 'aura-glow-primary',
      badge: '🏪 Merchant Hub',
      icon: <Store size={22} />,
      bgGradient: 'from-blue-400 to-blue-600',
      shadow: 'shadow-blue-500/20',
      btnBg: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500/50 shadow-blue-500/10',
      borderFocus: 'focus-within:border-blue-500/40',
      accentText: 'text-blue-500 hover:text-blue-600',
      bannerBg: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
      title: 'Seller Portal',
      subtitle: 'Sign in to manage storefront and inventory'
    },
    admin: {
      color: 'red',
      bgGlow: 'aura-glow-purple',
      badge: '🔑 Administration Portal',
      icon: <Shield size={22} />,
      bgGradient: 'from-red-500 to-red-700',
      shadow: 'shadow-red-500/20',
      btnBg: 'bg-red-500 hover:bg-red-600 focus:ring-red-500/50 shadow-red-500/10',
      borderFocus: 'focus-within:border-red-500/40',
      accentText: 'text-red-500 hover:text-red-600',
      bannerBg: 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400',
      title: 'System Administration',
      subtitle: 'Authorization required to access control panel'
    }
  }[selectedRole] || {
    color: 'emerald',
    bgGlow: 'aura-glow-primary',
    badge: '👤 Customer Portal',
    icon: <ShoppingBag size={22} />,
    bgGradient: 'from-emerald-400 to-emerald-600',
    shadow: 'shadow-emerald-500/20',
    btnBg: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500/50 shadow-emerald-500/10',
    borderFocus: 'focus-within:border-emerald-500/40',
    accentText: 'text-emerald-500 hover:text-emerald-600',
    bannerBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    title: 'Welcome Back',
    subtitle: 'Sign in to your SmartCart account'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(emailOrMobile, password);
      if (data.success) {
        // Enforce role matching on the frontend
        if (data.user.role === selectedRole) {
          if (selectedRole === 'admin') {
            navigate('/admin/dashboard');
          } else if (selectedRole === 'seller') {
            navigate('/seller/dashboard');
          } else {
            navigate('/dashboard');
          }
        } else {
          await logout();
          setError(`Access Denied: Invalid credentials for this ${selectedRole} login portal.`);
        }
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-grid-pattern relative">
      <div className={`absolute w-96 h-96 ${theme.bgGlow} pointer-events-none rounded-full top-20`}></div>

      <div className="w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass shadow-2xl relative z-10 flex flex-col gap-5">
        
        {/* Role Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-darkBorder/40">
          <button
            type="button"
            onClick={() => { setSelectedRole('customer'); setError(''); }}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              selectedRole === 'customer'
                ? 'bg-white dark:bg-darkCard text-emerald-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>👤</span>
            <span>Customer</span>
          </button>
          <button
            type="button"
            onClick={() => { setSelectedRole('seller'); setError(''); }}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              selectedRole === 'seller'
                ? 'bg-white dark:bg-darkCard text-blue-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>🏪</span>
            <span>Seller</span>
          </button>
          <button
            type="button"
            onClick={() => { setSelectedRole('admin'); setError(''); }}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-white dark:bg-darkCard text-red-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>👑</span>
            <span>Admin</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${theme.bgGradient} flex items-center justify-center text-white shadow-md ${theme.shadow}`}>
            {theme.icon}
          </div>
          <div className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${theme.bannerBg}`}>
            {theme.badge}
          </div>
          <h2 className="font-extrabold text-xl text-slate-800 dark:text-slate-100 mt-1">{theme.title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{theme.subtitle}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-red-500 text-xs flex gap-2 items-center">
            <ShieldAlert size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email / Mobile */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Email or Mobile Number</label>
            <div className={`relative flex items-center bg-slate-50 dark:bg-darkBorder/40 border border-transparent ${theme.borderFocus} rounded-xl transition-all`}>
              <Mail className="absolute left-3.5 text-slate-400 h-4 w-4" />
              <input
                id="login-email"
                type="text"
                required
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
                placeholder={selectedRole === 'customer' ? 'email@example.com or +91XXXXXXXXXX' : 'user@smartcart.com'}
                className="w-full bg-transparent border-none outline-none text-xs pl-10 pr-3 py-3 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-0"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className={`text-[10px] font-bold transition-colors ${theme.accentText}`}>Forgot Password?</Link>
            </div>
            <div className={`relative flex items-center bg-slate-50 dark:bg-darkBorder/40 border border-transparent ${theme.borderFocus} rounded-xl transition-all`}>
              <Lock className="absolute left-3.5 text-slate-400 h-4 w-4" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent border-none outline-none text-xs pl-10 pr-10 py-3 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-0"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password && selectedRole === 'customer' && (
              <div className="flex flex-col gap-1 mt-0.5">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Strength</span>
                  <span className={strength.color.split(' ')[1]}>{strength.text}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-darkBorder/40 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strength.color.split(' ')[0]}`} style={{ width: `${strength.score}%` }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-bold select-none cursor-pointer">
              <input
                type="checkbox"
                id="login-remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={`rounded focus:ring-0 h-3.5 w-3.5`}
              />
              <span>Remember me</span>
            </label>
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 mt-1 flex items-center justify-center gap-2 cursor-pointer ${theme.btnBg}`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                Authenticating...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Register link - only show for customers */}
        {selectedRole === 'customer' && (
          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold hover:underline text-emerald-500 hover:text-emerald-600 transition-colors">Register here</Link>
          </div>
        )}

        {/* SSL Badge */}
        <div className="flex items-center justify-center gap-1.5 py-1.5 text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest border border-slate-100 dark:border-darkBorder/40 rounded-xl bg-slate-50/30">
          <ShieldCheck size={13} className="text-emerald-500" />
          <span>SSL Secured · AES-256 Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
