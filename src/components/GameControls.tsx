'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Tile as TileType } from '@/types/game';

interface GameControlsProps {
  canPlay: boolean;
  canRecall: boolean;
  canSwap: boolean;
  isPaused: boolean;
  rackTiles: TileType[];
  soundEnabled: boolean;
  errorMessage: string | null;
  onPlay: () => void;
  onRecall: () => void;
  onPass: () => void;
  onSwap: (ids: string[]) => void;
  onShuffle: () => void;
  onPause: () => void;
  onSoundToggle: () => void;
}

/** Action bar below the tile rack */
export default function GameControls({
  canPlay, canRecall, canSwap, isPaused, rackTiles,
  soundEnabled, errorMessage,
  onPlay, onRecall, onPass, onSwap, onShuffle, onPause, onSoundToggle,
}: GameControlsProps) {
  const [swapMode, setSwapMode] = useState(false);
  const [selectedForSwap, setSelectedForSwap] = useState<Set<string>>(new Set());

  function toggleSwapTile(id: string) {
    setSelectedForSwap(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmSwap() {
    if (selectedForSwap.size === 0) return;
    onSwap([...selectedForSwap]);
    setSwapMode(false);
    setSelectedForSwap(new Set());
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Error banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 py-1.5 bg-red-500/20 text-red-300 text-xs rounded-lg ring-1 ring-red-500/30 text-center"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swap mode UI */}
      <AnimatePresence>
        {swapMode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-wrap gap-2 items-center justify-center p-2 bg-slate-800/60 rounded-xl ring-1 ring-slate-600/30"
          >
            <p className="text-xs text-slate-300 w-full text-center">Select tiles to swap:</p>
            {rackTiles.map(tile => (
              <button
                key={tile.id}
                onClick={() => toggleSwapTile(tile.id)}
                className={[
                  'px-3 py-1 rounded-lg text-sm font-bold transition-all',
                  selectedForSwap.has(tile.id)
                    ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                    : 'bg-slate-700 text-slate-200 hover:bg-slate-600',
                ].join(' ')}
              >
                {tile.letter === '*' ? '?' : tile.letter}
              </button>
            ))}
            <div className="flex gap-2 w-full justify-center mt-1">
              <button
                onClick={confirmSwap}
                disabled={selectedForSwap.size === 0}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs rounded-lg font-semibold transition-all"
              >
                Confirm Swap
              </button>
              <button
                onClick={() => { setSwapMode(false); setSelectedForSwap(new Set()); }}
                className="px-4 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main action buttons */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {/* Play */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onPlay}
          disabled={!canPlay}
          className="flex-1 min-w-[80px] px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-900/40"
        >
          Play ↵
        </motion.button>

        {/* Recall */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onRecall}
          disabled={!canRecall}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 text-sm rounded-xl transition-all"
        >
          Recall
        </motion.button>

        {/* Pass */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onPass}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-xl transition-all"
        >
          Pass
        </motion.button>

        {/* Swap */}
        {canSwap && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setSwapMode(v => !v)}
            className="px-3 py-2 bg-blue-800 hover:bg-blue-700 text-blue-200 text-sm rounded-xl transition-all"
          >
            Swap
          </motion.button>
        )}

        {/* Shuffle */}
        <motion.button
          whileHover={{ scale: 1.04, rotate: 90 }}
          whileTap={{ scale: 0.96 }}
          onClick={onShuffle}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-xl transition-all"
          title="Shuffle rack"
        >
          🔀
        </motion.button>

        {/* Pause */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onPause}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-xl transition-all"
          title={isPaused ? 'Resume' : 'Pause'}
        >
          {isPaused ? '▶' : '⏸'}
        </motion.button>

        {/* Sound */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onSoundToggle}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-xl transition-all"
          title={soundEnabled ? 'Mute' : 'Unmute'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </motion.button>
      </div>
    </div>
  );
}
