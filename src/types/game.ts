/** Core game types for the Scrabble implementation */

export type Letter =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J'
  | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T'
  | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | '*'; // * = blank tile

export type PremiumType = 'TWS' | 'DWS' | 'TLS' | 'DLS' | 'CENTER' | null;

/** A single letter tile */
export interface Tile {
  letter: Letter;
  value: number;
  id: string;
  isBlank?: boolean; // blank tile assigned a letter
}

/** A cell on the 15×15 board */
export interface BoardCell {
  tile: Tile | null;
  premium: PremiumType;
  isNew: boolean; // placed during the current turn
}

export type Board = BoardCell[][];

/** A tile positioned on the board for a move */
export interface PlacedTile {
  tile: Tile;
  row: number;
  col: number;
}

/** Result of validating / scoring a candidate move */
export interface MoveResult {
  valid: boolean;
  score: number;
  words: string[];
  error?: string;
}

/** Player model */
export interface Player {
  name: string;
  score: number;
  rack: Tile[];
  isAI: boolean;
}

/** History entry for one turn */
export interface TurnRecord {
  playerName: string;
  score: number;
  words: string[];
  type: 'play' | 'pass' | 'swap';
}

export type GamePhase = 'setup' | 'playing' | 'ended';
export type Difficulty = 'easy' | 'medium' | 'hard';

/** Complete game state */
export interface GameState {
  board: Board;
  players: Player[];
  currentPlayerIndex: number;
  tileBag: Tile[];
  phase: GamePhase;
  difficulty: Difficulty;
  consecutivePasses: number;
  turnHistory: TurnRecord[];
  pendingTiles: PlacedTile[]; // tiles placed this turn, not yet committed
  winner: string | null;
  isPaused: boolean;
}

/** Actions dispatched to the game reducer */
export type GameAction =
  | { type: 'START_GAME'; difficulty: Difficulty; playerName: string }
  | { type: 'PLACE_TILE'; tile: Tile; row: number; col: number }
  | { type: 'RECALL_TILES' }
  | { type: 'PLAY_WORD' }
  | { type: 'PASS_TURN' }
  | { type: 'SWAP_TILES'; tileIds: string[] }
  | { type: 'SHUFFLE_RACK' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'RESTART_GAME' }
  | { type: 'SELECT_BLANK'; tileId: string; letter: Letter }
  | { type: 'AI_MOVE' };
