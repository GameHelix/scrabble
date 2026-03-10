'use client';

import { motion } from 'framer-motion';
import type { Player, TurnRecord } from '@/types/game';

interface ScoreBoardProps {
  players: Player[];
  currentPlayerIndex: number;
  bagCount: number;
  history: TurnRecord[];
}

/** Side-panel score display and move history */
export default function ScoreBoard({ players, currentPlayerIndex, bagCount, history }: ScoreBoardProps) {
  const recentHistory = [...history].reverse().slice(0, 8);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Players */}
      {players.map((player, i) => {
        const isActive = i === currentPlayerIndex;
        return (
          <motion.div
            key={player.name}
            animate={{ scale: isActive ? 1.02 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={[
              'rounded-xl p-3 ring-1 transition-colors',
              isActive
                ? 'bg-cyan-500/10 ring-cyan-500/50 shadow-lg shadow-cyan-500/10'
                : 'bg-slate-800/50 ring-slate-700/30',
            ].join(' ')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isActive && (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-cyan-400"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                )}
                <span className={`font-semibold text-sm ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                  {player.name}
                </span>
                {player.isAI && (
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full">
                    AI
                  </span>
                )}
              </div>
              <motion.span
                key={player.score}
                initial={{ scale: 1.4, color: '#67e8f9' }}
                animate={{ scale: 1, color: isActive ? '#e2e8f0' : '#94a3b8' }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="text-xl font-bold tabular-nums"
              >
                {player.score}
              </motion.span>
            </div>
          </motion.div>
        );
      })}

      {/* Tiles remaining */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/40 rounded-lg ring-1 ring-slate-700/20">
        <span className="text-xs text-slate-400">Tiles in bag</span>
        <span className="ml-auto font-bold text-amber-300 tabular-nums">{bagCount}</span>
      </div>

      {/* Move history */}
      <div className="bg-slate-900/60 rounded-xl ring-1 ring-slate-700/30 overflow-hidden">
        <div className="px-3 py-1.5 border-b border-slate-700/30">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">History</span>
        </div>
        <div className="divide-y divide-slate-700/20 max-h-48 overflow-y-auto">
          {recentHistory.length === 0 && (
            <p className="text-[11px] text-slate-600 px-3 py-2">No moves yet</p>
          )}
          {recentHistory.map((record, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-3 py-1.5 flex items-start justify-between gap-2"
            >
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-slate-300 truncate block">{record.playerName}</span>
                {record.type === 'play' && record.words.length > 0 && (
                  <span className="text-[10px] text-emerald-400 font-mono">{record.words.join(', ')}</span>
                )}
                {record.type === 'pass' && (
                  <span className="text-[10px] text-slate-500">Passed</span>
                )}
                {record.type === 'swap' && (
                  <span className="text-[10px] text-blue-400">Swapped tiles</span>
                )}
              </div>
              {record.type === 'play' && (
                <span className="text-[11px] font-bold text-amber-300 tabular-nums shrink-0">
                  +{record.score}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
