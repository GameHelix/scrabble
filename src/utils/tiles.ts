import type { Letter, Tile } from '@/types/game';

/** Standard Scrabble tile distribution and point values (English TWL) */
const TILE_DISTRIBUTION: Array<{ letter: Letter; count: number; value: number }> = [
  { letter: 'A', count: 9,  value: 1  },
  { letter: 'B', count: 2,  value: 3  },
  { letter: 'C', count: 2,  value: 3  },
  { letter: 'D', count: 4,  value: 2  },
  { letter: 'E', count: 12, value: 1  },
  { letter: 'F', count: 2,  value: 4  },
  { letter: 'G', count: 3,  value: 2  },
  { letter: 'H', count: 2,  value: 4  },
  { letter: 'I', count: 9,  value: 1  },
  { letter: 'J', count: 1,  value: 8  },
  { letter: 'K', count: 1,  value: 5  },
  { letter: 'L', count: 4,  value: 1  },
  { letter: 'M', count: 2,  value: 3  },
  { letter: 'N', count: 6,  value: 1  },
  { letter: 'O', count: 8,  value: 1  },
  { letter: 'P', count: 2,  value: 3  },
  { letter: 'Q', count: 1,  value: 10 },
  { letter: 'R', count: 6,  value: 1  },
  { letter: 'S', count: 4,  value: 1  },
  { letter: 'T', count: 6,  value: 1  },
  { letter: 'U', count: 4,  value: 1  },
  { letter: 'V', count: 2,  value: 4  },
  { letter: 'W', count: 2,  value: 4  },
  { letter: 'X', count: 1,  value: 8  },
  { letter: 'Y', count: 2,  value: 4  },
  { letter: 'Z', count: 1,  value: 10 },
  { letter: '*', count: 2,  value: 0  }, // blank tiles
];

/** Build and shuffle the full tile bag */
export function createTileBag(): Tile[] {
  const bag: Tile[] = [];
  let idCounter = 0;
  for (const { letter, count, value } of TILE_DISTRIBUTION) {
    for (let i = 0; i < count; i++) {
      bag.push({ letter, value, id: `tile-${idCounter++}` });
    }
  }
  return shuffle(bag);
}

/** Fisher-Yates shuffle (returns a new array) */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Draw `n` tiles from the front of the bag; returns [drawnTiles, remainingBag] */
export function drawTiles(bag: Tile[], n: number): [Tile[], Tile[]] {
  const drawn = bag.slice(0, n);
  const remaining = bag.slice(n);
  return [drawn, remaining];
}

/** Tile point value (use assigned letter value for blanks) */
export function getTileValue(tile: Tile): number {
  return tile.value;
}

/** Letter → point value lookup (used by AI) */
export function letterValue(letter: Letter): number {
  const found = TILE_DISTRIBUTION.find(t => t.letter === letter);
  return found?.value ?? 0;
}
