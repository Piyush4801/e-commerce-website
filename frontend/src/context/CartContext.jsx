import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../services/api.js';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    return JSON.parse(localStorage.getItem('cart')) || [];
  });
  
  const [wishlist, setWishlist] = useState(() => {
    return JSON.parse(localStorage.getItem('wishlist')) || [];
  });

  const [coupon, setCoupon] = useState(null);
  const [carbonOffset, setCarbonOffset] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Cart operations
  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product._id);
      if (existing) {
        return prev.map(item => 
          item.productId === product._id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
        sellerId: product.sellerId,
        ecoScore: product.sustainability?.ecoScore || 'C',
        image: product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
      }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
    setCarbonOffset(false);
  };

  // Wishlist operations
  const addToWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item._id === product._id);
      if (exists) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item._id !== productId));
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item._id === productId);
  };

  // Coupon handling
  const applyCouponCode = async (code) => {
    try {
      const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const res = await axios.post('/api/coupons/apply', { code, totalAmount });
      if (res.data.success) {
        setCoupon(res.data.coupon);
        return { success: true, message: res.data.message };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to apply coupon.' 
      };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // Calculations
  const getSubtotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const getDiscount = () => {
    if (!coupon) return 0;
    const subtotal = getSubtotal();
    return coupon.type === 'percentage' 
      ? subtotal * (coupon.value / 100) 
      : coupon.value;
  };
  const getCarbonOffsetFee = () => (carbonOffset ? 15 : 0);
  const getTotal = () => {
    return Math.max(0, getSubtotal() - getDiscount() + getCarbonOffsetFee());
  };

  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <CartContext.Provider value={{
      cart,
      wishlist,
      coupon,
      carbonOffset,
      setCarbonOffset,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      applyCouponCode,
      removeCoupon,
      getSubtotal,
      getDiscount,
      getCarbonOffsetFee,
      getTotal,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
