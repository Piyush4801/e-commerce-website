import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Home, Calendar, ShieldCheck } from 'lucide-react';

export const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};

  useEffect(() => {
    // If no order data, redirect to home
    if (!order) {
      navigate('/');
    }
  }, [order, navigate]);

  if (!order) return null;

  const getEstimatedDelivery = () => {
    const date = new Date(order.createdAt || Date.now());
    date.setDate(date.getDate() + 4);
    return date.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const getOrderDate = () => {
    return new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-12 max-w-lg mx-auto px-4 flex flex-col items-center justify-center gap-6 text-center bg-grid-pattern relative">
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce shadow-lg shadow-emerald-500/5">
        <CheckCircle2 size={44} />
      </div>

      <div>
        <h1 className="font-black text-2xl md:text-3xl text-slate-800 dark:text-slate-100 tracking-tight">
          Order Placed Successfully!
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm leading-relaxed">
          Thank you for shopping with us! Your order has been processed and is under preparation.
        </p>
      </div>

      {/* Invoice Card */}
      <div className="w-full bg-white dark:bg-darkCard p-6 rounded-3xl border border-slate-200 dark:border-darkBorder text-left text-xs space-y-4 shadow-xl glass">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-darkBorder/40">
          <span className="opacity-75 font-semibold">Order Reference ID:</span>
          <span className="font-extrabold text-slate-800 dark:text-slate-100 font-mono tracking-wider">
            #{order._id?.slice(-8).toUpperCase() || 'N/A'}
          </span>
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between">
            <span className="opacity-75 font-medium">Order Date:</span>
            <span className="font-bold text-slate-700 dark:text-slate-350">{getOrderDate()}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-75 font-medium">Estimated Delivery:</span>
            <span className="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1">
              <Calendar size={13} className="text-emerald-500" />
              {getEstimatedDelivery()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-75 font-medium">Payment Method:</span>
            <span className="font-bold uppercase text-slate-700 dark:text-slate-350">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-75 font-medium">Total Amount Paid:</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
              ₹{order.netAmount?.toLocaleString() || '0'}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-darkBorder/40 flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Secured by SmartCart Fraud Safety engine (Risk: {order.fraudRiskScore || 0}%)</span>
        </div>
      </div>

      <div className="flex gap-4 w-full mt-2">
        <Link 
          to="/customer" 
          className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>Track Order</span>
          <ArrowRight size={14} />
        </Link>
        <Link 
          to="/products" 
          className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-slate-700 dark:text-slate-200 font-bold text-xs glass transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Home size={14} />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
