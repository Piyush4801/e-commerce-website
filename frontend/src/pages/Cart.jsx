import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, Tag, X, Leaf, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Cart = () => {
  const { 
    cart, updateQuantity, removeFromCart, addToWishlist,
    coupon, applyCouponCode, removeCoupon,
    carbonOffset, setCarbonOffset,
    getSubtotal, getDiscount, getCarbonOffsetFee, getTotal
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponInput.trim()) return;

    const res = await applyCouponCode(couponInput);
    if (res.success) {
      setCouponSuccess(res.message);
      addToast(res.message, "success");
      setCouponInput('');
    } else {
      setCouponError(res.message);
      addToast(res.message, "error");
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    addToast("Coupon removed", "info");
  };

  const handleSaveForLater = (item) => {
    // Save to wishlist and remove from cart
    addToWishlist({
      _id: item.productId,
      name: item.name,
      price: item.price,
      images: [item.image],
      category: 'Saved Item',
      sustainability: { ecoScore: item.ecoScore }
    });
    removeFromCart(item.productId);
    addToast("Item saved to wishlist", "success");
  };

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const offsetFee = getCarbonOffsetFee();
  const total = getTotal();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-4 text-center bg-grid-pattern">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce">
          <ShoppingBag size={28} />
        </div>
        <h2 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
          Explore our smart recommendation catalog and add products to get started.
        </p>
        <Link to="/products" className="mt-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all">
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-grid-pattern">
      <h1 className="font-black text-2xl text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-2">
        <span>Shopping Cart</span>
        <span className="text-xs font-semibold bg-emerald-500/15 text-emerald-600 px-2 py-0.5 rounded-full">
          {cart.length} Items
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {cart.map(item => (
            <div 
              key={item.productId}
              className="p-4 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard flex flex-col sm:flex-row gap-4 items-center justify-between glass hover:border-emerald-500/20 transition-all duration-300"
            >
              <div className="flex gap-4 items-center w-full sm:w-auto">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-16 h-16 object-cover rounded-xl bg-slate-100 dark:bg-slate-900" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
                  }}
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                    <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Eco Score:</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Grade {item.ecoScore}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity Controllers */}
              <div className="flex items-center gap-6 justify-between w-full sm:w-auto">
                <div className="flex items-center gap-2 border border-slate-200 dark:border-darkBorder rounded-lg p-1 bg-slate-50/50 dark:bg-darkBg/30">
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-6 h-6 rounded hover:bg-slate-105 dark:hover:bg-darkBorder flex items-center justify-center font-bold text-xs cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-6 h-6 rounded hover:bg-slate-105 dark:hover:bg-darkBorder flex items-center justify-center font-bold text-xs cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">SUBTOTAL</span>
                  <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleSaveForLater(item)}
                    className="text-[10px] font-bold text-emerald-500 hover:underline px-2 cursor-pointer"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => { removeFromCart(item.productId); addToast("Item removed from cart", "info"); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Checkout Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Carbon Offset Selection */}
          <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 glass flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">Carbon Offset Contribution</h4>
                <p className="text-[10px] text-slate-500 leading-snug">Add ₹15 to support reforestation projects.</p>
              </div>
            </div>
            <label className="flex items-center gap-2 self-start cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={carbonOffset}
                onChange={(e) => setCarbonOffset(e.target.checked)}
                className="rounded text-emerald-500 focus:ring-emerald-500 bg-gray-200 border-gray-300 h-4 w-4" 
              />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Offset my order footprint (+₹15)
              </span>
            </label>
          </div>

          {/* Coupon Entry */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4">
            <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Tag size={13} className="text-emerald-500" />
              <span>Apply Coupons</span>
            </h4>

            {coupon ? (
              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs flex justify-between items-center font-bold animate-pulse">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={13} />
                  Code Applied: {coupon.code}
                </span>
                <button onClick={handleRemoveCoupon} className="hover:opacity-85 cursor-pointer">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="WELCOME100 / FESTIVAL20"
                  className="flex-1 bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2.5 text-xs outline-none uppercase text-slate-800 dark:text-slate-100"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}

            {couponError && <span className="text-[10px] text-red-500">{couponError}</span>}
            {couponSuccess && <span className="text-[10px] text-emerald-500">{couponSuccess}</span>}

            {/* Hackathon tip */}
            <span className="text-[9px] text-slate-400 leading-normal block">
              💡 Tip: Try code <code className="font-extrabold text-emerald-500">WELCOME100</code> (flat ₹100) or <code className="font-extrabold text-emerald-500">FESTIVAL20</code> (20% off above ₹1,500).
            </span>
          </div>

          {/* Pricing Summary */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4 text-xs">
            <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">Order Summary</h4>
            
            <div className="flex justify-between items-center opacity-85">
              <span className="font-medium">Cart Subtotal</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">₹{subtotal.toLocaleString()}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between items-center text-emerald-500 font-semibold">
                <span>Promo Discount</span>
                <span>-₹{discount.toLocaleString()}</span>
              </div>
            )}

            {offsetFee > 0 && (
              <div className="flex justify-between items-center text-emerald-500 font-semibold">
                <span>Green Reforest Offset</span>
                <span>+₹{offsetFee.toLocaleString()}</span>
              </div>
            )}

            <div className="border-t border-slate-100 dark:border-darkBorder/60 pt-3 flex justify-between items-center font-black text-sm text-slate-900 dark:text-slate-100">
              <span>Final Total</span>
              <span className="text-base text-emerald-600 dark:text-emerald-400">₹{total.toLocaleString()}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
