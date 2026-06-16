import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../services/api.js';

const AuthContext = createContext();

// Default API Base URL (Vite dev server proxies /api to port 5001)
axios.defaults.baseURL = ''; 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('Please login to continue shopping.');

  const triggerAuthModal = (message = 'Please login to continue shopping.') => {
    setIsAuthModalOpen(true);
    setAuthModalMessage(message);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Run on mount to retrieve cookie session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const res = await axios.get('/api/auth/profile');
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          // Try silent refresh
          await attemptSilentRefresh();
        }
      } catch (error) {
        // Try silent refresh
        await attemptSilentRefresh();
      } finally {
        setLoading(false);
      }
    };

    const attemptSilentRefresh = async () => {
      try {
        const res = await axios.post('/api/auth/refresh');
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    };

    initializeAuth();
  }, []);

  // Activity-based Inactivity Auto-Logout (15 minutes)
  useEffect(() => {
    if (!user) return;

    let inactivityTimer;

    const logoutDueToInactivity = () => {
      console.log('⏰ Inactivity limit reached. Performing auto-logout.');
      logout();
    };

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      // 15 minutes = 15 * 60 * 1000 milliseconds
      inactivityTimer = setTimeout(logoutDueToInactivity, 15 * 60 * 1000);
    };

    // Listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer(); // Initialize timer

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user]);

  // Auth Operations
  const registerUser = async (name, email, password, confirmPassword, mobile, role, referredBy) => {
    const res = await axios.post('/api/auth/register', { name, email, password, confirmPassword, mobile, role, referredBy });
    if (res.data.success) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const loginUser = async (emailOrMobile, password) => {
    const res = await axios.post('/api/auth/login', { emailOrMobile, password });
    if (res.data.success) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (e) {}
    setUser(null);
  };

  const updateProfile = async (name, phone) => {
    const res = await axios.put('/api/auth/profile', { name, phone });
    if (res.data.success) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const addAddress = async (addr) => {
    const res = await axios.post('/api/auth/address', addr);
    if (res.data.success) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const deleteAddress = async (id) => {
    const res = await axios.delete(`/api/auth/address/${id}`);
    if (res.data.success) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const refreshUser = async () => {
    try {
      const res = await axios.get('/api/auth/profile');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      loading,
      register: registerUser,
      login: loginUser,
      logout,
      updateProfile,
      addAddress,
      deleteAddress,
      refreshUser,
      isAuthModalOpen,
      authModalMessage,
      triggerAuthModal,
      closeAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
