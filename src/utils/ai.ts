import type { Board, Tile, PlacedTile, Difficulty } from '@/types/game';
import { BOARD_SIZE, inBounds } from './board';
import { evaluateMove } from './scoring';
import { isValidWord } from './dictionary';

/** Candidate move returned by the AI engine */
export interface AiMove {
  tiles: PlacedTile[];
  score: number;
  words: string[];
}

/** All alphabet letters */
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * Generate all permutations of length `len` from an array of tiles.
 * Returns arrays of Tile (may include duplicates filtered by id).
 */
function permutations(tiles: Tile[], len: number): Tile[][] {
  if (len === 0) return [[]];
  const results: Tile[][] = [];
  for (let i = 0; i < tiles.length; i++) {
    const rest = [...tiles.slice(0, i), ...tiles.slice(i + 1)];
    for (const perm of permutations(rest, len - 1)) {
      results.push([tiles[i], ...perm]);
    }
  }
  return results;
}

/** Check if a board has at least one tile committed */
function boardIsEmpty(board: Board): boolean {
  return board.every(row => row.every(cell => cell.tile === null));
}

/** Collect all cells adjacent to occupied cells (or centre for first move) */
function getAnchorCells(board: Board): Array<{ r: number; c: number }> {
  const empty = boardIsEmpty(board);
  if (empty) return [{ r: 7, c: 7 }];

  const anchors: Array<{ r: number; c: number }> = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c].tile) continue;
      const neighbours = [[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
      if (neighbours.some(([nr,nc]) => inBounds(nr,nc) && board[nr][nc].tile)) {
        anchors.push({ r, c });
      }
    }
  }
  return anchors;
}

/**
 * AI move generator.
 * - easy:   picks a random valid move (lowest-effort)
 * - medium: picks from top-5 scoring moves randomly
 * - hard:   picks the highest-scoring move
 */
export function generateAiMove(
  board: Board,
  rack: Tile[],
  difficulty: Difficulty
): AiMove | null {
  const isFirstMove = boardIsEmpty(board);
  const anchors = getAnchorCells(board);
  const candidates: AiMove[] = [];

  // Expand blank tiles into all possible letters
  const expandedRack = expandBlanks(rack);

  const maxTiles = Math.min(rack.length, difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7);

  for (const anchor of anchors) {
    for (let len = 2; len <= maxTiles; len++) {
      for (const perm of permutations(expandedRack, Math.min(len, expandedRack.length))) {
        // Try horizontal placement starting at anchor going right
        tryPlacement(board, perm, anchor.r, anchor.c, 0, 1, isFirstMove, candidates);
        // Try vertical placement starting at anchor going down
        tryPlacement(board, perm, anchor.r, anchor.c, 1, 0, isFirstMove, candidates);
        // Try placements that end at anchor
        for (let offset = 1; offset < len; offset++) {
          tryPlacement(board, perm, anchor.r - offset*1, anchor.c, 1, 0, isFirstMove, candidates);
          tryPlacement(board, perm, anchor.r, anchor.c - offset*1, 0, 1, isFirstMove, candidates);
        }
        if (candidates.length > 500) break; // performance cap
      }
      if (candidates.length > 500) break;
    }
    if (candidates.length > 500) break;
  }

  if (candidates.length === 0) return null;

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  if (difficulty === 'easy') {
    // Pick randomly from the bottom half
    const pool = candidates.slice(Math.floor(candidates.length / 2));
    return pool[Math.floor(Math.random() * pool.length)];
  }
  if (difficulty === 'medium') {
    // Pick randomly from the top 5
    const pool = candidates.slice(0, Math.min(5, candidates.length));
    return pool[Math.floor(Math.random() * pool.length)];
  }
  // hard — best move
  return candidates[0];
}

/** Expand blank tiles into copies with each possible letter assigned */
function expandBlanks(rack: Tile[]): Tile[] {
  const result: Tile[] = [];
  for (const tile of rack) {
    if (tile.letter === '*') {
      for (const letter of LETTERS) {
        result.push({ ...tile, letter: letter as Tile['letter'], value: 0, isBlank: true });
      }
    } else {
      result.push(tile);
    }
  }
  return result;
}

/** Try placing `tiles` starting from (startR, startC) in direction (dr, dc) */
function tryPlacement(
  board: Board,
  tiles: Tile[],
  startR: number,
  startC: number,
  dr: number,
  dc: number,
  isFirstMove: boolean,
  output: AiMove[]
) {
  const placed: PlacedTile[] = [];
  let r = startR;
  let c = startC;
  let tileIdx = 0;

  for (; tileIdx < tiles.length; ) {
    if (!inBounds(r, c)) break;
    if (board[r][c].tile) {
      // Skip over existing tiles on the board
      r += dr;
      c += dc;
      continue;
    }
    placed.push({ tile: tiles[tileIdx], row: r, col: c });
    tileIdx++;
    r += dr;
    c += dc;
  }

  if (placed.length < (isFirstMove ? 2 : 1)) return;

  const result = evaluateMove(board, placed, isFirstMove);
  if (result.valid && result.score > 0) {
    // Map back to original rack tile IDs (blanks keep their id)
    output.push({ tiles: placed, score: result.score, words: result.words });
  }
}
