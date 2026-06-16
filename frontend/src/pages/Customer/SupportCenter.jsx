import React, { useEffect, useState } from 'react';
import axios from '../../services/api.js';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useToast } from '../../context/ToastContext';
import { HelpCircle, Send, MessageSquare, Ticket, FileQuestion, Plus, RefreshCw } from 'lucide-react';

export const SupportCenter = () => {
  const { user } = useAuth();
  const { chats, activeChat, messages, loadChats, openChatSession, sendNewMessage } = useChat();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets', 'chat', 'faq'
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  // New ticket form
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketCategory, setTicketCategory] = useState('general');
  const [ticketOrderId, setTicketOrderId] = useState('');

  // Chat message input
  const [chatInput, setChatInput] = useState('');

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await axios.get('/api/support/tickets');
      if (res.data.success) {
        setTickets(res.data.tickets || []);
      }
    } catch (e) {
      console.error(e.message);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    loadChats();
  }, []);

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/support/tickets', {
        title: ticketTitle,
        description: ticketDesc,
        category: ticketCategory,
        orderId: ticketOrderId || undefined
      });

      if (res.data.success) {
        addToast('Ticket raised successfully!', 'success');
        setTicketTitle('');
        setTicketDesc('');
        setTicketCategory('general');
        setTicketOrderId('');
        setShowTicketForm(false);
        fetchTickets();
      }
    } catch (err) {
      addToast('Failed to file ticket.', 'error');
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendNewMessage(chatInput.trim());
    setChatInput('');
  };

  const faqs = [
    { q: 'How do I earn SmartCoins?', a: 'You earn SmartCoins on every order (₹100 Spent = 10 Coins), daily check-in login, user registrations, and matching memory card games.' },
    { q: 'How do I redeem coins?', a: 'During checkout, you can apply coins to deduct the total order bill (100 coins = ₹10 off). This is capped at 20% of your total order value.' },
    { q: 'How do I request a refund?', a: 'Raise a ticket under the category "refund" with your Order Reference ID. Once approved, the order credits back instantly.' },
    { q: 'How does live location tracking work?', a: 'Click the "Map Pin" Deliver option in the header. Authorize permission and inspect the route simulation to matched sellers.' }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-grid-pattern relative">
      <div className="absolute top-20 left-1/4 w-96 h-96 aura-glow-primary pointer-events-none rounded-full"></div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-black text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Help Support Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage tickets, live chat with vendors, and check FAQ guidelines</p>
        </div>

        {/* Support Tabs */}
        <div className="flex gap-2 text-xs font-bold bg-white dark:bg-darkCard p-1 rounded-xl border border-slate-200 dark:border-darkBorder">
          {[
            { id: 'tickets', label: 'My Tickets', icon: <Ticket size={13} /> },
            { id: 'chat', label: 'Chat Logs', icon: <MessageSquare size={13} /> },
            { id: 'faq', label: 'FAQ Board', icon: <HelpCircle size={13} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-emerald-500 text-white' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ==================================================== */}
      {/* 1. TICKETS MANAGER VIEW */}
      {/* ==================================================== */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 flex flex-col gap-5">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Support Tickets Log</h3>
                <button
                  onClick={() => setShowTicketForm(!showTicketForm)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} />
                  <span>Raise New Ticket</span>
                </button>
              </div>

              {loadingTickets ? (
                <div className="animate-pulse space-y-3 py-4">
                  <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                  <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                </div>
              ) : tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map(ticket => (
                    <div 
                      key={ticket._id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-darkBorder/10 flex justify-between items-start text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            ticket.status === 'open' 
                              ? 'bg-red-500/10 text-red-500' 
                              : (ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-300 text-slate-600')
                          }`}>
                            {ticket.status}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 capitalize">{ticket.category} Ticket</span>
                        </div>
                        <strong className="block text-slate-800 dark:text-slate-250 mt-1">{ticket.title}</strong>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 leading-normal">{ticket.description}</p>
                        {ticket.orderId && (
                          <span className="text-[9px] text-slate-400 block mt-2">Related Order ID: {ticket.orderId}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="italic text-slate-400 py-6 text-center text-xs">No active tickets filed. Click raise ticket to submit a request.</span>
              )}
            </div>
          </div>

          {/* New Ticket Form sidebar panel */}
          {showTicketForm && (
            <div className="lg:col-span-4 p-5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4 shadow-lg">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Raise Ticket</h3>
              <form onSubmit={handleTicketSubmit} className="flex flex-col gap-3.5 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Subject</label>
                  <input
                    type="text"
                    required
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    placeholder="Refund request for order..."
                    className="w-full bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2 text-slate-805 dark:text-slate-100 outline-none"
                  >
                    <option value="general">General Support</option>
                    <option value="refund">Refund Claim</option>
                    <option value="order">Order Issues</option>
                    <option value="coins">SmartCoins Balance</option>
                  </select>
                </div>
                {ticketCategory === 'refund' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Order ID Reference</label>
                    <input
                      type="text"
                      required
                      value={ticketOrderId}
                      onChange={(e) => setTicketOrderId(e.target.value)}
                      placeholder="e.g. 6615b..."
                      className="w-full bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    placeholder="Provide details about your query..."
                    className="w-full bg-slate-50 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl mt-1 cursor-pointer"
                >
                  File Complaint
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. SOCKET CHAT LOGS VIEW */}
      {/* ==================================================== */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-[500px]">
          {/* Threads list sidebar */}
          <div className="md:col-span-4 p-4 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4 overflow-y-auto">
            <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-200">Arcade Channels</h3>
            <div className="space-y-2.5">
              {chats.map(ch => (
                <button
                  key={ch._id}
                  onClick={() => openChatSession(ch)}
                  className={`w-full p-3.5 rounded-xl border text-left flex flex-col gap-1 cursor-pointer transition-colors ${
                    activeChat?._id === ch._id
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-slate-200/50 dark:border-darkBorder/50 hover:bg-slate-50 dark:hover:bg-darkBorder/20'
                  }`}
                >
                  <strong className="block text-xs text-slate-800 dark:text-slate-150">
                    {user.role === 'seller' ? ch.customerName : ch.sellerName}
                  </strong>
                  <span className="text-[10px] text-slate-400 block truncate">{ch.lastMessage}</span>
                </button>
              ))}
              {chats.length === 0 && (
                <span className="text-[10px] text-slate-400 italic block py-4 text-center">No active chats initialized. Start a chat from a product page.</span>
              )}
            </div>
          </div>

          {/* Active Chat Thread logs */}
          <div className="md:col-span-8 p-4 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col justify-between h-full">
            {activeChat ? (
              <div className="flex flex-col h-full justify-between">
                <div className="border-b border-slate-100 dark:border-darkBorder/40 pb-3 flex justify-between items-center mb-3">
                  <strong className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {user.role === 'seller' ? activeChat.customerName : activeChat.sellerName}
                  </strong>
                </div>

                {/* Messages log view */}
                <div className="flex-grow overflow-y-auto space-y-3 pr-1 py-1 text-xs">
                  {messages.map((msg, idx) => {
                    const isSenderMe = msg.senderId === user.id;
                    return (
                      <div 
                        key={idx}
                        className={`flex flex-col max-w-[70%] rounded-2xl p-3 ${
                          isSenderMe 
                            ? 'ml-auto bg-emerald-500 text-white rounded-br-none' 
                            : 'bg-slate-100 dark:bg-darkBorder text-slate-800 dark:text-slate-100 rounded-bl-none'
                        }`}
                      >
                        <span className="text-[9px] opacity-75 font-bold uppercase tracking-wider block mb-1">
                          {msg.senderName}
                        </span>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Send message form */}
                <form onSubmit={handleSendChat} className="flex gap-2 border-t border-slate-105 dark:border-darkBorder/40 pt-3.5 mt-3.5">
                  <input
                    type="text"
                    required
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type message here..."
                    className="flex-grow bg-slate-50 dark:bg-darkBorder/45 border border-transparent focus:border-emerald-500/40 rounded-xl px-3 py-2 text-xs outline-none text-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                <MessageSquare size={28} className="text-slate-400" />
                <span className="text-xs text-slate-400">Select a chat session thread on the left to start real-time messages.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. FAQ SECTION VIEW */}
      {/* ==================================================== */}
      {activeTab === 'faq' && (
        <div className="max-w-2xl mx-auto p-5 rounded-2xl border border-slate-205 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4 shadow">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <FileQuestion size={16} className="text-emerald-500 animate-pulse" />
            <span>Faqs & Help Documentation</span>
          </h3>

          <div className="space-y-4 pt-2">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkBorder/25 border border-slate-100 dark:border-darkBorder/40">
                <strong className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">{faq.q}</strong>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportCenter;
