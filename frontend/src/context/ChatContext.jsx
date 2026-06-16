import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import axios from '../services/api.js';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socketNotifications, setSocketNotifications] = useState([]);
  
  // Connect socket on user login
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = 'http://localhost:5001';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected:', newSocket.id);
      newSocket.emit('join_room', user.id);
    });

    // Real-time chat messages listener
    newSocket.on('receive_message', (msg) => {
      setMessages(prev => {
        // Prevent duplicate appending
        if (prev.some(m => m.createdAt === msg.createdAt && m.senderId === msg.senderId)) {
          return prev;
        }
        return [...prev, msg];
      });
      addToast(`💬 New message from ${msg.senderName}`, 'info');
    });

    // Real-time notification updates (Bell alerts)
    newSocket.on('notification', (notif) => {
      setSocketNotifications(prev => [notif, ...prev]);
      addToast(`${notif.title}: ${notif.message}`, notif.type || 'info');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Load chat threads
  const loadChats = async () => {
    if (!user) return;
    try {
      const res = await axios.get('/api/chats');
      if (res.data.success) {
        setChats(res.data.chats || []);
      }
    } catch (e) {
      console.error(e.message);
    }
  };

  // Select/Open a chat session
  const openChatSession = async (chatSession) => {
    setActiveChat(chatSession);
    try {
      const res = await axios.get(`/api/chats/${chatSession._id}/messages`);
      if (res.data.success) {
        setMessages(res.data.messages || []);
      }
    } catch (e) {
      console.error(e.message);
    }
  };

  // Send a chat message
  const sendNewMessage = async (text) => {
    if (!activeChat || !user) return;
    
    // Determine recipient
    const recipientId = user.role === 'seller' ? activeChat.customerId : activeChat.sellerId;
    
    try {
      const res = await axios.post('/api/chats/send', {
        chatId: activeChat._id,
        text,
        recipientId
      });
      
      if (res.data.success) {
        const msg = res.data.message;
        setMessages(prev => [...prev, msg]);
        
        // Relay via socket instantly for real-time visual
        if (socket) {
          socket.emit('send_message', {
            chatId: activeChat._id,
            senderId: user.id,
            senderName: user.name,
            text,
            recipientId,
            createdAt: msg.createdAt
          });
        }
        
        // Update last message in chat threads list
        setChats(prev => prev.map(c => 
          c._id === activeChat._id ? { ...c, lastMessage: text, updatedAt: new Date().toISOString() } : c
        ));
      }
    } catch (e) {
      console.error('Failed to send message:', e.message);
    }
  };

  const startNewChat = async (sellerId, sellerName) => {
    try {
      const res = await axios.post('/api/chats/create', { sellerId, sellerName });
      if (res.data.success) {
        const newChat = res.data.chat;
        setChats(prev => {
          if (prev.some(c => c._id === newChat._id)) return prev;
          return [newChat, ...prev];
        });
        await openChatSession(newChat);
        return newChat;
      }
    } catch (e) {
      console.error(e.message);
    }
  };

  return (
    <ChatContext.Provider value={{
      socket,
      chats,
      activeChat,
      messages,
      socketNotifications,
      setSocketNotifications,
      loadChats,
      openChatSession,
      sendNewMessage,
      startNewChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
