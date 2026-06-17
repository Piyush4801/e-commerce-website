import React, { useEffect, useState } from 'react';
import axios from '../services/api.js';
import { Link } from 'react-router-dom';
import ProductCard from '../components/Product/ProductCard';
import ConversationSearch from '../components/AI/ConversationSearch';
import { 
  Sparkles, Leaf, ShieldCheck, Heart, Award, ArrowRight, TrendingUp, Users, ShoppingBag, Landmark, History
} from 'lucide-react';

export const LandingPage = () => {
  const [trending, setTrending] = useState([]);
  const [greenProducts, setGreenProducts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [frequentlyBought, setFrequentlyBought] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products for listing
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await axios.get('/api/products?limit=100');
        if (res.data.success) {
          const list = res.data.products;
          
          // Sort for trending (highest ratings)
          const trendList = [...list].sort((a, b) => b.rating - a.rating).slice(0, 3);
          setTrending(trendList);
          
          // Filter for green products (Eco Score A or B)
          setGreenProducts(list.filter(p => ['A', 'B'].includes(p.sustainability?.ecoScore)).slice(0, 3));

          // Recommended: high ratings, not in trending
          const recList = [...list]
            .filter(p => !trendList.some(t => t._id === p._id))
            .sort((a, b) => b.reviewCount - a.reviewCount)
            .slice(0, 3);
          setRecommended(recList);

          // Frequently Bought Together: some other slice
          const freqList = [...list]
            .filter(p => !trendList.some(t => t._id === p._id) && !recList.some(r => r._id === p._id))
            .slice(0, 3);
          setFrequentlyBought(freqList);

          // Load recently viewed from localStorage
          try {
            const viewedIds = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
            if (Array.isArray(viewedIds) && viewedIds.length > 0) {
              const viewedProds = list.filter(p => viewedIds.includes(p._id));
              const sortedViewed = viewedIds
                .map(id => viewedProds.find(p => p._id === id))
                .filter(Boolean)
                .slice(0, 3);
              setRecentlyViewed(sortedViewed);
            }
          } catch (err) {
            console.error('Failed to parse recently viewed:', err);
          }
        }
      } catch (error) {
        console.error('Landing page load failed:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const categories = [
    { name: 'Electronics', count: 15, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', bg: 'from-blue-500/10 to-blue-500/5' },
    { name: 'Fashion', count: 20, image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', bg: 'from-pink-500/10 to-pink-500/5' },
    { name: 'Books', count: 12, image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400', bg: 'from-amber-500/10 to-amber-500/5' },
    { name: 'Grocery', count: 18, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400', bg: 'from-emerald-500/10 to-emerald-500/5' },
    { name: 'Beauty', count: 14, image: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400', bg: 'from-purple-500/10 to-purple-500/5' },
    { name: 'Sports', count: 12, image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400', bg: 'from-red-500/10 to-red-500/5' },
    { name: 'Home & Kitchen', count: 14, image: 'https://images.unsplash.com/photo-1556910103-1c02745a872f?w=400', bg: 'from-teal-500/10 to-teal-500/5' }
  ];

  const stats = [
    { value: '25,000+', label: 'Active Shoppers', icon: <Users className="text-emerald-500" /> },
    { value: '1,200+', label: 'Verified Sellers', icon: <ShoppingBag className="text-emerald-500" /> },
    { value: '₹4.5Cr+', label: 'Gross Sales Volume', icon: <Landmark className="text-emerald-500" /> },
    { value: '12,500 kg', label: 'CO₂ Emissions Offset', icon: <Leaf className="text-emerald-500" /> }
  ];

  return (
    <div className="pt-20 pb-12 flex flex-col gap-16 relative overflow-hidden bg-grid-pattern">
      {/* Glow Auroras */}
      <div className="absolute top-20 left-1/4 w-96 h-96 aura-glow-primary pointer-events-none rounded-full"></div>
      <div className="absolute top-80 right-1/4 w-96 h-96 aura-glow-purple pointer-events-none rounded-full"></div>

      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 py-8">
        <div className="flex flex-col items-center gap-6 max-w-3xl mx-auto">
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <Sparkles size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
            The Future of E-Commerce is AI-Powered
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 leading-[1.15]">
            Welcome to <span className="bg-gradient-to-r from-emerald-500 to-emerald-300 bg-clip-text text-transparent">SmartCart AI</span>
          </h1>

          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
            Shop smarter, faster, and green. Interact with our AI shopping assistant, search by typing natural conversation requests, track sustainability scores, and earn gamified rewards.
          </p>

          <div className="flex gap-4">
            <Link
              to="/products"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
            >
              <span>Explore Catalog</span>
              <ArrowRight size={16} />
            </Link>
            <a
              href="#conversational-search"
              className="px-6 py-3 rounded-xl border border-gray-200 dark:border-darkBorder hover:border-emerald-500 dark:hover:border-emerald-600 bg-white/75 dark:bg-darkCard/75 font-semibold text-slate-700 dark:text-slate-200 text-sm glass flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
            >
              <span>Conversational Search</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Conversational Search Anchor */}
      <section id="conversational-search" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
            <MessageCircle className="text-emerald-500" />
            <span>Shop By Conversation</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Describe what you're looking for in plain English. Our AI parses price limits, keywords, and recommends top matches.
          </p>
        </div>
        <ConversationSearch />
      </section>

      {/* 3. Category Carousel Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
              Browse Departments
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Explore products by catalog categories</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className={`p-4 rounded-2xl border border-gray-200/50 dark:border-darkBorder bg-white/40 dark:bg-darkCard/40 glass hover:border-emerald-500/40 dark:hover:border-emerald-500/30 flex flex-col items-center justify-center gap-3 text-center group hover:-translate-y-1 transition-all duration-300`}
            >
              <div className="w-16 h-16 rounded-full border border-emerald-500/20 group-hover:border-emerald-500/80 overflow-hidden shadow-inner transition-colors duration-300 flex-shrink-0 bg-slate-100 dark:bg-darkBorder/30">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-emerald-500">
                  {cat.name}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4a. Trending Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="text-emerald-500" />
              <span>Trending Products</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Top-rated items selected by shoppers this week</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-200/60 dark:bg-darkBorder/40 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trending.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4b. Recommended For You */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="text-emerald-500" size={16} />
              <span>Recommended For You</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Personalized recommendations based on community demand</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1">
            <span>Explore More</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-200/60 dark:bg-darkBorder/40 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommended.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4c. Frequently Bought Together */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ShoppingBag className="text-emerald-500" size={16} />
              <span>Frequently Bought Together</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Perfect bundles and popular companion products</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-200/60 dark:bg-darkBorder/40 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {frequentlyBought.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4d. Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <History className="text-emerald-500" size={16} />
                <span>Recently Viewed Products</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pick up right where you left off</p>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('recently_viewed');
                setRecentlyViewed([]);
              }}
              className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
            >
              Clear History
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentlyViewed.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Sustainability Green Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="rounded-3xl border border-emerald-500/25 bg-emerald-950/20 glass overflow-hidden grid grid-cols-1 lg:grid-cols-12 p-8 gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <span className="flex items-center gap-1 self-start text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-550/20">
              <Leaf size={10} />
              CARBON NEUTRAL INITIATIVE
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-emerald-400">
              Shop Green, Reduce Carbon Footprint
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              SmartCart AI helps you make eco-friendly choices. Every product catalog entry lists carbon estimations (in kg CO₂) and an Eco Score rating (A-E) calculated by supply chain materials. You can opt to offset your delivery footprint for just ₹15 at checkout, funding reforestation programs.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-emerald-500/10 text-xs">
              <div>
                <strong className="block text-slate-800 dark:text-slate-100 text-sm">Carbon Scores</strong>
                <span className="opacity-85 text-[10px]">Indexed on all products</span>
              </div>
              <div>
                <strong className="block text-slate-800 dark:text-slate-100 text-sm">Green Toggles</strong>
                <span className="opacity-85 text-[10px]">Filter sustainable items</span>
              </div>
              <div>
                <strong className="block text-slate-800 dark:text-slate-100 text-sm">Offset Fees</strong>
                <span className="opacity-85 text-[10px]">Voluntary forest funding</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Top Eco-Friendly Options</h4>
            <div className="flex flex-col gap-3">
              {greenProducts.map(p => (
                <Link 
                  key={p._id}
                  to={`/product/${p._id}`}
                  className="p-3 rounded-xl bg-white/50 dark:bg-darkCard/50 border border-gray-200/50 dark:border-darkBorder/60 hover:border-emerald-500/30 flex gap-3 text-xs items-center transition-all"
                >
                  <img referrerPolicy="no-referrer" 
                    src={p.images?.[0] || p.image || p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'} 
                    alt={p.name} 
                    className="w-12 h-12 object-cover rounded-lg bg-gray-100" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 truncate">{p.name}</h5>
                    <span className="text-emerald-500 font-extrabold">₹{p.price.toLocaleString()}</span>
                  </div>
                  <span className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px]">
                    {p.sustainability?.ecoScore}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Loyalty Gamification Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <Award className="h-10 w-10 text-emerald-500 animate-bounce" />
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            Gamified Reward & Tiers
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
            Earn 10 points for every ₹100 spent. Level up from Bronze to Platinum to unlock automatic checkout discount multipliers, achievements, and unique shareable referral codes.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mt-4 text-xs font-bold text-white">
            <div className="badge-bronze py-4 px-2 rounded-2xl flex flex-col items-center gap-1 text-slate-100">
              <span className="text-lg">🥉</span>
              <span>Bronze</span>
              <span className="text-[10px] opacity-80">Default Level</span>
            </div>
            <div className="badge-silver py-4 px-2 rounded-2xl flex flex-col items-center gap-1 text-slate-200">
              <span className="text-lg">🥈</span>
              <span>Silver</span>
              <span className="text-[10px] opacity-80">500+ pts • 2% Off</span>
            </div>
            <div className="badge-gold py-4 px-2 rounded-2xl flex flex-col items-center gap-1">
              <span className="text-lg">🥇</span>
              <span>Gold</span>
              <span className="text-[10px] opacity-80">1500+ pts • 5% Off</span>
            </div>
            <div className="badge-platinum py-4 px-2 rounded-2xl flex flex-col items-center gap-1">
              <span className="text-lg">👑</span>
              <span>Platinum</span>
              <span className="text-[10px] opacity-80">4000+ pts • 10% Off</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full border-t border-b border-gray-200/50 dark:border-darkBorder py-8 bg-white/30 dark:bg-darkCard/20 glass rounded-3xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center text-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                {stat.icon}
              </div>
              <span className="font-extrabold text-2xl text-slate-900 dark:text-slate-100">{stat.value}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// Simple Mock wrapper inside JSX if Lucide MessageCircle is missing in older specs
const MessageCircle = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export default LandingPage;
