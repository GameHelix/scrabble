'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface PauseOverlayProps {
  isPaused: boolean;
  onResume: () => void;
}

export default function PauseOverlay({ isPaused, onResume }: PauseOverlayProps) {
  return (
    <AnimatePresence>
      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-slate-900 ring-1 ring-slate-600 rounded-2xl px-12 py-10 text-center shadow-2xl"
          >
            <div className="text-5xl mb-4">⏸</div>
            <h2 className="text-2xl font-bold text-white mb-2">Paused</h2>
            <p className="text-slate-400 text-sm mb-6">Game is on hold</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onResume}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg"
            >
              Resume
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
