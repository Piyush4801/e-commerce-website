import React, { useState } from 'react';
import axios from '../../services/api.js';
import ProductCard from '../Product/ProductCard';
import { Search, Sparkles, MessageCircleCode } from 'lucide-react';

export const ConversationSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await axios.post('/api/products/ai/conversational', { text: query });
      if (res.data.success) {
        setResults(res.data.products || []);
        setExplanation(res.data.explanation || '');
      } else {
        setResults([]);
        setExplanation('Failed to fetch recommendations. Try another search query.');
      }
    } catch (error) {
      setResults([]);
      setExplanation('An error occurred while communicating with the AI server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="relative rounded-3xl overflow-hidden glass shadow-xl p-2 border border-emerald-500/20 flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-200">
          <MessageCircleCode className="h-5 w-5 text-emerald-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type: 'I need a coding laptop under ₹60,000' or 'Suggest running shoes'..."
            className="w-full bg-transparent border-none outline-none text-sm focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Sparkles size={16} className="text-yellow-400 animate-pulse" />
          <span>Ask SmartCart AI</span>
        </button>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin"></div>
          <p className="text-xs text-gray-400">AI Engine is parsing keywords and scoring matching products...</p>
        </div>
      )}

      {/* Results Rendering */}
      {hasSearched && !loading && (
        <div className="p-5 rounded-2xl border border-gray-200/50 dark:border-darkBorder/60 bg-white dark:bg-darkCard/50 glass flex flex-col gap-4 animate-float">
          {/* AI Explanation Bubble */}
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-slate-800 dark:text-slate-100 flex gap-3 text-xs leading-relaxed">
            <Sparkles className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-emerald-400 mb-1">AI Recommendation Log</h4>
              <p className="whitespace-pre-line">{explanation}</p>
            </div>
          </div>

          {/* Product grid list */}
          {results.length > 0 ? (
            <div>
              <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                Matching Product Cards
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {results.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-gray-400">
              No product items fit your search filter description.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConversationSearch;
