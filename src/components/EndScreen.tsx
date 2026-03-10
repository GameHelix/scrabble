'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Player } from '@/types/game';
import confetti from 'canvas-confetti';

interface EndScreenProps {
  players: Player[];
  winner: string | null;
  humanName: string;
  onRestart: () => void;
}

/** Animated game-over overlay */
export default function EndScreen({ players, winner, humanName, onRestart }: EndScreenProps) {
  const isHumanWinner = winner === humanName;
  const isDraw = players.length >= 2 && players[0].score === players[1].score;

  // Confetti for a win
  useEffect(() => {
    if (!isHumanWinner || isDraw) return;
    const end = Date.now() + 3000;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [isHumanWinner, isDraw]);

  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 250, damping: 20, delay: 0.1 }}
        className="bg-slate-900 ring-1 ring-slate-600/50 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
      >
        {/* Result emoji */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
          className="text-6xl mb-4"
        >
          {isDraw ? '🤝' : isHumanWinner ? '🏆' : '😔'}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-2xl font-black text-white mb-1"
        >
          {isDraw ? "It's a Draw!" : isHumanWinner ? 'You Win!' : `${winner} Wins!`}
        </motion.h2>

        <p className="text-slate-400 text-sm mb-6">Game over — final scores</p>

        {/* Score list */}
        <div className="space-y-2 mb-6">
          {sorted.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className={[
                'flex items-center justify-between px-4 py-2.5 rounded-xl',
                i === 0 ? 'bg-amber-500/20 ring-1 ring-amber-500/40' : 'bg-slate-800/50',
              ].join(' ')}
            >
              <div className="flex items-center gap-2">
                {i === 0 && <span className="text-amber-400">👑</span>}
                <span className={`font-semibold ${i === 0 ? 'text-amber-300' : 'text-slate-300'}`}>
                  {p.name}
                </span>
                {p.isAI && <span className="text-[10px] text-purple-400 bg-purple-500/20 px-1.5 rounded-full">AI</span>}
              </div>
              <span className={`text-xl font-black tabular-nums ${i === 0 ? 'text-amber-300' : 'text-slate-400'}`}>
                {p.score}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Restart */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onRestart}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/40"
        >
          Play Again
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
