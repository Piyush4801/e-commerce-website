import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Phone, UserCheck, ShieldAlert, Gift } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('customer');
  const [referredBy, setReferredBy] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const data = await register(name, email, password, confirmPassword, mobile, role, referredBy);
      if (data.success) {
        navigate('/dashboard');
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error("[SIGNUP ERROR RESPONSE]", err.response || err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Error occurred during signup.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-grid-pattern relative">
      <div className="absolute w-96 h-96 aura-glow-purple pointer-events-none rounded-full top-20"></div>

      <div className="w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass shadow-2xl relative z-10 flex flex-col gap-5">
        <div className="text-center">
          <h2 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">Create Account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get started with next-gen smart shopping</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/15 text-red-500 text-xs flex gap-2 items-center">
            <ShieldAlert size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative flex items-center bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus-within:border-emerald-500/40 rounded-xl transition-all">
              <User className="absolute left-3.5 text-slate-400 h-4 w-4" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-transparent border-none outline-none text-xs pl-10 pr-3 py-2.5 outline-none rounded-xl text-slate-800 dark:text-slate-100 focus:ring-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative flex items-center bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus-within:border-emerald-500/40 rounded-xl transition-all">
              <Mail className="absolute left-3.5 text-slate-400 h-4 w-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent border-none outline-none text-xs pl-10 pr-3 py-2.5 outline-none rounded-xl text-slate-800 dark:text-slate-100 focus:ring-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider">Mobile Number</label>
            <div className="relative flex items-center bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus-within:border-emerald-500/40 rounded-xl transition-all">
              <Phone className="absolute left-3.5 text-slate-400 h-4 w-4" />
              <input
                type="text"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+919998887701"
                className="w-full bg-transparent border-none outline-none text-xs pl-10 pr-3 py-2.5 outline-none rounded-xl text-slate-800 dark:text-slate-100 focus:ring-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative flex items-center bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus-within:border-emerald-500/40 rounded-xl transition-all">
              <Lock className="absolute left-3.5 text-slate-400 h-4 w-4" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-transparent border-none outline-none text-xs pl-10 pr-3 py-2.5 outline-none rounded-xl text-slate-800 dark:text-slate-100 focus:ring-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider">Confirm Password</label>
            <div className="relative flex items-center bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus-within:border-emerald-500/40 rounded-xl transition-all">
              <Lock className="absolute left-3.5 text-slate-400 h-4 w-4" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full bg-transparent border-none outline-none text-xs pl-10 pr-3 py-2.5 outline-none rounded-xl text-slate-800 dark:text-slate-100 focus:ring-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-555 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Gift size={10} className="text-yellow-500 animate-bounce" />
              <span>Referral Code (Optional)</span>
            </label>
            <div className="relative flex items-center bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus-within:border-emerald-500/40 rounded-xl transition-all">
              <UserCheck className="absolute left-3.5 text-slate-400 h-4 w-4" />
              <input
                type="text"
                value={referredBy}
                onChange={(e) => setReferredBy(e.target.value)}
                placeholder="Get 100 bonus reward points"
                className="w-full bg-transparent border-none outline-none text-xs pl-10 pr-3 py-2.5 outline-none rounded-xl text-slate-800 dark:text-slate-100 focus:ring-0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/10 active:scale-98 transition-all disabled:opacity-50 mt-2 flex items-center justify-center cursor-pointer"
          >
            {loading ? 'Submitting Details...' : 'Register'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account? <Link to="/login" className="text-emerald-500 font-bold hover:underline">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
