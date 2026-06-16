import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../services/api.js';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useChat } from '../context/ChatContext';
import StarRating from '../components/Common/StarRating';
import SustainabilityBadge from '../components/Product/SustainabilityBadge';
import ProductCard from '../components/Product/ProductCard';
import { ShoppingCart, Heart, ShieldCheck, Sparkles, MessageSquarePlus, MessageSquareDot, MessageSquare, Truck } from 'lucide-react';

export const ProductDetails = () => {
  const { id } = useParams();
  const { user, triggerAuthModal } = useAuth();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const { addToast } = useToast();
  const { startNewChat } = useChat();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [boughtTogether, setBoughtTogether] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  // Gallery and Hover Zoom State
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center' });
  const [isZoomed, setIsZoomed] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleMouseEnter = () => setIsZoomed(true);
  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomStyle({ transformOrigin: 'center', transform: 'scale(1)' });
  };

  const isLiked = product ? isInWishlist(product._id) : false;

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        // Fetch core details
        const prodRes = await axios.get(`/api/products/${id}`);
        if (prodRes.data.success) {
          setProduct(prodRes.data.product);
          setActiveImgIndex(0);
        }

        // Fetch reviews
        const revRes = await axios.get(`/api/products/${id}/reviews`);
        if (revRes.data.success) {
          setReviews(revRes.data.reviews || []);
        }

        // Fetch similar products
        const simRes = await axios.get(`/api/products/${id}/similar`);
        if (simRes.data.success) {
          setSimilar(simRes.data.products || []);
        }

        // Fetch cross-sell frequently bought items
        const boughtRes = await axios.get(`/api/products/${id}/bought-together`);
        if (boughtRes.data.success) {
          setBoughtTogether(boughtRes.data.products || []);
        }

      } catch (err) {
        console.error('Failed to load product details page:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  // Track recently viewed
  useEffect(() => {
    if (product) {
      try {
        const viewedIds = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
        const updated = [product._id, ...viewedIds.filter(id => id !== product._id)].slice(0, 10);
        localStorage.setItem('recently_viewed', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to update recently viewed:', err);
      }
    }
  }, [product]);

  const getShippingETA = () => {
    const today = new Date();
    const minDelivery = new Date(today);
    minDelivery.setDate(today.getDate() + 2);
    const maxDelivery = new Date(today);
    maxDelivery.setDate(today.getDate() + 4);
    
    const options = { month: 'short', day: 'numeric' };
    return `${minDelivery.toLocaleDateString('en-IN', options)} - ${maxDelivery.toLocaleDateString('en-IN', options)}`;
  };

  const handleVendorChat = async () => {
    if (!user) {
      triggerAuthModal("Please login to chat with the seller.");
      return;
    }
    if (!product.sellerId) {
      addToast("Seller information not available.", "error");
      return;
    }
    try {
      const chat = await startNewChat(product.sellerId, product.sellerName || "Merchant");
      if (chat) {
        addToast("Chat initiated! Redirecting to Support Center...", "success");
        setTimeout(() => {
          navigate('/support');
        }, 1000);
      }
    } catch (err) {
      addToast("Failed to initiate chat session.", "error");
    }
  };

  const getRatingBreakdown = () => {
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (reviews.length === 0) return breakdown;
    
    reviews.forEach(r => {
      const rating = Math.round(r.rating);
      if (breakdown[rating] !== undefined) {
        breakdown[rating]++;
      }
    });
    return breakdown;
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      triggerAuthModal("Please login to write product reviews.");
      return;
    }
    
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    setReviewMessage('');

    try {
      const res = await axios.post(`/api/products/${id}/add-review`, {
        rating: reviewRating,
        comment: reviewComment
      });

      if (res.data.success) {
        setReviewMessage('✅ Review submitted successfully.');
        setReviewComment('');
        
        // Refresh reviews
        const updatedReviews = await axios.get(`/api/products/${id}/reviews`);
        setReviews(updatedReviews.data.reviews || []);
        
        // Refresh product rating averages
        const updatedProd = await axios.get(`/api/products/${id}`);
        setProduct(updatedProd.data.product);
      }
    } catch (err) {
      setReviewMessage(err.response?.data?.message || 'Failed to save review details.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleWishlistToggle = () => {
    if (!user) {
      triggerAuthModal("Please login to continue shopping.");
      return;
    }
    if (isLiked) {
      removeFromWishlist(product._id);
      addToast("Removed from Wishlist", "info");
    } else {
      addToWishlist(product);
      addToast("Added to Wishlist", "success");
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      triggerAuthModal("Please login to continue shopping.");
      return;
    }
    addToCart(product, 1);
    addToast("Product Added Successfully!", "success");
  };

  const handleBuyNow = () => {
    if (!user) {
      triggerAuthModal("Please login to continue shopping.");
      return;
    }
    addToCart(product, 1);
    addToast("Preparing checkout...", "info");
    setTimeout(() => {
      navigate('/checkout');
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-grid-pattern relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-pulse">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="rounded-3xl aspect-video bg-slate-200 dark:bg-slate-800 w-full"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl aspect-video bg-slate-200 dark:bg-slate-800 w-full"></div>
              <div className="rounded-2xl aspect-video bg-slate-200 dark:bg-slate-800 w-full"></div>
            </div>
          </div>
          
          {/* Right Column Skeleton */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="h-4 w-1/4 rounded bg-slate-200 dark:bg-slate-800"></div>
              <div className="h-8 w-3/4 rounded bg-slate-200 dark:bg-slate-800"></div>
              <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800 mt-2"></div>
            </div>
            
            <div className="flex justify-between items-center py-6 border-t border-b border-slate-200 dark:border-darkBorder/40">
              <div className="flex flex-col gap-2">
                <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800"></div>
                <div className="h-6 w-32 rounded bg-slate-200 dark:bg-slate-800"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
                <div className="h-10 w-32 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2.5">
              <div className="h-3.5 w-1/4 rounded bg-slate-200 dark:bg-slate-800"></div>
              <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
              <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
              <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-800"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-12 max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-xl font-bold">Product Catalog Item Not Found</h2>
        <Link to="/products" className="text-emerald-500 hover:underline text-xs mt-2 block">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const originalPrice = Math.round(product.price * 1.25);

  return (
    <div className="min-h-screen pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-grid-pattern">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Product Images */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {(() => {
            const galleryImages = [
              product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
              product.images?.[1] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
              product.images?.[2] || 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400'
            ];
            return (
              <>
                <div 
                  className="rounded-3xl overflow-hidden border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard aspect-video relative glass cursor-zoom-in"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <img 
                    src={galleryImages[activeImgIndex] || product.image || product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-100 ease-out" 
                    style={isZoomed ? zoomStyle : { transform: 'scale(1)', transformOrigin: 'center' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
                    }}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {galleryImages.map((img, idx) => (
                    <button 
                      key={idx} 
                      type="button"
                      onClick={() => setActiveImgIndex(idx)}
                      className={`rounded-2xl overflow-hidden border aspect-video bg-white dark:bg-darkCard glass transition-all ${
                        activeImgIndex === idx 
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                          : 'border-slate-200 dark:border-darkBorder/40 hover:border-slate-400'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`${product.name} thumb-${idx}`} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </>
            );
          })()}
        </div>

        {/* Right Column: Descriptions & Sustainability details */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] tracking-wider uppercase font-bold text-emerald-600 dark:text-emerald-400">
              {product.category}
            </span>
            <h1 className="font-extrabold text-2xl md:text-3xl text-slate-800 dark:text-slate-100">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 text-xs">
              <StarRating rating={product.rating} size={15} />
              <span className="text-slate-400 dark:text-slate-400 font-medium">({product.reviewCount} verified reviews)</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-b border-slate-200 dark:border-darkBorder/40 py-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wider block">SELLER PRICE</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-black text-2xl text-emerald-600 dark:text-emerald-400">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                    ₹{originalPrice.toLocaleString()}
                  </span>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                    20% OFF
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2.5 flex-wrap">
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 rounded-xl border flex items-center justify-center transition-colors ${
                    isLiked 
                      ? 'border-red-500/20 bg-red-500/5 text-red-500' 
                      : 'border-slate-200 dark:border-darkBorder text-slate-400 hover:text-emerald-500 hover:border-emerald-500'
                  }`}
                  title="Toggle Wishlist"
                >
                  <Heart size={16} fill={isLiked ? "currentColor" : "transparent"} />
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/10 flex items-center gap-2 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <ShoppingCart size={15} />
                  <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/10 flex items-center gap-2 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

            {/* Seller & Shipping Details Widget */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkBorder/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs mt-2">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Sold By:</span>
                <h4 className="font-extrabold text-slate-800 dark:text-slate-200">{product.sellerName || "Verified Vendor"}</h4>
                <p className="text-slate-500 dark:text-slate-400 leading-normal flex items-center gap-1.5">
                  <Truck size={13} className="text-emerald-500" />
                  <span>Shipping ETA:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-350">{getShippingETA()}</span>
                </p>
              </div>
              
              <button
                type="button"
                onClick={handleVendorChat}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-darkCard dark:hover:bg-darkBorder border border-slate-200 dark:border-darkBorder text-slate-700 dark:text-slate-350 font-bold flex items-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
              >
                <MessageSquare size={14} className="text-emerald-500" />
                <span>Inquire Seller</span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-xs text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
              Item Details & Specs
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Detailed Sustainability Panel */}
          <SustainabilityBadge sustainability={product.sustainability} showDetails={true} />
        </div>
      </div>

      {/* Frequently bought together section */}
      {boughtTogether.length > 0 && (
        <section className="mt-16 border-t border-slate-200 dark:border-darkBorder/40 pt-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-yellow-500 shrink-0 animate-pulse" />
            <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">
              Frequently Bought Together
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-center">
            {/* Primary Product Mini Summary */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white/40 dark:bg-darkCard/40 dark:border-darkBorder/40 glass flex gap-3 text-xs items-center">
               <img 
                src={product.images?.[0] || product.image || product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'} 
                alt="primary" 
                className="w-12 h-12 object-cover rounded-xl bg-slate-100" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
                }}
              />
              <div>
                <strong className="block text-slate-800 dark:text-slate-100 truncate max-w-[150px]">{product.name}</strong>
                <span className="text-emerald-500 font-extrabold">₹{product.price.toLocaleString()}</span>
              </div>
            </div>

            {/* Cross-Sell Recommendations */}
            {boughtTogether.map(item => (
              <div 
                key={item._id}
                className="p-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 glass flex justify-between items-center text-xs"
              >
                <div className="flex gap-3 items-center min-w-0">
                  <img 
                    src={item.images?.[0] || item.image || item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'} 
                    alt={item.name} 
                    className="w-12 h-12 object-cover rounded-xl bg-slate-100" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
                    }}
                  />
                  <div className="min-w-0">
                    <strong className="block text-slate-800 dark:text-slate-100 truncate max-w-[120px]">{item.name}</strong>
                    <span className="text-emerald-500 font-extrabold">₹{item.price.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => addToCart(item, 1)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px]"
                >
                  Add Package
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews & New Review form section */}
      <section className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-slate-200 dark:border-darkBorder/40 pt-10">
        
        {/* Left: Verification Reviews grid */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <MessageSquareDot className="text-emerald-500 animate-pulse" />
            <span>Shopper Reviews ({reviews.length})</span>
          </h2>

          {/* Star breakdown details */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white/40 dark:bg-darkCard/40 glass flex flex-col sm:flex-row gap-6 items-center">
            <div className="text-center sm:border-r dark:border-darkBorder sm:pr-8">
              <span className="text-4xl font-black text-slate-800 dark:text-slate-100">{product.rating}</span>
              <div className="flex justify-center my-1.5"><StarRating rating={product.rating} size={15} /></div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Rating</span>
            </div>
            
            <div className="flex-1 w-full space-y-1.5">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = getRatingBreakdown()[stars] || 0;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2 text-xs">
                    <span className="w-8 font-bold text-slate-500 dark:text-slate-400 text-left">{stars} ★</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-darkBorder/40 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <span className="w-6 text-right font-medium text-slate-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
            {reviews.length > 0 ? (
              reviews.map(rev => (
                <div 
                  key={rev._id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white/40 dark:bg-darkCard/40 dark:border-darkBorder/40 glass text-xs flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{rev.customerName}</span>
                    <StarRating rating={rev.rating} size={12} />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                  <span className="text-[10px] text-slate-400 self-end">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic py-4">No reviews written for this product yet.</span>
            )}
          </div>
        </div>

        {/* Right: Add Review Form */}
        <div className="lg:col-span-5">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <MessageSquarePlus size={16} className="text-emerald-500" />
              <span>Write a Review</span>
            </h3>

            {reviewMessage && (
              <div className="p-3 rounded-lg border text-[10px] font-bold text-center border-slate-200 bg-slate-50 dark:bg-darkBorder/40 dark:text-slate-200">
                {reviewMessage}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Rating</span>
                <div className="flex gap-1 text-yellow-500">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setReviewRating(val)}
                      className="hover:scale-110 active:scale-95 transition-transform"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill={val <= reviewRating ? "currentColor" : "none"} 
                        stroke="currentColor" 
                        strokeWidth="2"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comment</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience using this product..."
                  className="w-full bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2 text-xs outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md disabled:opacity-50"
              >
                {submittingReview ? 'Saving Review...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Similar products catalog */}
      {similar.length > 0 && (
        <section className="mt-16 border-t border-slate-200 dark:border-darkBorder/40 pt-10">
          <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 mb-6">
            Similar Products You Might Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {similar.map(item => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
