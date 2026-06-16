import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Container Stack */}
      <div className="fixed top-20 right-4 z-[300] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map(t => {
          let icon = <Info size={16} className="text-blue-500 shrink-0" />;
          let bgColor = 'bg-white/90 border-blue-100 dark:bg-darkCard/90 dark:border-blue-900/30';
          let textColor = 'text-slate-800 dark:text-slate-100';

          if (t.type === 'success') {
            icon = <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />;
            bgColor = 'bg-white/90 border-emerald-100 dark:bg-darkCard/95 dark:border-emerald-900/30';
          } else if (t.type === 'error') {
            icon = <XCircle size={16} className="text-rose-500 shrink-0" />;
            bgColor = 'bg-white/90 border-rose-100 dark:bg-darkCard/95 dark:border-rose-900/30';
          } else if (t.type === 'warning') {
            icon = <AlertTriangle size={16} className="text-amber-500 shrink-0" />;
            bgColor = 'bg-white/90 border-amber-100 dark:bg-darkCard/95 dark:border-amber-900/30';
          }

          return (
            <div
              key={t.id}
              className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xl backdrop-blur-md pointer-events-auto animate-slide-in transition-all duration-300 relative ${bgColor} ${textColor}`}
              style={{
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
              }}
            >
              {icon}
              <div className="flex-1 pr-6 text-xs font-semibold leading-relaxed">
                {t.message}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="absolute top-3.5 right-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
