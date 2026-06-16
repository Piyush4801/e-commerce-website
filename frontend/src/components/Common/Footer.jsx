import React from 'react';
import { Sparkles, Mail, Phone, MapPin, Globe } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-gray-200/50 dark:border-darkBorder bg-white dark:bg-[#0c0d14] text-slate-600 dark:text-gray-400 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
        {/* Info Col */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-base">
              S
            </div>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              SmartCart <span className="text-emerald-500 text-[10px] font-semibold bg-emerald-500/10 px-1 rounded"><Sparkles size={8} fill="currentColor" /> AI</span>
            </span>
          </div>
          <p className="leading-relaxed opacity-80">
            A next-generation multi-vendor shopping platform combining natural conversation searches, carbon impact scoring, fraud detection models, and gamified loyalty systems.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="p-2 rounded-lg bg-gray-100 dark:bg-darkBorder hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer">
              <Globe size={14} />
            </span>
          </div>
        </div>

        {/* Links Col */}
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider text-[10px]">Shop Departments</h4>
          <ul className="space-y-2.5 opacity-90">
            <li><span className="hover:text-emerald-500 transition-colors cursor-pointer">Consumer Electronics</span></li>
            <li><span className="hover:text-emerald-500 transition-colors cursor-pointer">Sustainable Apparel</span></li>
            <li><span className="hover:text-emerald-500 transition-colors cursor-pointer">Organic Groceries</span></li>
            <li><span className="hover:text-emerald-500 transition-colors cursor-pointer">Fairtrade Books & Novelties</span></li>
          </ul>
        </div>

        {/* Gamification Tier Details */}
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider text-[10px]">Loyalty Benefits</h4>
          <ul className="space-y-2.5 opacity-90">
            <li><span className="hover:text-emerald-500 transition-colors cursor-pointer">Bronze Tier: Free Welcome Points</span></li>
            <li><span className="hover:text-emerald-500 transition-colors cursor-pointer">Silver Tier: 2% Flat Multiplier Discount</span></li>
            <li><span className="hover:text-emerald-500 transition-colors cursor-pointer">Gold Tier: 5% Off Checkout</span></li>
            <li><span className="hover:text-emerald-500 transition-colors cursor-pointer">Platinum Tier: 10% Absolute Cart Cut</span></li>
          </ul>
        </div>

        {/* Contacts */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider text-[10px]">Platform Security</h4>
          <div className="flex items-center gap-2 opacity-80">
            <Mail size={14} className="text-emerald-500 shrink-0" />
            <span>support@smartcart.com</span>
          </div>
          <div className="flex items-center gap-2 opacity-80">
            <Phone size={14} className="text-emerald-500 shrink-0" />
            <span>+1 (555) 0199-322</span>
          </div>
          <div className="flex items-center gap-2 opacity-80">
            <MapPin size={14} className="text-emerald-500 shrink-0" />
            <span>Secured JWT, 2FA OTP Protocol</span>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-gray-200/50 dark:border-darkBorder/40 text-center text-[10px] opacity-75">
        © 2026 SmartCart AI. Constructed for National Hackathon Presentation. All simulated metrics are mock logs.
      </div>
    </footer>
  );
};

export default Footer;
