import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StarRating from '../Common/StarRating';
import SustainabilityBadge from './SustainabilityBadge';
import { Heart, ShoppingCart } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const { user, triggerAuthModal } = useAuth();
  const { addToast } = useToast();

  const isLiked = isInWishlist(product._id);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      triggerAuthModal("Please login to continue shopping.");
      return;
    }
    
    const heartBtn = e.currentTarget.querySelector('svg');
    if (isLiked) {
      removeFromWishlist(product._id);
      addToast("Removed from Wishlist", "info");
    } else {
      addToWishlist(product);
      addToast("Added to Wishlist", "success");
      if (heartBtn) {
        heartBtn.classList.add('scale-125', 'animate-pulse');
        setTimeout(() => heartBtn.classList.remove('scale-125', 'animate-pulse'), 400);
      }
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      triggerAuthModal("Please login to continue shopping.");
      return;
    }
    
    // Add item to cart state instantly
    addToCart(product, 1);
    
    // Fly-to-cart animation
    const cardElement = e.currentTarget.closest('.group');
    const imgElement = cardElement?.querySelector('img');
    const cartIcon = document.getElementById('navbar-cart-icon');
    
    if (imgElement && cartIcon) {
      const imgRect = imgElement.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();
      
      const clone = imgElement.cloneNode(true);
      clone.style.position = 'fixed';
      clone.style.top = `${imgRect.top}px`;
      clone.style.left = `${imgRect.left}px`;
      clone.style.width = `${imgRect.width}px`;
      clone.style.height = `${imgRect.height}px`;
      clone.style.zIndex = '9999';
      clone.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      clone.style.borderRadius = '12px';
      clone.style.pointerEvents = 'none';
      
      document.body.appendChild(clone);
      
      // Animate coordinates to the navbar cart
      requestAnimationFrame(() => {
        clone.style.top = `${cartRect.top}px`;
        clone.style.left = `${cartRect.left}px`;
        clone.style.width = '18px';
        clone.style.height = '18px';
        clone.style.opacity = '0.2';
        clone.style.transform = 'scale(0.1) rotate(360deg)';
      });
      
      setTimeout(() => {
        clone.remove();
        cartIcon.classList.add('animate-bounce-short');
        setTimeout(() => cartIcon.classList.remove('animate-bounce-short'), 300);
      }, 800);
    }
    
    addToast("Product Added Successfully!", "success");
  };

  const isLowStock = product.stock <= 5;
  const originalPrice = Math.round(product.price * 1.25);


  return (
    <div className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard flex flex-col h-full hover:-translate-y-1">
      {/* Product Image */}
      <Link to={`/product/${product._id}`} className="relative block overflow-hidden aspect-video bg-slate-100 dark:bg-slate-950">
        {/* Low Stock Badge */}
        {isLowStock && (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md animate-pulse shadow-sm">
            LOW STOCK ({product.stock})
          </span>
        )}

        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/90 dark:bg-darkCard/95 hover:bg-white dark:hover:bg-darkBorder text-slate-400 hover:text-red-500 transition-colors z-10 shadow-sm"
          aria-label="Toggle Wishlist"
        >
          <Heart 
            className={`h-4.5 w-4.5 transition-transform duration-300 ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-400 dark:text-slate-300'}`} 
          />
        </button>
      </Link>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-grow gap-2">
        <span className="text-[10px] tracking-wider uppercase font-bold text-emerald-600 dark:text-emerald-400">
          {product.category}
        </span>

        {/* Title has fixed height and support 2 lines to align grids */}
        <Link to={`/product/${product._id}`} className="hover:text-emerald-500 transition-colors">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 h-10 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center justify-between gap-2">
          <StarRating rating={product.rating} size={14} />
          <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">({product.reviewCount} reviews)</span>
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Sustainability Badge */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <SustainabilityBadge sustainability={product.sustainability} />
        </div>

        {/* Price & Cart Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-darkBorder/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold tracking-wider">PRICE</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                ₹{product.price.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through">
                ₹{originalPrice.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md shadow-emerald-500/10 hover:scale-105 active:scale-95"
          >
            <ShoppingCart size={13} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
