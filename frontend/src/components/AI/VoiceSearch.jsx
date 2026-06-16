import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, X } from 'lucide-react';

export const VoiceSearch = ({ onTranscriptResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check Speech Recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN'; // Set to Indian English or standard English

      rec.onstart = () => {
        setIsListening(true);
        setTranscript('Listening for commands...');
      };

      rec.onerror = (e) => {
        console.error('Speech error:', e.error);
        setIsListening(false);
        setTranscript('Speech recognition error. Try again.');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleVoiceCommands(text);
      };

      setRecognition(rec);
    }
  }, []);

  const startListening = () => {
    if (!supported || !recognition) return;
    try {
      recognition.start();
    } catch (e) {
      recognition.abort();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  const handleVoiceCommands = (text) => {
    const command = text.toLowerCase().trim();
    
    // Command matching
    if (command.includes('go to cart') || command.includes('show cart')) {
      navigate('/cart');
    } else if (command.includes('go to wishlist') || command.includes('show wishlist')) {
      navigate('/wishlist');
    } else if (command.includes('checkout') || command.includes('buy now')) {
      navigate('/checkout');
    } else if (command.includes('go home') || command.includes('show products')) {
      navigate('/');
    } else {
      // Normal search
      if (onTranscriptResult) {
        onTranscriptResult(text);
      } else {
        navigate(`/products?search=${encodeURIComponent(text)}`);
      }
    }
  };

  if (!supported) return null;

  return (
    <div>
      {/* Mic Trigger */}
      <button
        onClick={startListening}
        className="p-2.5 rounded-xl border border-gray-200 dark:border-darkBorder hover:border-emerald-500 dark:hover:border-emerald-600 bg-white dark:bg-darkCard text-gray-500 hover:text-emerald-500 dark:text-gray-400 hover:scale-105 active:scale-95 transition-all"
        title="Voice Search & Commands"
      >
        <Mic size={16} />
      </button>

      {/* Listening Overlay */}
      {isListening && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder flex flex-col items-center gap-6 glass shadow-2xl relative">
            <button
              onClick={stopListening}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">Voice Assistant</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Speak clearly into your microphone</p>
            </div>

            {/* Pulsing Mic Wave */}
            <div className="relative flex items-center justify-center my-4">
              <div className="absolute w-28 h-28 rounded-full bg-emerald-500/20 dark:bg-emerald-500/10 animate-ping"></div>
              <div className="absolute w-20 h-20 rounded-full bg-emerald-500/35 dark:bg-emerald-500/20 animate-pulse-slow"></div>
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center relative shadow-lg">
                <Volume2 className="h-6 w-6 animate-bounce" />
              </div>
            </div>

            {/* Live Transcript text */}
            <div className="w-full bg-gray-50 dark:bg-darkBorder/40 border border-gray-200 dark:border-darkBorder/30 rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{transcript}"</p>
            </div>

            {/* Help guidelines */}
            <div className="text-[10px] text-gray-400 border-t border-gray-200 dark:border-darkBorder/30 w-full pt-3 text-center leading-normal">
              Try: "Show gaming laptops", "Go to cart", "Find running shoes"
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceSearch;
