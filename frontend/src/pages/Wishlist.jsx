import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/Product/ProductCard';
import { Heart, ArrowLeft } from 'lucide-react';

export const Wishlist = () => {
  const { wishlist } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center animate-pulse">
          <Heart size={28} />
        </div>
        <h2 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">Your Wishlist is Empty</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
          Explore items and click the heart icon on any card to save products here.
        </p>
        <Link to="/products" className="mt-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all">
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-grid-pattern">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/products" className="p-2 rounded-lg border border-gray-200/50 dark:border-darkBorder hover:border-emerald-500 text-gray-500 hover:text-emerald-500 transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-black text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>My Wishlist</span>
            <span className="text-xs font-semibold bg-red-500/15 text-red-500 px-2 py-0.5 rounded-full">
              {wishlist.length} Saved
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Your personal catalog bookmarked items</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
