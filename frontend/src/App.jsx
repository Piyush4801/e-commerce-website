import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { CoinsProvider } from './context/CoinsContext';
import { ChatProvider } from './context/ChatContext';

// Common Layout Elements
import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer';
import DemoNotificationBar from './components/Common/DemoNotificationBar';
import AIChatbot from './components/AI/AIChatbot';
import AuthModal from './components/Common/AuthModal';
import CartDrawer from './components/Common/CartDrawer';
import ErrorBoundary from './components/Common/ErrorBoundary';


// Page Views
import LandingPage from './pages/LandingPage';
import ProductsCatalog from './pages/ProductsCatalog';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
// Dashboards
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import SellerDashboard from './pages/Seller/SellerDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import GamingZone from './pages/Customer/GamingZone';
import SupportCenter from './pages/Customer/SupportCenter';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#090a0f] text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Demo helper banner shows sent OTP codes and active fraud scoring triggers */}
      <DemoNotificationBar />
      
      {/* Header bar */}
      <Navbar />

      {/* Main page content area */}
      <main className="flex-grow">
        <Routes>
          {/* Public Routing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<ProductsCatalog />} />
          <Route path="/product/:id" element={<ProductDetails />} />

          {/* Protected Shopping Routing */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />

          {/* Authentication & OTP validation */}
          <Route path="/login" element={<Login defaultRole="customer" />} />
          <Route path="/admin/login" element={<Login defaultRole="admin" />} />
          <Route path="/seller/login" element={<Login defaultRole="seller" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Customer Dashboard Routing */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/customer" element={<Navigate to="/dashboard" replace />} />

          <Route 
            path="/gaming-zone" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <GamingZone />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/support" 
            element={
              <ProtectedRoute>
                <SupportCenter />
              </ProtectedRoute>
            } 
          />

          {/* Seller / Vendor Dashboard Routing */}
          <Route 
            path="/seller/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['seller']}>
                <SellerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/seller" element={<Navigate to="/seller/dashboard" replace />} />

          {/* System Admin Dashboard Routing */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Redirect all unmatched routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Slide-out AI Conversation Helper widget */}
      <AIChatbot />

      {/* Global guest auth modal */}
      <AuthModal />

      {/* Global shopping cart drawer */}
      <CartDrawer />

      {/* Footer bar */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <CoinsProvider>
              <ChatProvider>
                <CartProvider>
                  <BrowserRouter>
                    <AppContent />
                  </BrowserRouter>
                </CartProvider>
              </ChatProvider>
            </CoinsProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
