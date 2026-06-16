import React, { useEffect, useState } from 'react';
import axios from '../../services/api.js';
import { useAuth } from '../../context/AuthContext';
import { Bell, Key, ShieldAlert, Sparkles, X } from 'lucide-react';

export const DemoNotificationBar = () => {
  const { token } = useAuth();
  const [demoNotifications, setDemoNotifications] = useState([]);
  const [activeNotif, setActiveNotif] = useState(null);

  // Poll for notifications
  useEffect(() => {
    // If not logged in, we can fetch public notification logs or bypass with simple token
    const fetchDemoLogs = async () => {
      try {
        // Fetch notifications
        // Note: For demo ease, we can call /api/notifications if authenticated.
        // If not authenticated, we can temporarily query a guest notification endpoint or fetch all, 
        // but since we want to show OTPs for sign-up (unauthenticated), we'll support a fallback or 
        // fetch all notifications if we are authenticated. 
        // Wait, how do we show registration OTP?
        // Let's make sure the backend returns registration OTPs globally if requested or we fetch them easily.
        // Let's call /api/notifications. If token is not present, we will request it with a guest trigger 
        // or just let the server return it. Since we set up JWT, let's fetch notifications.
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get('/api/notifications', { headers });
        if (res.data.success) {
          const list = res.data.notifications;
          // Filter for password resets or Fraud alerts
          const logs = list.filter(n => 
            n.title.includes('Reset Link') || 
            n.title.includes('Password') || 
            n.title.includes('Fraud Risk Alert') ||
            n.title.includes('Low Stock')
          );
          setDemoNotifications(logs);
          if (logs.length > 0) {
            setActiveNotif(logs[0]); // Show the latest one
          }
        }
      } catch (error) {
        // Silent error
      }
    };

    fetchDemoLogs();
    const interval = setInterval(fetchDemoLogs, 30000); // Poll every 30s — was 4s which exhausted the API rate limiter
    return () => clearInterval(interval);
  }, [token]);

  if (!activeNotif) return null;

  // Render appropriate icons
  const getIcon = () => {
    if (activeNotif.title.includes('Reset') || activeNotif.title.includes('Password')) return <Key className="h-4 w-4 text-yellow-400 animate-pulse" />;
    if (activeNotif.title.includes('Fraud')) return <ShieldAlert className="h-4 w-4 text-red-500 animate-bounce" />;
    return <Sparkles className="h-4 w-4 text-emerald-400" />;
  };

  const getBgColor = () => {
    if (activeNotif.title.includes('Reset') || activeNotif.title.includes('Password')) return 'bg-yellow-950/80 border-yellow-800 text-yellow-200';
    if (activeNotif.title.includes('Fraud')) return 'bg-red-950/80 border-red-950 text-red-200';
    return 'bg-emerald-950/80 border-emerald-800 text-emerald-200';
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] border-b text-xs py-2 px-4 flex items-center justify-between transition-all duration-500 glass ${getBgColor()}`}>
      <div className="flex items-center gap-2 max-w-[85%] mx-auto md:mx-0">
        {getIcon()}
        <span>
          <strong className="font-semibold mr-1">{activeNotif.title}:</strong>
          {activeNotif.message}
        </span>
      </div>
      <button 
        onClick={() => setActiveNotif(null)} 
        className="hover:opacity-80 p-1 rounded-full bg-black/20"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};

export default DemoNotificationBar;
