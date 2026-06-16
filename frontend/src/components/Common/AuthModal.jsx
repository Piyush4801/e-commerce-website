import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, X } from 'lucide-react';

export const AuthModal = () => {
  const { isAuthModalOpen, authModalMessage, closeAuthModal } = useAuth();
  const navigate = useNavigate();

  if (!isAuthModalOpen) return null;

  const handleNavigate = (path) => {
    closeAuthModal();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
      <div 
        className="w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-darkCard border border-slate-200/50 dark:border-darkBorder flex flex-col items-center gap-5 glass shadow-2xl relative animate-scale-in"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center animate-bounce">
          <ShieldAlert size={24} />
        </div>

        {/* Message */}
        <div className="text-center flex flex-col gap-1.5">
          <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">Sign In Required</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            {authModalMessage || 'Please login to continue shopping.'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5 w-full mt-2">
          <button
            onClick={() => handleNavigate('/login')}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/10 active:scale-95 transition-all cursor-pointer text-center"
          >
            Log In
          </button>
          <button
            onClick={() => handleNavigate('/register')}
            className="w-full py-3 rounded-xl border border-slate-200 dark:border-darkBorder text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all cursor-pointer text-center"
          >
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
