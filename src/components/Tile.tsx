'use client';

import { motion } from 'framer-motion';
import type { Tile as TileType } from '@/types/game';

interface TileProps {
  tile: TileType;
  selected?: boolean;
  dim?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  draggable?: boolean;
}

/** Visual representation of a single Scrabble letter tile */
export default function Tile({ tile, selected, dim, size = 'md', onClick }: TileProps) {
  const isBlank = tile.letter === '*' || tile.isBlank;
  const displayLetter = isBlank && tile.letter !== '*' ? tile.letter : (isBlank ? '?' : tile.letter);

  const sizeClasses = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const valueSize = {
    sm: 'text-[7px]',
    md: 'text-[9px]',
    lg: 'text-[10px]',
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={onClick ? { scale: 1.08, y: -2 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      animate={{
        scale: selected ? 1.1 : 1,
        y: selected ? -4 : 0,
        opacity: dim ? 0.4 : 1,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={[
        sizeClasses[size],
        'relative flex items-center justify-center rounded-md font-bold select-none',
        'shadow-md transition-shadow',
        isBlank
          ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700'
          : 'bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900',
        selected
          ? 'ring-2 ring-cyan-400 shadow-cyan-400/50 shadow-lg'
          : 'shadow-amber-900/40',
        onClick ? 'cursor-pointer hover:shadow-lg' : 'cursor-default',
      ].join(' ')}
    >
      {/* Letter */}
      <span className="leading-none">{displayLetter}</span>
      {/* Point value */}
      <span
        className={[
          valueSize[size],
          'absolute bottom-0.5 right-1 font-semibold leading-none',
          isBlank ? 'text-slate-600' : 'text-amber-700',
        ].join(' ')}
      >
        {tile.value}
      </span>
    </motion.button>
  );
}
