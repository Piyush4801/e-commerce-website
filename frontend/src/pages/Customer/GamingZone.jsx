import React, { useEffect, useState } from 'react';
import axios from '../../services/api.js';
import { useCoins } from '../../context/CoinsContext';
import { useToast } from '../../context/ToastContext';
import { Trophy, Award, Gamepad2, Hourglass, Flame, Play, RefreshCw, Star } from 'lucide-react';

export const GamingZone = () => {
  const { balance, fetchWallet } = useCoins();
  const { addToast } = useToast();

  const [gameStats, setGameStats] = useState({ totalCoinsEarned: 0, gamesPlayed: 0, dailyStreak: 3 });
  const [leaderboard, setLeaderboard] = useState([]);
  
  // Games state
  const [activeGame, setActiveGame] = useState(null); // 'spin_wheel', 'memory_match'
  
  // Game 1: Spin Wheel State
  const [spinning, setSpinning] = useState(false);
  const [spinCooldown, setSpinCooldown] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [spinAngle, setSpinAngle] = useState(0);

  // Game 2: Memory Match State
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(45);
  const [memoryPlaying, setMemoryPlaying] = useState(false);
  const [memoryCompleted, setMemoryCompleted] = useState(false);

  const fetchGameDashboard = async () => {
    try {
      const res = await axios.get('/api/games/dashboard');
      if (res.data.success) {
        setGameStats(res.data.stats || { totalCoinsEarned: 0, gamesPlayed: 0, dailyStreak: 3 });
        setLeaderboard(res.data.leaderboard || []);
      }
    } catch (e) {
      console.error(e.message);
    }
  };

  useEffect(() => {
    fetchGameDashboard();
  }, []);

  // ==========================================
  // LUCKY SPIN WHEEL HANDLERS
  // ==========================================
  const prizes = [5, 10, 20, 50, 100];
  const sliceAngle = 360 / prizes.length;

  const triggerLuckySpin = async () => {
    if (spinning || spinCooldown) return;
    setSpinning(true);
    setSpinResult(null);

    try {
      const res = await axios.post('/api/games/spin-wheel');
      if (res.data.success) {
        const earnedCoins = res.data.earned;
        const prizeIndex = prizes.indexOf(earnedCoins);
        
        // Calculate stop angle (force multiple rotations + align index center)
        const stopAngle = 1800 + (360 - (prizeIndex * sliceAngle + sliceAngle / 2));
        setSpinAngle(stopAngle);

        setTimeout(() => {
          setSpinning(false);
          setSpinResult(earnedCoins);
          addToast(`🎉 Lucky Spin awarded ${earnedCoins} SmartCoins!`, 'success');
          fetchWallet();
          fetchGameDashboard();
        }, 3000);
      }
    } catch (err) {
      setSpinning(false);
      setSpinCooldown(true);
      addToast(err.response?.data?.message || 'Cooldown active for today\'s spin.', 'info');
    }
  };

  // ==========================================
  // MEMORY MATCH HANDLERS
  // ==========================================
  const itemIcons = ['🎮', '🎧', '📱', '⌚', '📷', '💻', '👜', '👟'];

  const initMemoryGame = () => {
    const doubleIcons = [...itemIcons, ...itemIcons];
    const shuffled = doubleIcons
      .map((icon, id) => ({ id, icon, flipped: false }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setSelectedCards([]);
    setMatchedCards([]);
    setScore(0);
    setTimeRemaining(45);
    setMemoryPlaying(true);
    setMemoryCompleted(false);
  };

  useEffect(() => {
    let timer;
    if (memoryPlaying && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && memoryPlaying) {
      endMemoryGame();
    }
    return () => clearInterval(timer);
  }, [memoryPlaying, timeRemaining]);

  const handleCardClick = (idx) => {
    if (selectedCards.length >= 2 || selectedCards.includes(idx) || matchedCards.includes(idx)) return;

    const newSelected = [...selectedCards, idx];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (cards[first].icon === cards[second].icon) {
        setMatchedCards(prev => [...prev, first, second]);
        setScore(prev => prev + 30);
        setSelectedCards([]);

        // Match check success
        if (matchedCards.length + 2 === cards.length) {
          endMemoryGame(true);
        }
      } else {
        setTimeout(() => {
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const endMemoryGame = async (win = false) => {
    setMemoryPlaying(false);
    setMemoryCompleted(true);
    
    const finalScore = score + (win ? timeRemaining * 5 : 0);
    setScore(finalScore);

    try {
      const res = await axios.post('/api/games/memory-match', { score: finalScore });
      if (res.data.success) {
        addToast(`🏆 Memory Match finished! Earned ${res.data.earned} SmartCoins.`, 'success');
        fetchWallet();
        fetchGameDashboard();
      }
    } catch (e) {
      console.error(e.message);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-grid-pattern relative">
      <div className="absolute top-20 right-1/4 w-96 h-96 aura-glow-primary pointer-events-none rounded-full"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Game Dashboard & Leaderboards */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col gap-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Gamepad2 size={16} className="text-emerald-500" />
              <span>Gamer Center</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkBorder/40 border border-slate-200/40 dark:border-darkBorder/25">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Earned Coins</span>
                <strong className="text-lg text-emerald-500 font-extrabold block mt-1">{gameStats.totalCoinsEarned}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkBorder/40 border border-slate-200/40 dark:border-darkBorder/25">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Streak Days</span>
                <strong className="text-lg text-amber-500 font-extrabold flex items-center justify-center gap-1 mt-1">
                  <Flame size={16} />
                  <span>{gameStats.dailyStreak}</span>
                </strong>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-darkBorder/40 pt-4 flex flex-col gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top Arcade Leaderboard</span>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {leaderboard.map((item, idx) => (
                  <div key={item.userId} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 dark:bg-darkBorder/20">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-400">#{idx + 1}</span>
                      <strong className="font-bold text-slate-700 dark:text-slate-200">{item.userName}</strong>
                    </div>
                    <span className="font-extrabold text-emerald-500">{item.totalCoinsEarned} Coins</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Game Canvas Viewports */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setActiveGame('spin_wheel')}
              className={`flex-1 py-3 rounded-2xl font-extrabold text-xs transition-all cursor-pointer text-center ${
                activeGame === 'spin_wheel'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder text-slate-500'
              }`}
            >
              🎡 Lucky Spin Wheel
            </button>
            <button
              onClick={() => setActiveGame('memory_match')}
              className={`flex-1 py-3 rounded-2xl font-extrabold text-xs transition-all cursor-pointer text-center ${
                activeGame === 'memory_match'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder text-slate-500'
              }`}
            >
              🧠 Memory Card Match
            </button>
          </div>

          {/* SPIN WHEEL INTERACTION CONTAINER */}
          {activeGame === 'spin_wheel' && (
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col items-center gap-6 text-center shadow-lg">
              <div>
                <h2 className="font-black text-lg text-slate-800 dark:text-slate-100">🎡 Lucky Spin Wheel</h2>
                <p className="text-[10px] text-slate-400 mt-1">Spin daily to unlock coin payouts directly to your SmartCoins wallet.</p>
              </div>

              {/* Graphical Spinner canvas mockup using CSS rotate transitions */}
              <div className="relative w-64 h-64 border-4 border-slate-800 dark:border-white/20 rounded-full flex items-center justify-center overflow-hidden shadow-2xl bg-slate-900">
                {/* Pointer indicator */}
                <div className="absolute top-0 w-4 h-6 bg-red-500 z-20 polygon-pointer shadow-md" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>

                {/* Rotating wheel segments */}
                <div 
                  className="w-full h-full transition-transform duration-[3000ms] cubic-bezier(0.2, 0.8, 0.2, 1) relative"
                  style={{ 
                    transform: `rotate(${spinAngle}deg)`,
                    backgroundImage: 'conic-gradient(#10b981 0% 20%, #3b82f6 20% 40%, #f59e0b 40% 60%, #ef4444 60% 80%, #8b5cf6 80% 100%)' 
                  }}
                >
                  {prizes.map((prize, idx) => (
                    <div 
                      key={idx} 
                      style={{ transform: `rotate(${idx * sliceAngle + sliceAngle / 2}deg)` }}
                      className="absolute top-4 left-[50%] -translate-x-1/2 origin-[50%_112px] text-white font-black text-sm drop-shadow-md"
                    >
                      {prize}
                    </div>
                  ))}
                </div>

                {/* Center Spin Button indicator */}
                <button
                  onClick={triggerLuckySpin}
                  disabled={spinning || spinCooldown}
                  className="absolute w-16 h-16 rounded-full bg-white dark:bg-darkCard text-slate-800 dark:text-slate-100 font-extrabold text-xs shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 z-20 border border-slate-200/50 dark:border-darkBorder"
                >
                  {spinning ? '...' : 'SPIN'}
                </button>
              </div>

              {spinResult && (
                <div className="text-xs font-bold text-emerald-500 animate-bounce">
                  🎉 Congratulations! You received {spinResult} SmartCoins!
                </div>
              )}

              {spinCooldown && (
                <div className="text-[10px] text-amber-500 flex items-center gap-1 font-bold">
                  <Hourglass size={12} className="animate-spin" />
                  <span>24-Hour spin cooldown active. Come back tomorrow!</span>
                </div>
              )}
            </div>
          )}

          {/* MEMORY CARD MATCH CONTAINER */}
          {activeGame === 'memory_match' && (
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-darkBorder bg-white dark:bg-darkCard glass flex flex-col items-center gap-5 text-center shadow-lg">
              <div>
                <h2 className="font-black text-lg text-slate-800 dark:text-slate-100">🧠 Memory Match</h2>
                <p className="text-[10px] text-slate-400 mt-1">Match card pairs before the timer expires. Bracket score yields more coins.</p>
              </div>

              {!memoryPlaying && !memoryCompleted ? (
                <button
                  onClick={initMemoryGame}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow cursor-pointer transition-all active:scale-95"
                >
                  <Play size={13} />
                  <span>Start Arcade Match</span>
                </button>
              ) : (
                <div className="w-full flex flex-col gap-4">
                  {/* Game Stats Info bar */}
                  <div className="flex justify-between items-center text-xs font-bold border-b border-slate-100 dark:border-darkBorder/40 pb-2.5">
                    <span className="text-slate-500">⏱️ Time Remaining: <strong className={timeRemaining <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-200'}>{timeRemaining}s</strong></span>
                    <span className="text-emerald-500">🏆 Score: {score}</span>
                  </div>

                  {/* Card Matrix Grid */}
                  <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
                    {cards.map((card, idx) => {
                      const isSelected = selectedCards.includes(idx);
                      const isMatched = matchedCards.includes(idx);
                      const showIcon = isSelected || isMatched;

                      return (
                        <button
                          key={card.id}
                          onClick={() => handleCardClick(idx)}
                          className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all duration-300 transform cursor-pointer border ${
                            showIcon 
                              ? 'bg-white dark:bg-darkBorder border-emerald-500 text-slate-800 rotate-y-180 scale-105 shadow' 
                              : 'bg-slate-850 dark:bg-darkCard border-slate-200 dark:border-darkBorder hover:border-emerald-500 shadow-sm'
                          }`}
                        >
                          {showIcon ? card.icon : '❓'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {memoryCompleted && (
                <div className="text-xs flex flex-col gap-2.5 items-center mt-3">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Arcade Round Complete! Final Score: <strong className="text-emerald-500">{score}</strong></span>
                  <button
                    onClick={initMemoryGame}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1 shadow cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    <span>Play Again</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* If no game active */}
          {!activeGame && (
            <div className="p-10 text-center rounded-3xl border border-dashed border-slate-200 dark:border-darkBorder bg-white/40 dark:bg-darkCard/40 flex flex-col items-center gap-3">
              <Gamepad2 size={36} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-500">Select a game above to start earning loyalty coins!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamingZone;
