'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Board as BoardType, PlacedTile, Tile as TileType } from '@/types/game';
import { premiumBg, premiumLabel } from '@/utils/board';
import Tile from './Tile';

interface BoardProps {
  board: BoardType;
  pendingTiles: PlacedTile[];
  selectedTile: TileType | null;
  onCellClick: (row: number, col: number) => void;
}

/** 15×15 Scrabble board rendered as a CSS grid */
export default function Board({ board, pendingTiles, selectedTile, onCellClick }: BoardProps) {
  const pendingMap = new Map(pendingTiles.map(p => [`${p.row},${p.col}`, p.tile]));

  return (
    <div className="relative w-full aspect-square max-w-[min(90vw,520px)] mx-auto">
      {/* Board background */}
      <div className="absolute inset-0 rounded-xl bg-emerald-950 ring-2 ring-emerald-600/40 shadow-2xl shadow-emerald-900/60" />

      {/* Grid */}
      <div
        className="relative grid gap-[1px] p-1.5 w-full h-full"
        style={{ gridTemplateColumns: 'repeat(15, 1fr)' }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const pending = pendingMap.get(`${r},${c}`);
            const occupiedTile = pending ?? cell.tile;
            const isPending = !!pending;
            const isHighlight = !!selectedTile && !occupiedTile;
            const isCommitted = !isPending && !!cell.tile && cell.isNew;

            return (
              <motion.div
                key={`${r}-${c}`}
                onClick={() => onCellClick(r, c)}
                className={[
                  'relative flex items-center justify-center rounded-sm cursor-pointer',
                  'transition-colors duration-150 overflow-hidden',
                  occupiedTile ? '' : premiumBg(cell.premium),
                  isHighlight ? 'ring-1 ring-cyan-400/60 brightness-125' : '',
                  !occupiedTile && !cell.premium ? 'hover:bg-emerald-700/50' : '',
                ].join(' ')}
                whileHover={!occupiedTile ? { scale: 1.05 } : {}}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {/* Premium label (only when no tile) */}
                {!occupiedTile && cell.premium && (
                  <span className={[
                    'text-white font-bold leading-none text-center select-none pointer-events-none',
                    cell.premium === 'CENTER' ? 'text-[10px]' : 'text-[6px]',
                  ].join(' ')}>
                    {premiumLabel(cell.premium)}
                  </span>
                )}

                {/* Tile */}
                <AnimatePresence>
                  {occupiedTile && (
                    <motion.div
                      key={occupiedTile.id}
                      initial={{ scale: 0.4, opacity: 0, y: -8 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Tile
                        tile={occupiedTile}
                        size="sm"
                        dim={isPending && !selectedTile}
                      />
                      {/* Glow for newly committed tiles */}
                      {isCommitted && (
                        <motion.div
                          className="absolute inset-0 rounded-sm bg-cyan-400/20 pointer-events-none"
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 0 }}
                          transition={{ duration: 1.5 }}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Column labels (A-O) */}
      <div
        className="absolute -top-5 left-1.5 right-1.5 grid text-[8px] text-emerald-400/60 font-mono"
        style={{ gridTemplateColumns: 'repeat(15,1fr)' }}
      >
        {'ABCDEFGHIJKLMNO'.split('').map(l => (
          <span key={l} className="text-center">{l}</span>
        ))}
      </div>
      {/* Row labels (1-15) */}
      <div className="absolute top-1.5 -left-4 bottom-1.5 flex flex-col justify-around text-[8px] text-emerald-400/60 font-mono">
        {Array.from({ length: 15 }, (_, i) => (
          <span key={i} className="text-right pr-0.5">{i + 1}</span>
        ))}
      </div>
    </div>
  );
}
