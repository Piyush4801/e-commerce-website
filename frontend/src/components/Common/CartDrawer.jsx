import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export const CartDrawer = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    getSubtotal, 
    getDiscount,
    getTotal 
  } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Close drawer on pressing Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsCartOpen]);

  if (!isCartOpen) return null;

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const taxRate = 0.18; // 18% GST
  const estimatedTax = Math.round(subtotal * taxRate);
  
  // Shipping: Free over 1000, else 99
  const shippingFee = subtotal > 1000 || subtotal === 0 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - discount + estimatedTax + shippingFee);

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleRemove = (productId, name) => {
    removeFromCart(productId);
    addToast(`${name} removed from cart`, 'info');
  };

  return (
    <div className="fixed inset-0 z-[260] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-[fadeIn_0.2s_ease-out]"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-out Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-darkCard border-l border-slate-200 dark:border-darkBorder flex flex-col shadow-2xl glass-nav animate-[slideInRight_0.35s_cubic-bezier(0.16,1,0.3,1)]">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-darkBorder/60 flex items-center justify-between">
            <h2 className="font-black text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ShoppingBag size={18} className="text-emerald-500" />
              <span>My Shopping Cart</span>
              <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-extrabold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
              </span>
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Body / Scrollable Item List */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div 
                  key={item.productId}
                  className="p-3.5 rounded-2xl border border-slate-100 dark:border-darkBorder/60 bg-white/50 dark:bg-darkCard/40 flex items-center gap-3.5 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 transition-all duration-300 group"
                >
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-14 h-14 object-cover rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-darkBorder/40" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
                    }}
                  />
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <h4 className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200 truncate pr-4">
                      {item.name}
                    </h4>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                      ₹{item.price.toLocaleString()}
                    </span>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 border border-slate-200/50 dark:border-darkBorder/60 rounded-lg p-0.5 w-max bg-slate-50 dark:bg-darkBg/30 mt-1">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 rounded text-slate-500 hover:text-emerald-500 cursor-pointer"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-[10px] font-extrabold px-1 text-slate-700 dark:text-slate-200 select-none">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 rounded text-slate-500 hover:text-emerald-500 cursor-pointer"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => handleRemove(item.productId, item.name)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                    title="Remove from Cart"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-darkBorder/40 flex items-center justify-center text-slate-400 dark:text-slate-500 animate-bounce">
                  <ShoppingBag size={28} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Your Cart is Empty</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Add items to get started with checkout</p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  Shop Best Sellers
                </button>
              </div>
            )}
          </div>

          {/* Pricing breakdown summary footer */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-100 dark:border-darkBorder/60 bg-slate-50/50 dark:bg-darkBg/20 text-xs flex flex-col gap-3">
              <div className="flex justify-between items-center text-slate-500">
                <span>Cart Subtotal</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">₹{subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-emerald-500">
                  <span>Promo Discount</span>
                  <span className="font-semibold">-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-500">
                <span>Estimated GST (18%)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">₹{estimatedTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>

              <div className="border-t border-slate-100 dark:border-darkBorder/60 pt-3 flex justify-between items-center font-black text-sm text-slate-900 dark:text-slate-100">
                <span>Grand Total</span>
                <span className="text-base text-emerald-600 dark:text-emerald-400">₹{grandTotal.toLocaleString()}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/10 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
