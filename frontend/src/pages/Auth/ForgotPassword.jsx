import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../services/api.js';
import { Mail, ShieldAlert, Sparkles } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      if (res.data.success) {
        setSuccess('A secure password reset link has been generated successfully!');
      } else {
        setError(res.data.message || 'Failed to send reset link.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred. Make sure email exists.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-grid-pattern relative">
      <div className="absolute w-96 h-96 aura-glow-primary pointer-events-none rounded-full top-20"></div>

      <div className="w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass shadow-2xl relative z-10 flex flex-col gap-6">
        <div className="text-center">
          <h2 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">Forgot Password</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">We will send a secure reset link to your email address</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/15 text-red-500 text-xs flex gap-2 items-center">
            <ShieldAlert size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex flex-col gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-emerald-555 text-xs text-center font-semibold">
              {success}
            </div>
            <div className="p-3.5 rounded-xl bg-yellow-500/5 border border-yellow-500/15 text-slate-600 dark:text-slate-300 text-[11px] flex gap-2 items-start">
              <Sparkles size={14} className="shrink-0 mt-0.5 text-yellow-500 animate-pulse" />
              <span>Please click on the <strong>Password Reset Link</strong> inside the top notification tray to set your new password.</span>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative flex items-center bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus-within:border-emerald-500/40 rounded-xl transition-all">
                <Mail className="absolute left-3.5 text-slate-400 h-4 w-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent border-none outline-none text-xs pl-10 pr-3 py-3 outline-none rounded-xl text-slate-800 dark:text-slate-100 focus:ring-0"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/10 active:scale-98 transition-all disabled:opacity-50 mt-2 flex items-center justify-center cursor-pointer"
            >
              {loading ? 'Sending Request...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          Remember credentials? <Link to="/login" className="text-emerald-500 font-bold hover:underline">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
