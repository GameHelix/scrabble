'use client';

import { motion } from 'framer-motion';
import type { Tile as TileType } from '@/types/game';
import Tile from './Tile';

interface TileRackProps {
  tiles: TileType[];
  selectedTile: TileType | null;
  onSelect: (tile: TileType) => void;
  pendingTileIds: Set<string>;
}

/** Player's tile rack — displays up to 7 tiles */
export default function TileRack({ tiles, selectedTile, onSelect, pendingTileIds }: TileRackProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-950/60 rounded-xl ring-1 ring-amber-700/40 backdrop-blur-sm">
      {tiles.map((tile, i) => {
        const isPending = pendingTileIds.has(tile.id);
        return (
          <motion.div
            key={tile.id}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Tile
              tile={tile}
              selected={selectedTile?.id === tile.id}
              dim={isPending}
              size="lg"
              onClick={() => !isPending && onSelect(tile)}
            />
          </motion.div>
        );
      })}
      {/* Empty slot placeholders */}
      {Array.from({ length: Math.max(0, 7 - tiles.length) }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="w-12 h-12 rounded-md border border-dashed border-amber-700/30 bg-amber-950/20"
        />
      ))}
    </div>
  );
}
