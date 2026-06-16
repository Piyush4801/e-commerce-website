import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from '../../services/api.js';
import { Lock, ShieldAlert } from 'lucide-react';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/reset-password', {
        token,
        newPassword: password
      });

      if (res.data.success) {
        setSuccess('Password updated successfully. Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(res.data.message || 'Reset password failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred. Reset link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-grid-pattern relative">
      <div className="absolute w-96 h-96 aura-glow-primary pointer-events-none rounded-full top-20"></div>

      <div className="w-full max-w-md p-8 rounded-3xl border border-gray-200/50 dark:border-darkBorder bg-white dark:bg-darkCard glass shadow-2xl relative z-10 flex flex-col gap-6">
        <div className="text-center">
          <h2 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">Reset Password</h2>
          <p className="text-xs text-gray-400 mt-1">Set a new password for {email}</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/15 text-red-500 text-xs flex gap-2 items-center">
            <ShieldAlert size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-emerald-500 text-xs text-center font-bold">
            {success}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">New Password</label>
              <div className="relative flex items-center bg-gray-50 dark:bg-darkBorder/40 border border-transparent focus-within:border-emerald-500/40 rounded-xl transition-all">
                <Lock className="absolute left-3.5 text-gray-400 h-4 w-4" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-none outline-none text-xs pl-10 pr-3 py-3 outline-none rounded-xl"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Confirm New Password</label>
              <div className="relative flex items-center bg-gray-50 dark:bg-darkBorder/40 border border-transparent focus-within:border-emerald-500/40 rounded-xl transition-all">
                <Lock className="absolute left-3.5 text-gray-400 h-4 w-4" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-none outline-none text-xs pl-10 pr-3 py-3 outline-none rounded-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/10 active:scale-98 transition-all disabled:opacity-50 mt-2 flex items-center justify-center animate-pulse"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
