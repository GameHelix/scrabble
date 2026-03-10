'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import type { Tile as TileType, Letter, Difficulty } from '@/types/game';
import { useGame } from '@/hooks/useGame';
import { useSound } from '@/hooks/useSound';
import { evaluateMove } from '@/utils/scoring';

import SetupScreen from '@/components/SetupScreen';
import Board from '@/components/Board';
import TileRack from '@/components/TileRack';
import ScoreBoard from '@/components/ScoreBoard';
import GameControls from '@/components/GameControls';
import EndScreen from '@/components/EndScreen';
import PauseOverlay from '@/components/PauseOverlay';
import BlankTileModal from '@/components/BlankTileModal';

export default function GamePage() {
  const { state, dispatch, validatePending } = useGame();
  const { play, enabled: soundEnabled, toggle: toggleSound } = useSound();

  // Tile selection state
  const [selectedTile, setSelectedTile] = useState<TileType | null>(null);
  // Error banner
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Blank tile assignment modal
  const [blankModalOpen, setBlankModalOpen] = useState(false);
  const [pendingBlankId, setPendingBlankId] = useState<string | null>(null);

  const currentPlayer = state.players[state.currentPlayerIndex];
  const isHumanTurn = !!currentPlayer && !currentPlayer.isAI;

  // Clear error after 3 seconds
  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(null), 3000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  const handlePlay = useCallback(() => {
    if (!isHumanTurn || state.pendingTiles.length === 0) return;
    const error = validatePending();
    if (error) {
      setErrorMsg(error);
      play('invalid');
      return;
    }
    const isFirst = state.board.every(r => r.every(c => c.tile === null));
    const result = evaluateMove(state.board, state.pendingTiles, isFirst);
    dispatch({ type: 'PLAY_WORD' });
    if (result.valid && result.score >= 50) play('bingo');
    else if (result.valid) play('score');
  }, [isHumanTurn, state, validatePending, play, dispatch]);

  const handleRecall = useCallback(() => {
    dispatch({ type: 'RECALL_TILES' });
    setSelectedTile(null);
    play('click');
  }, [dispatch, play]);

  useEffect(() => {
    if (state.phase !== 'playing') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handlePlay();
      if (e.key === 'Escape') handleRecall();
      if (e.key === ' ') { e.preventDefault(); dispatch({ type: 'SHUFFLE_RACK' }); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.phase, handlePlay, handleRecall, dispatch]);

  // ── Actions ────────────────────────────────────────────────────────────────

  function handleTileSelect(tile: TileType) {
    if (!isHumanTurn || state.isPaused) return;
    play('click');
    if (selectedTile?.id === tile.id) {
      setSelectedTile(null);
    } else {
      setSelectedTile(tile);
    }
  }

  function handleCellClick(row: number, col: number) {
    if (!isHumanTurn || state.isPaused) return;

    // If cell already has a pending tile, ignore
    const hasPending = state.pendingTiles.some(p => p.row === row && p.col === col);
    if (hasPending) return;

    if (selectedTile && !state.board[row][col].tile) {
      // Blank tile → ask for letter first, place on board, then assign letter
      if (selectedTile.letter === '*' && !selectedTile.isBlank) {
        dispatch({ type: 'PLACE_TILE', tile: selectedTile, row, col });
        setPendingBlankId(selectedTile.id);
        setBlankModalOpen(true);
        setSelectedTile(null);
        play('place');
        return;
      }
      dispatch({ type: 'PLACE_TILE', tile: selectedTile, row, col });
      play('place');
      setSelectedTile(null);
    }
  }

  function handlePass() {
    dispatch({ type: 'PASS_TURN' });
    setSelectedTile(null);
    play('click');
  }

  function handleSwap(ids: string[]) {
    dispatch({ type: 'SWAP_TILES', tileIds: ids });
    play('swap');
  }

  const handleBlankSelect = useCallback((letter: Letter) => {
    if (!pendingBlankId) return;
    dispatch({ type: 'SELECT_BLANK', tileId: pendingBlankId, letter });
    setPendingBlankId(null);
    setBlankModalOpen(false);
  }, [pendingBlankId, dispatch]);

  // ── Setup phase ────────────────────────────────────────────────────────────
  if (state.phase === 'setup') {
    return (
      <SetupScreen
        onStart={(name: string, diff: Difficulty) =>
          dispatch({ type: 'START_GAME', difficulty: diff, playerName: name })
        }
      />
    );
  }

  const pendingTileIds = new Set(state.pendingTiles.map(p => p.tile.id));

  return (
    <div className="min-h-screen bg-[#0a1628] text-white overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -left-60 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-60 -right-60 w-[500px] h-[500px] bg-teal-900/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
        <div className="flex items-center gap-1">
          {['S','C','R','A','B','B','L','E'].map((l, i) => (
            <span
              key={i}
              className="w-6 h-6 bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900 font-black text-[10px] rounded flex items-center justify-center shadow"
            >
              {l}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {!isHumanTurn && state.phase === 'playing' && (
            <motion.div
              className="flex items-center gap-1.5 text-xs text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full ring-1 ring-purple-500/20"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
              CPU thinking…
            </motion.div>
          )}
          {isHumanTurn && state.phase === 'playing' && (
            <span className="text-xs text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-full ring-1 ring-cyan-500/20">
              Your turn
            </span>
          )}
        </div>
      </header>

      {/* Main layout */}
      <main className="relative z-10 flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto">

        {/* Board + rack + controls */}
        <div className="flex-1 flex flex-col items-center gap-4">
          <div className="w-full flex justify-center pl-5">
            <Board
              board={state.board}
              pendingTiles={state.pendingTiles}
              selectedTile={selectedTile}
              onCellClick={handleCellClick}
            />
          </div>

          {/* Rack (only during human turn) */}
          <AnimatePresence>
            {isHumanTurn && (
              <motion.div
                key="rack"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="w-full max-w-[min(90vw,520px)]"
              >
                <TileRack
                  tiles={currentPlayer.rack}
                  selectedTile={selectedTile}
                  onSelect={handleTileSelect}
                  pendingTileIds={pendingTileIds}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          {isHumanTurn && (
            <div className="w-full max-w-[min(90vw,520px)]">
              <GameControls
                canPlay={state.pendingTiles.length > 0}
                canRecall={state.pendingTiles.length > 0}
                canSwap={state.tileBag.length >= 1}
                isPaused={state.isPaused}
                rackTiles={currentPlayer.rack}
                soundEnabled={soundEnabled}
                errorMessage={errorMsg}
                onPlay={handlePlay}
                onRecall={handleRecall}
                onPass={handlePass}
                onSwap={handleSwap}
                onShuffle={() => dispatch({ type: 'SHUFFLE_RACK' })}
                onPause={() => dispatch({ type: 'TOGGLE_PAUSE' })}
                onSoundToggle={toggleSound}
              />
            </div>
          )}

          {/* AI turn controls */}
          {!isHumanTurn && state.phase === 'playing' && (
            <div className="flex gap-3">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-sm text-slate-200 rounded-xl transition-all"
              >
                {state.isPaused ? '▶ Resume' : '⏸ Pause'}
              </button>
              <button
                onClick={toggleSound}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-sm text-slate-200 rounded-xl transition-all"
              >
                {soundEnabled ? '🔊' : '🔇'}
              </button>
            </div>
          )}
        </div>

        {/* Scoreboard sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <ScoreBoard
            players={state.players}
            currentPlayerIndex={state.currentPlayerIndex}
            bagCount={state.tileBag.length}
            history={state.turnHistory}
          />
        </aside>
      </main>

      {/* Overlays */}
      <PauseOverlay
        isPaused={state.isPaused}
        onResume={() => dispatch({ type: 'TOGGLE_PAUSE' })}
      />

      <BlankTileModal
        isOpen={blankModalOpen}
        onSelect={handleBlankSelect}
        onClose={() => {
          setBlankModalOpen(false);
          setPendingBlankId(null);
        }}
      />

      {state.phase === 'ended' && (
        <EndScreen
          players={state.players}
          winner={state.winner}
          humanName={state.players.find(p => !p.isAI)?.name ?? 'You'}
          onRestart={() => dispatch({ type: 'RESTART_GAME' })}
        />
      )}
    </div>
  );
}
