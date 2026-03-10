'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Letter } from '@/types/game';

interface BlankTileModalProps {
  isOpen: boolean;
  onSelect: (letter: Letter) => void;
  onClose: () => void;
}

const ROWS = ['ABCDEFG', 'HIJKLMN', 'OPQRSTU', 'VWXYZ'];

/** Modal dialog for choosing the letter for a blank tile */
export default function BlankTileModal({ isOpen, onSelect, onClose }: BlankTileModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="bg-slate-900 ring-1 ring-slate-600 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4"
          >
            <h2 className="text-lg font-bold text-white mb-1">Blank Tile</h2>
            <p className="text-sm text-slate-400 mb-4">Choose a letter for your blank tile:</p>

            <div className="flex flex-col gap-2">
              {ROWS.map(row => (
                <div key={row} className="flex gap-2 justify-center">
                  {row.split('').map(letter => (
                    <motion.button
                      key={letter}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onSelect(letter as Letter)}
                      className="w-10 h-10 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-base rounded-md shadow-md transition-colors"
                    >
                      {letter}
                    </motion.button>
                  ))}
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
