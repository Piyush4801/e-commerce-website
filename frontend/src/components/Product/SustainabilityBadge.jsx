import React from 'react';
import { Leaf } from 'lucide-react';

export const SustainabilityBadge = ({ sustainability, showDetails = false }) => {
  if (!sustainability) return null;

  const { ecoScore = 'C', ecoRating = 3, carbonFootprint = 5.0 } = sustainability;

  // Grade styling
  const gradeColors = {
    A: 'bg-emerald-500 text-white dark:bg-emerald-600',
    B: 'bg-green-400 text-slate-900 dark:bg-green-500 dark:text-white',
    C: 'bg-yellow-400 text-slate-900 dark:bg-yellow-500 dark:text-white',
    D: 'bg-orange-400 text-white dark:bg-orange-500',
    E: 'bg-red-500 text-white dark:bg-red-600',
  };

  const gradeBorders = {
    A: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-500 dark:border-emerald-400/20 dark:bg-emerald-950/20 dark:text-emerald-400',
    B: 'border-green-500/30 bg-green-500/5 text-green-500 dark:border-green-400/20 dark:bg-green-950/20 dark:text-green-400',
    C: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-600 dark:border-yellow-400/20 dark:bg-yellow-950/20 dark:text-yellow-400',
    D: 'border-orange-500/30 bg-orange-500/5 text-orange-500 dark:border-orange-400/20 dark:bg-orange-950/20 dark:text-orange-400',
    E: 'border-red-500/30 bg-red-500/5 text-red-500 dark:border-red-400/20 dark:bg-red-950/20 dark:text-red-400',
  };

  if (!showDetails) {
    return (
      <div className="flex items-center gap-1">
        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${gradeColors[ecoScore]}`}>
          {ecoScore}
        </span>
        <div className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
          <Leaf size={10} fill="currentColor" />
          <span>{carbonFootprint} kg CO₂</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border flex flex-col gap-3 ${gradeBorders[ecoScore]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 animate-pulse" />
          <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Sustainability Index</h4>
            <p className="text-[10px] opacity-80">Eco Score & Carbon Impact rating</p>
          </div>
        </div>
        <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-md ${gradeColors[ecoScore]}`}>
          {ecoScore}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-current/10 text-xs">
        <div>
          <span className="opacity-75 block text-[10px]">CARBON FOOTPRINT</span>
          <strong className="text-sm">{carbonFootprint} kg CO₂ / unit</strong>
        </div>
        <div>
          <span className="opacity-75 block text-[10px]">ECO RATING</span>
          <div className="flex items-center gap-0.5 text-yellow-500 mt-0.5">
            {[...Array(5)].map((_, i) => (
              <Leaf 
                key={i} 
                size={12} 
                fill={i < ecoRating ? "currentColor" : "transparent"} 
                className={i < ecoRating ? "text-emerald-500" : "text-gray-300 dark:text-gray-600"}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityBadge;
