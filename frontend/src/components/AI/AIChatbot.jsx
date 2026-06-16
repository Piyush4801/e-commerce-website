import React, { useState, useRef, useEffect } from 'react';
import axios from '../../services/api.js';
import { useCart } from '../../context/CartContext';
import { MessageSquare, Send, Sparkles, X, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I'm SmartCart AI, your personal shopping assistant. Ask me anything, like:\n• 'Suggest running shoes under ₹3,000'\n• 'I need a coding laptop under ₹60,000'\n• 'Show me sustainable beauty products'",
      products: []
    }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const { addToCart } = useCart();

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    if (!textToSend) setInput('');

    // Append user message
    setMessages(prev => [...prev, { sender: 'user', text: query, products: [] }]);
    setLoading(true);

    try {
      const res = await axios.post('/api/products/ai/conversational', { text: query });
      if (res.data.success) {
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: res.data.explanation,
          products: res.data.products || []
        }]);
      } else {
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: "I had some trouble scanning the catalog. Could you try rephrasing your search?",
          products: []
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "I encountered an error connecting to our recommendation server. Please try again.",
        products: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: "Laptop under 60k", query: "I need a coding laptop under ₹60,000" },
    { label: "Eco Sneakers", query: "Show me green sustainable running sneakers" },
    { label: "Fairtrade Coffee", query: "Suggest single origin fairtrade coffee beans" }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Bot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-300"
        aria-label="Toggle AI Chat"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6 animate-pulse" />}
      </button>

      {/* Chat Box */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200/50 dark:border-darkBorder bg-white/95 dark:bg-darkCard/95 glass animate-float">
          {/* Header */}
          <div className="bg-emerald-500 dark:bg-emerald-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-300 animate-spin" style={{ animationDuration: '3s' }} />
              <div>
                <h3 className="font-bold text-sm leading-tight">SmartCart AI Assistant</h3>
                <span className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-ping"></span>
                  Online | Recommendation Engine
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-85">
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Text Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-500 text-white rounded-tr-none'
                      : 'bg-gray-100 dark:bg-darkBorder/60 text-slate-800 dark:text-slate-100 rounded-tl-none border border-gray-200/30 dark:border-darkBorder/40'
                  } whitespace-pre-line`}
                >
                  {msg.text}
                </div>

                {/* Attached Products Cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="w-full mt-2 grid grid-cols-1 gap-2 pl-2 border-l-2 border-emerald-500/40">
                    {msg.products.map(prod => (
                      <div 
                        key={prod._id}
                        className="p-2 rounded-lg bg-gray-50 dark:bg-darkBorder/30 border border-gray-200/30 dark:border-darkBorder/30 flex gap-2 text-[10px] items-center hover:bg-gray-100 dark:hover:bg-darkBorder/50 transition-colors"
                      >
                        <img 
                          src={prod.images?.[0] || prod.image || prod.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'} 
                          alt={prod.name} 
                          className="w-10 h-10 object-cover rounded-md bg-gray-100" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/product/${prod._id}`} 
                            onClick={() => setIsOpen(false)} 
                            className="font-bold text-slate-700 dark:text-slate-200 block truncate hover:underline"
                          >
                            {prod.name}
                          </Link>
                          <span className="font-extrabold text-slate-900 dark:text-emerald-400">
                            ₹{prod.price.toLocaleString()}
                          </span>
                          <span className="text-gray-400 block">{prod.rating} ⭐ • Eco: {prod.sustainability?.ecoScore}</span>
                        </div>
                        <button
                          onClick={() => addToCart(prod, 1)}
                          className="p-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shrink-0"
                          title="Quick add to cart"
                        >
                          <ShoppingCart size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
                <span>Scanning catalog...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-4 py-2 border-t border-gray-100 dark:border-darkBorder/40 flex gap-1.5 overflow-x-auto select-none no-scrollbar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.query)}
                className="shrink-0 text-[10px] px-2 py-1 rounded-full border border-gray-200 dark:border-darkBorder hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-500 dark:hover:text-emerald-500 bg-gray-50/50 dark:bg-darkBorder/20 transition-all text-gray-500 dark:text-gray-400"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Footer Input */}
          <div className="p-3 border-t border-gray-100 dark:border-darkBorder/60 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for recommendations..."
              className="flex-1 bg-gray-100 dark:bg-darkBorder/40 border border-transparent focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl px-3 py-2 text-xs outline-none transition-colors"
            />
            <button
              onClick={() => handleSend()}
              className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10 active:scale-95 transition-all"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;
