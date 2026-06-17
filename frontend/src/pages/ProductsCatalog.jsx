import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../services/api.js';
import ProductCard from '../components/Product/ProductCard';
import { Filter, Leaf, ArrowUpDown, RefreshCw, X } from 'lucide-react';

export const ProductsCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Search parameters from URL
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters State
  const [category, setCategory] = useState(categoryParam);
  const [search, setSearch] = useState(searchParam);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sort, setSort] = useState('newest');
  
  // Green Products Only filter
  const [greenOnly, setGreenOnly] = useState(false);

  useEffect(() => {
    // Keep internal filter state synced if URL parameters change
    setCategory(searchParams.get('category') || '');
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Build API query parameters
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minRating) params.append('minRating', minRating);
      if (sort) params.append('sort', sort);
      params.append('limit', 100); // Fetch all for easy client-side filtering / paginations

      const res = await axios.get(`/api/products?${params.toString()}`);
      if (res.data.success) {
        let list = res.data.products || [];
        
        // Client side filtering for green products if selected
        if (greenOnly) {
          list = list.filter(p => ['A', 'B'].includes(p.sustainability?.ecoScore));
        }

        setProducts(list);
        setTotal(list.length);
      }
    } catch (e) {
      console.error('Failed to load products list:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, search, minPrice, maxPrice, minRating, sort, greenOnly]);

  const clearFilters = () => {
    setCategory('');
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSort('newest');
    setGreenOnly(false);
    setSearchParams({});
  };

  const categories = [
    { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' },
    { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400' },
    { name: 'Books', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400' },
    { name: 'Grocery', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' },
    { name: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=400' },
    { name: 'Sports', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400' },
    { name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1556910103-1c02745a872f?w=400' }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-grid-pattern">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-black text-2xl text-slate-800 dark:text-slate-100">
            {category ? `${category} Catalog` : 'Explore Smart Store'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {search ? `Search results for "${search}"` : 'Browse high-quality products from top verified vendors'}
          </p>
        </div>
        
        <div className="flex gap-3 text-xs w-full md:w-auto">
          {/* Green filter */}
          <button
            onClick={() => setGreenOnly(!greenOnly)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border font-bold transition-all cursor-pointer ${
              greenOnly 
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500' 
                : 'border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Leaf size={14} fill={greenOnly ? "currentColor" : "none"} />
            <span>Sustainable Only</span>
          </button>

          {/* Sort selection */}
          <div className="relative flex items-center bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300">
            <ArrowUpDown size={13} className="text-slate-400 mr-2" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent border-none outline-none font-bold cursor-pointer focus:ring-0"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Rating Average</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Filter Sidebar */}
        <div className="lg:col-span-3 p-5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-5 text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-darkBorder/40">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Filter size={15} className="text-emerald-500" />
              <span>Filters</span>
            </h3>
            <button onClick={clearFilters} className="text-[10px] text-red-500 hover:underline font-bold cursor-pointer">
              Clear All
            </button>
          </div>

          {/* Search bar inside filters */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Search Keyword</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. laptop, running..."
              className="bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2.5 text-xs outline-none text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Department Categories */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-455 uppercase tracking-wider">Department</span>
            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="cat_filter"
                  checked={category === ''}
                  onChange={() => setCategory('')}
                  className="text-emerald-500 focus:ring-emerald-500"
                />
                <span>All Categories</span>
              </label>
              {categories.map(cat => (
                <label key={cat.name} className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors py-1">
                  <input
                    type="radio"
                    name="cat_filter"
                    checked={category === cat.name}
                    onChange={() => setCategory(cat.name)}
                    className="text-emerald-500 focus:ring-emerald-500 mt-0.5"
                  />
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200 dark:border-darkBorder/60 flex-shrink-0">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range inputs */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-455 uppercase tracking-wider">Price Range (₹)</span>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                className="w-full bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-100"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                className="w-full bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Rating filter */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-455 uppercase tracking-wider">Customer Ratings</span>
            <div className="flex flex-col gap-1.5">
              {[5, 4, 3, 2].map(stars => (
                <label key={stars} className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-305 dark:text-slate-300">
                  <input
                    type="radio"
                    name="rating_filter"
                    checked={parseInt(minRating) === stars}
                    onChange={() => setMinRating(String(stars))}
                    className="text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>{stars}★ Ratings</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Products Grid */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard p-4 flex flex-col gap-3 animate-pulse">
                  <div className="aspect-video w-full rounded-xl bg-slate-200 dark:bg-slate-800"></div>
                  <div className="h-3 w-1/4 rounded bg-slate-200 dark:bg-slate-800"></div>
                  <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800"></div>
                  <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
                  <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-800"></div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 dark:border-darkBorder/30">
                    <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-800"></div>
                    <div className="h-8 w-1/4 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          ) : (
            <div className="py-24 text-center rounded-2xl border border-dashed border-slate-300 dark:border-darkBorder/60 bg-white/30 dark:bg-darkCard/20 flex flex-col items-center justify-center gap-2">
              <span className="text-3xl">📭</span>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">No matching products found</h3>
              <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
                Adjust your price filters or keywords to expand search results.
              </p>
              <button 
                onClick={clearFilters}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsCatalog;
