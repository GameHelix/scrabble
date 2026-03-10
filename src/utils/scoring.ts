import type { Board, BoardCell, PlacedTile, MoveResult } from '@/types/game';
import { BOARD_SIZE, inBounds } from './board';
import { isValidWord } from './dictionary';

/**
 * Given the current board and the tiles placed this turn, find all words
 * formed (the main word + cross-words) and return scores & validation.
 */
export function evaluateMove(
  board: Board,
  pendingTiles: PlacedTile[],
  isFirstMove: boolean
): MoveResult {
  if (pendingTiles.length === 0) {
    return { valid: false, score: 0, words: [], error: 'No tiles placed.' };
  }

  // ── 1. Merge pending tiles into a virtual board ─────────────────────────
  const virtual: Board = board.map(row => row.map(cell => ({ ...cell })));
  for (const { tile, row, col } of pendingTiles) {
    virtual[row][col] = { ...virtual[row][col], tile, isNew: true };
  }

  // ── 2. Check alignment (all tiles in one row or one column) ────────────
  const rows = pendingTiles.map(p => p.row);
  const cols = pendingTiles.map(p => p.col);
  const singleRow = rows.every(r => r === rows[0]);
  const singleCol = cols.every(c => c === cols[0]);

  if (!singleRow && !singleCol) {
    return { valid: false, score: 0, words: [], error: 'Tiles must be in a single row or column.' };
  }

  // ── 3. Check for gaps in the placement ────────────────────────────────
  if (singleRow) {
    const r = rows[0];
    const minC = Math.min(...cols);
    const maxC = Math.max(...cols);
    for (let c = minC; c <= maxC; c++) {
      if (!virtual[r][c].tile) {
        return { valid: false, score: 0, words: [], error: 'Tiles must be contiguous (no gaps).' };
      }
    }
  } else {
    const c = cols[0];
    const minR = Math.min(...rows);
    const maxR = Math.max(...rows);
    for (let r = minR; r <= maxR; r++) {
      if (!virtual[r][c].tile) {
        return { valid: false, score: 0, words: [], error: 'Tiles must be contiguous (no gaps).' };
      }
    }
  }

  // ── 4. First move must cover the centre square (7,7) ──────────────────
  if (isFirstMove) {
    const coversCenter = pendingTiles.some(p => p.row === 7 && p.col === 7);
    if (!coversCenter) {
      return { valid: false, score: 0, words: [], error: 'First move must cover the centre star.' };
    }
    if (pendingTiles.length === 1) {
      return { valid: false, score: 0, words: [], error: 'First move must use at least 2 tiles.' };
    }
  }

  // ── 5. Subsequent moves must connect to existing tiles ─────────────────
  if (!isFirstMove) {
    const connects = pendingTiles.some(({ row, col }) => {
      const neighbours = [
        [row - 1, col], [row + 1, col],
        [row, col - 1], [row, col + 1],
      ];
      return neighbours.some(([r, c]) => {
        if (!inBounds(r, c)) return false;
        // Adjacent tile belongs to an already-committed tile
        return board[r][c].tile !== null;
      });
    });
    if (!connects) {
      return { valid: false, score: 0, words: [], error: 'Placement must connect to an existing word.' };
    }
  }

  // ── 6. Collect all words formed ────────────────────────────────────────
  const wordsFormed: Array<{ word: string; cells: Array<{ r: number; c: number }> }> = [];

  /** Extract the full word containing (r,c) in the given direction */
  function extractWord(
    startR: number,
    startC: number,
    dr: number,
    dc: number
  ) {
    // Walk backward to find the start
    let r = startR;
    let c = startC;
    while (inBounds(r - dr, c - dc) && virtual[r - dr][c - dc].tile) {
      r -= dr;
      c -= dc;
    }
    // Walk forward collecting the word
    const cells: Array<{ r: number; c: number }> = [];
    while (inBounds(r, c) && virtual[r][c].tile) {
      cells.push({ r, c });
      r += dr;
      c += dc;
    }
    if (cells.length >= 2) {
      const word = cells.map(({ r: cr, c: cc }) => virtual[cr][cc].tile!.letter === '*'
        ? (virtual[cr][cc].tile!.isBlank ? virtual[cr][cc].tile!.letter : '*')
        : virtual[cr][cc].tile!.letter
      ).join('');
      wordsFormed.push({ word, cells });
    }
  }

  if (singleRow) {
    const r = rows[0];
    // Main horizontal word
    extractWord(r, cols[0], 0, 1);
    // Cross words (vertical) for each newly placed tile
    for (const { row, col } of pendingTiles) {
      extractWord(row, col, 1, 0);
    }
  } else {
    const c = cols[0];
    // Main vertical word
    extractWord(rows[0], c, 1, 0);
    // Cross words (horizontal) for each newly placed tile
    for (const { row, col } of pendingTiles) {
      extractWord(row, col, 0, 1);
    }
  }

  // Handle single-tile play connecting to existing tiles in both directions
  if (pendingTiles.length === 1 && !isFirstMove) {
    const { row, col } = pendingTiles[0];
    // Try horizontal
    extractWord(row, col, 0, 1);
    // Try vertical
    extractWord(row, col, 1, 0);
  }

  // De-duplicate words by their cell arrays
  const seen = new Set<string>();
  const uniqueWords = wordsFormed.filter(w => {
    const key = w.cells.map(c => `${c.r},${c.c}`).join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (uniqueWords.length === 0) {
    return { valid: false, score: 0, words: [], error: 'No valid word formed.' };
  }

  // ── 7. Validate all words against the dictionary ──────────────────────
  for (const { word } of uniqueWords) {
    const clean = word.replace(/\*/g, '').toUpperCase();
    if (!isValidWord(clean)) {
      return { valid: false, score: 0, words: uniqueWords.map(w => w.word), error: `"${clean}" is not a valid Scrabble word.` };
    }
  }

  // ── 8. Calculate score ─────────────────────────────────────────────────
  let totalScore = 0;

  for (const { cells } of uniqueWords) {
    let wordScore = 0;
    let wordMultiplier = 1;

    for (const { r, c } of cells) {
      const cell: BoardCell = virtual[r][c];
      const tileValue = cell.tile!.value;

      if (cell.isNew) {
        // Premium squares only apply when the tile is first placed
        switch (cell.premium) {
          case 'TLS': wordScore += tileValue * 3; break;
          case 'DLS': wordScore += tileValue * 2; break;
          case 'TWS': wordScore += tileValue; wordMultiplier *= 3; break;
          case 'DWS':
          case 'CENTER': wordScore += tileValue; wordMultiplier *= 2; break;
          default: wordScore += tileValue;
        }
      } else {
        wordScore += tileValue;
      }
    }
    totalScore += wordScore * wordMultiplier;
  }

  // Bingo bonus: 50 points for using all 7 tiles in one move
  if (pendingTiles.length === 7) totalScore += 50;

  return {
    valid: true,
    score: totalScore,
    words: uniqueWords.map(w => w.word.replace(/\*/g, '?')),
  };
}
