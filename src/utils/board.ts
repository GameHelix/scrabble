import type { Board, BoardCell, PremiumType } from '@/types/game';

export const BOARD_SIZE = 15;

/**
 * Premium square layout for the standard 15×15 Scrabble board.
 * Positions are [row, col] (0-indexed).
 */
const PREMIUM_MAP: Record<string, PremiumType> = {};

// Triple Word Score
const TWS_POSITIONS = [
  [0, 0], [0, 7], [0, 14],
  [7, 0], [7, 14],
  [14, 0], [14, 7], [14, 14],
];

// Double Word Score (includes center star)
const DWS_POSITIONS = [
  [1, 1], [2, 2], [3, 3], [4, 4],
  [10, 10], [11, 11], [12, 12], [13, 13],
  [1, 13], [2, 12], [3, 11], [4, 10],
  [10, 4], [11, 3], [12, 2], [13, 1],
];

// Triple Letter Score
const TLS_POSITIONS = [
  [1, 5], [1, 9],
  [5, 1], [5, 5], [5, 9], [5, 13],
  [9, 1], [9, 5], [9, 9], [9, 13],
  [13, 5], [13, 9],
];

// Double Letter Score
const DLS_POSITIONS = [
  [0, 3], [0, 11],
  [2, 6], [2, 8],
  [3, 0], [3, 7], [3, 14],
  [6, 2], [6, 6], [6, 8], [6, 12],
  [7, 3], [7, 11],
  [8, 2], [8, 6], [8, 8], [8, 12],
  [11, 0], [11, 7], [11, 14],
  [12, 6], [12, 8],
  [14, 3], [14, 11],
];

TWS_POSITIONS.forEach(([r, c]) => { PREMIUM_MAP[`${r},${c}`] = 'TWS'; });
DWS_POSITIONS.forEach(([r, c]) => { PREMIUM_MAP[`${r},${c}`] = 'DWS'; });
TLS_POSITIONS.forEach(([r, c]) => { PREMIUM_MAP[`${r},${c}`] = 'TLS'; });
DLS_POSITIONS.forEach(([r, c]) => { PREMIUM_MAP[`${r},${c}`] = 'DLS'; });
PREMIUM_MAP['7,7'] = 'CENTER';

/** Create a blank 15×15 board with premium squares populated */
export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, (_, r) =>
    Array.from({ length: BOARD_SIZE }, (_, c): BoardCell => ({
      tile: null,
      premium: PREMIUM_MAP[`${r},${c}`] ?? null,
      isNew: false,
    }))
  );
}

/** Tailwind background classes for each premium type */
export function premiumBg(premium: PremiumType): string {
  switch (premium) {
    case 'TWS': return 'bg-red-600';
    case 'DWS': return 'bg-pink-500';
    case 'TLS': return 'bg-blue-600';
    case 'DLS': return 'bg-sky-400';
    case 'CENTER': return 'bg-pink-500';
    default: return 'bg-emerald-900/40';
  }
}

/** Short label rendered inside premium squares */
export function premiumLabel(premium: PremiumType): string {
  switch (premium) {
    case 'TWS': return 'TWS';
    case 'DWS': return 'DWS';
    case 'TLS': return 'TLS';
    case 'DLS': return 'DLS';
    case 'CENTER': return '★';
    default: return '';
  }
}

/** Check whether a cell coordinate is inside the board */
export function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}
