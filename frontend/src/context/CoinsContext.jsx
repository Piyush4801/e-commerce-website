import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../services/api.js';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CoinsContext = createContext();

export const CoinsProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Checkout redemption state
  const [coinsToRedeem, setCoinsToRedeem] = useState(0);
  const [redeemDiscount, setRedeemDiscount] = useState(0);

  const fetchWallet = async () => {
    if (!user) return;
    try {
      const res = await axios.get('/api/coins/wallet');
      if (res.data.success) {
        setBalance(res.data.balance || 0);
        setTransactions(res.data.transactions || []);
      }
    } catch (e) {
      console.error('Failed to load wallet:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWallet();
    } else {
      setBalance(0);
      setTransactions([]);
      setCoinsToRedeem(0);
      setRedeemDiscount(0);
    }
  }, [user]);

  const claimDailyLoginCoins = async () => {
    try {
      const res = await axios.post('/api/coins/daily-login');
      if (res.data.success) {
        setBalance(res.data.balance);
        addToast('🎉 Daily check-in claimed! Received 50 SmartCoins.', 'success');
        await fetchWallet();
        return { success: true };
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Daily coins already claimed today.', 'info');
      return { success: false };
    }
  };

  // Computes coins discount based on rules: 100 coins = ₹10, max 20% of cart total
  const computeRedeemDiscount = (cartTotal) => {
    if (coinsToRedeem <= 0) {
      setRedeemDiscount(0);
      return 0;
    }
    const potentialDiscount = (coinsToRedeem / 100) * 10;
    const maxDiscount = cartTotal * 0.20;
    const finalDiscount = Math.min(potentialDiscount, maxDiscount);
    setRedeemDiscount(finalDiscount);
    return finalDiscount;
  };

  return (
    <CoinsContext.Provider value={{
      balance,
      transactions,
      loading,
      coinsToRedeem,
      redeemDiscount,
      setCoinsToRedeem,
      fetchWallet,
      claimDailyLoginCoins,
      computeRedeemDiscount
    }}>
      {children}
    </CoinsContext.Provider>
  );
};

export const useCoins = () => useContext(CoinsContext);
