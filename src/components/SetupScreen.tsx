'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Difficulty } from '@/types/game';

interface SetupScreenProps {
  onStart: (playerName: string, difficulty: Difficulty) => void;
}

const DIFFICULTIES: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: 'easy',   label: 'Easy',   desc: 'Random valid moves',         color: 'bg-emerald-600 hover:bg-emerald-500' },
  { value: 'medium', label: 'Medium', desc: 'Selects better moves',       color: 'bg-amber-600   hover:bg-amber-500'   },
  { value: 'hard',   label: 'Hard',   desc: 'Always plays highest score', color: 'bg-red-600     hover:bg-red-500'     },
];

/** Game setup / welcome screen */
export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-900/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-900/30 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex gap-1 mb-4"
          >
            {['S','C','R','A','B','B','L','E'].map((l, i) => (
              <motion.span
                key={i}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 300 }}
                className="w-9 h-9 bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900 font-black text-base rounded-md shadow-lg flex items-center justify-center"
              >
                {l}
              </motion.span>
            ))}
          </motion.div>
          <p className="text-slate-400 text-sm">Classic word game vs AI opponent</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-md ring-1 ring-slate-700/50 rounded-2xl p-6 shadow-2xl space-y-5">
          {/* Name input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name…"
              maxLength={20}
              className="w-full px-4 py-2.5 bg-slate-800 text-white placeholder-slate-500 rounded-xl ring-1 ring-slate-600 focus:ring-cyan-500 focus:outline-none transition-all"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map(d => (
                <motion.button
                  key={d.value}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setDifficulty(d.value)}
                  className={[
                    'py-2.5 rounded-xl font-semibold text-sm text-white transition-all ring-2',
                    difficulty === d.value
                      ? `${d.color} ring-white/40 shadow-lg`
                      : 'bg-slate-700 hover:bg-slate-600 ring-transparent',
                  ].join(' ')}
                >
                  {d.label}
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1.5 text-center">
              {DIFFICULTIES.find(d => d.value === difficulty)?.desc}
            </p>
          </div>

          {/* How to play */}
          <details className="text-xs text-slate-400">
            <summary className="cursor-pointer font-medium text-slate-300 hover:text-white transition-colors">
              How to play
            </summary>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Click a tile in your rack, then click a board square to place it</li>
              <li>Click <strong className="text-white">Play</strong> to submit your word</li>
              <li>First move must cover the centre star ★</li>
              <li>All new tiles must be in one row or column</li>
              <li><strong className="text-white">Recall</strong> returns tiles to your rack</li>
              <li>Using all 7 tiles scores a <strong className="text-amber-300">50-point bonus (Bingo!)</strong></li>
            </ul>
          </details>

          {/* Start button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onStart(name.trim() || 'You', difficulty)}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base rounded-xl shadow-xl shadow-emerald-900/50 transition-all"
          >
            Start Game →
          </motion.button>
        </div>

        {/* Controls hint */}
        <p className="text-center text-[11px] text-slate-600 mt-4">
          Keyboard: <kbd className="bg-slate-800 px-1 rounded">Enter</kbd> Play &nbsp;|&nbsp;
          <kbd className="bg-slate-800 px-1 rounded">Esc</kbd> Recall &nbsp;|&nbsp;
          <kbd className="bg-slate-800 px-1 rounded">Space</kbd> Shuffle
        </p>
      </motion.div>
    </div>
  );
}
