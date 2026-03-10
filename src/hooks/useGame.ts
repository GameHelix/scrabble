'use client';

import { useReducer, useCallback, useEffect } from 'react';
import type { GameState, GameAction, Board, Tile, PlacedTile, Letter, Difficulty } from '@/types/game';
import { createEmptyBoard } from '@/utils/board';
import { createTileBag, drawTiles, shuffle } from '@/utils/tiles';
import { evaluateMove } from '@/utils/scoring';
import { generateAiMove } from '@/utils/ai';

// ─── Initial State ────────────────────────────────────────────────────────────

function createInitialState(): GameState {
  return {
    board: createEmptyBoard(),
    players: [],
    currentPlayerIndex: 0,
    tileBag: [],
    phase: 'setup',
    difficulty: 'medium',
    consecutivePasses: 0,
    turnHistory: [],
    pendingTiles: [],
    winner: null,
    isPaused: false,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isFirstMove(board: Board): boolean {
  return board.every(row => row.every(cell => cell.tile === null));
}

/** Remove pending tile highlights from the board */
function clearNewFlags(board: Board): Board {
  return board.map(row => row.map(cell => ({ ...cell, isNew: false })));
}

/** Commit pending tiles permanently to the board */
function commitTiles(board: Board, pending: PlacedTile[]): Board {
  const next = board.map(row => row.map(cell => ({ ...cell, isNew: false })));
  for (const { tile, row, col } of pending) {
    next[row][col] = { ...next[row][col], tile, isNew: true };
  }
  return next;
}

/** Advance to the next player's turn */
function nextTurn(state: GameState): Partial<GameState> {
  const nextIdx = (state.currentPlayerIndex + 1) % state.players.length;
  return {
    currentPlayerIndex: nextIdx,
    pendingTiles: [],
    board: clearNewFlags(state.board),
  };
}

/** Replenish a player's rack from the bag */
function replenishRack(rack: Tile[], bag: Tile[]): [Tile[], Tile[]] {
  const need = 7 - rack.length;
  if (need <= 0 || bag.length === 0) return [rack, bag];
  const [drawn, remaining] = drawTiles(bag, Math.min(need, bag.length));
  return [[...rack, ...drawn], remaining];
}

/** Compute final score adjustments at game end */
function computeEndScores(state: GameState): GameState {
  const players = state.players.map(p => ({ ...p }));
  let sumUnplayed = 0;

  // Each player loses points equal to unplayed tiles
  for (let i = 0; i < players.length; i++) {
    const unplayed = players[i].rack.reduce((s, t) => s + t.value, 0);
    players[i].score -= unplayed;
    if (i !== state.currentPlayerIndex) sumUnplayed += unplayed;
  }
  // The player who emptied their rack gains the sum of others' unplayed tiles
  if (players[state.currentPlayerIndex].rack.length === 0) {
    players[state.currentPlayerIndex].score += sumUnplayed;
  }

  const winner = players.reduce((best, p) => p.score > best.score ? p : best, players[0]);
  return { ...state, players, winner: winner.name, phase: 'ended' };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'START_GAME': {
      const bag = createTileBag();
      const [humanTiles, bag1] = drawTiles(bag, 7);
      const [aiTiles, finalBag] = drawTiles(bag1, 7);
      return {
        ...createInitialState(),
        phase: 'playing',
        difficulty: action.difficulty,
        tileBag: finalBag,
        players: [
          { name: action.playerName || 'You', score: 0, rack: humanTiles, isAI: false },
          { name: `CPU (${action.difficulty})`, score: 0, rack: aiTiles, isAI: true },
        ],
      };
    }

    case 'PLACE_TILE': {
      if (state.phase !== 'playing' || state.isPaused) return state;
      const { tile, row, col } = action;
      // Can't place on an occupied cell
      if (state.board[row][col].tile) return state;
      // Remove tile from rack
      const player = { ...state.players[state.currentPlayerIndex] };
      const rackIdx = player.rack.findIndex(t => t.id === tile.id);
      if (rackIdx === -1) return state;
      const newRack = [...player.rack];
      newRack.splice(rackIdx, 1);
      const players = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? { ...p, rack: newRack } : p
      );
      // Add to pending
      const pending = [...state.pendingTiles, { tile, row, col }];
      return { ...state, players, pendingTiles: pending };
    }

    case 'RECALL_TILES': {
      if (state.pendingTiles.length === 0) return state;
      // Return tiles to rack
      const player = state.players[state.currentPlayerIndex];
      const returnedTiles = state.pendingTiles.map(p => p.tile);
      const newRack = [...player.rack, ...returnedTiles];
      const players = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? { ...p, rack: newRack } : p
      );
      return { ...state, players, pendingTiles: [] };
    }

    case 'PLAY_WORD': {
      if (state.pendingTiles.length === 0) return state;
      const result = evaluateMove(state.board, state.pendingTiles, isFirstMove(state.board));
      if (!result.valid) {
        // Return tiles on invalid play
        return state; // caller should show the error
      }
      // Commit tiles to board
      const newBoard = commitTiles(state.board, state.pendingTiles);
      // Update player score and replenish rack
      const player = state.players[state.currentPlayerIndex];
      let [newRack, newBag] = replenishRack(player.rack, state.tileBag);
      const players = state.players.map((p, i) =>
        i === state.currentPlayerIndex
          ? { ...p, score: p.score + result.score, rack: newRack }
          : p
      );
      const turnHistory = [
        ...state.turnHistory,
        { playerName: player.name, score: result.score, words: result.words, type: 'play' as const },
      ];
      const nextIdx = (state.currentPlayerIndex + 1) % state.players.length;
      let next: GameState = {
        ...state,
        board: newBoard,
        players,
        tileBag: newBag,
        turnHistory,
        consecutivePasses: 0,
        currentPlayerIndex: nextIdx,
        pendingTiles: [],
      };
      // Check game-over: current player rack empty and bag empty
      if (newRack.length === 0 && newBag.length === 0) {
        next = computeEndScores(next);
      }
      return next;
    }

    case 'PASS_TURN': {
      const player = state.players[state.currentPlayerIndex];
      const turnHistory = [
        ...state.turnHistory,
        { playerName: player.name, score: 0, words: [], type: 'pass' as const },
      ];
      const consecutive = state.consecutivePasses + 1;
      let next: GameState = {
        ...state,
        turnHistory,
        consecutivePasses: consecutive,
        ...nextTurn(state),
      };
      // 6 consecutive passes (3 rounds) ends the game
      if (consecutive >= 6) {
        next = computeEndScores(next);
      }
      return next;
    }

    case 'SWAP_TILES': {
      if (state.tileBag.length < action.tileIds.length) return state;
      const player = state.players[state.currentPlayerIndex];
      // Remove swapped tiles from rack
      const swapped = player.rack.filter(t => action.tileIds.includes(t.id));
      const newRack = player.rack.filter(t => !action.tileIds.includes(t.id));
      // Draw replacement tiles
      const [drawn, bagAfterDraw] = drawTiles(state.tileBag, swapped.length);
      const [finalRack] = replenishRack(newRack, drawn);
      // Return swapped tiles to the bag (shuffled)
      const newBag = shuffle([...bagAfterDraw, ...swapped]);
      const players = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? { ...p, rack: finalRack } : p
      );
      const turnHistory = [
        ...state.turnHistory,
        {
          playerName: player.name, score: 0,
          words: [], type: 'swap' as const,
        },
      ];
      return {
        ...state,
        players,
        tileBag: newBag,
        turnHistory,
        consecutivePasses: state.consecutivePasses + 1,
        ...nextTurn(state),
      };
    }

    case 'SHUFFLE_RACK': {
      const player = state.players[state.currentPlayerIndex];
      const players = state.players.map((p, i) =>
        i === state.currentPlayerIndex ? { ...p, rack: shuffle(p.rack) } : p
      );
      return { ...state, players };
    }

    case 'TOGGLE_PAUSE':
      return { ...state, isPaused: !state.isPaused };

    case 'RESTART_GAME':
      return createInitialState();

    case 'SELECT_BLANK': {
      // Assign a letter to a blank tile already in pending or rack
      const { tileId, letter } = action;
      const pendingTiles = state.pendingTiles.map(p =>
        p.tile.id === tileId ? { ...p, tile: { ...p.tile, letter, isBlank: true } } : p
      );
      const players = state.players.map((p, i) =>
        i === state.currentPlayerIndex
          ? {
            ...p,
            rack: p.rack.map(t => t.id === tileId ? { ...t, letter, isBlank: true } : t),
          }
          : p
      );
      return { ...state, pendingTiles, players };
    }

    case 'AI_MOVE': {
      if (state.phase !== 'playing') return state;
      const aiPlayer = state.players[state.currentPlayerIndex];
      if (!aiPlayer.isAI) return state;

      const aiResult = generateAiMove(state.board, aiPlayer.rack, state.difficulty);
      if (!aiResult) {
        // AI passes
        return gameReducer(state, { type: 'PASS_TURN' });
      }

      // Build a temporary state with AI tiles placed as pending
      let tempState: GameState = { ...state, pendingTiles: [] };
      for (const { tile, row, col } of aiResult.tiles) {
        const rackIdx = tempState.players[tempState.currentPlayerIndex].rack
          .findIndex(t => t.id === tile.id);
        if (rackIdx === -1) continue;
        const newRack = [...tempState.players[tempState.currentPlayerIndex].rack];
        newRack.splice(rackIdx, 1);
        const players = tempState.players.map((p, i) =>
          i === tempState.currentPlayerIndex ? { ...p, rack: newRack } : p
        );
        tempState = {
          ...tempState,
          players,
          pendingTiles: [...tempState.pendingTiles, { tile, row, col }],
        };
      }
      return gameReducer(tempState, { type: 'PLAY_WORD' });
    }

    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseGameReturn {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  /** Validate pending tiles and return an error message or null */
  validatePending: () => string | null;
}

export function useGame(): UseGameReturn {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);

  // Trigger AI move when it's the AI's turn
  useEffect(() => {
    if (state.phase !== 'playing' || state.isPaused) return;
    const current = state.players[state.currentPlayerIndex];
    if (!current?.isAI) return;

    const timer = setTimeout(() => {
      dispatch({ type: 'AI_MOVE' });
    }, 1200); // slight delay so it feels natural

    return () => clearTimeout(timer);
  }, [state.currentPlayerIndex, state.phase, state.isPaused, state.players]);

  const validatePending = useCallback((): string | null => {
    if (state.pendingTiles.length === 0) return 'No tiles placed.';
    const result = evaluateMove(state.board, state.pendingTiles, isFirstMove(state.board));
    return result.valid ? null : (result.error ?? 'Invalid move.');
  }, [state.board, state.pendingTiles]);

  return { state, dispatch, validatePending };
}
