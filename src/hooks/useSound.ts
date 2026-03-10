'use client';

import { useRef, useCallback, useState } from 'react';

type SoundType = 'place' | 'invalid' | 'score' | 'bingo' | 'win' | 'lose' | 'click' | 'swap';

/** Thin wrapper around the Web Audio API for in-game sound effects */
export function useSound() {
  const [enabled, setEnabled] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);

  /** Lazy-create the AudioContext on first use (requires user gesture) */
  function getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return ctxRef.current;
  }

  /** Play a synthesised tone */
  const play = useCallback((type: SoundType) => {
    if (!enabled) return;
    const ctx = getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (type) {
      case 'place': beep(ctx, 440, 0.05, 'sine', now); break;
      case 'invalid': beep(ctx, 200, 0.12, 'sawtooth', now); break;
      case 'score': playScore(ctx, now); break;
      case 'bingo': playBingo(ctx, now); break;
      case 'win': playWin(ctx, now); break;
      case 'lose': beep(ctx, 180, 0.4, 'triangle', now); break;
      case 'click': beep(ctx, 600, 0.03, 'sine', now); break;
      case 'swap': beep(ctx, 330, 0.1, 'sine', now); break;
    }
  }, [enabled]);

  const toggle = useCallback(() => setEnabled(v => !v), []);

  return { play, enabled, toggle };
}

function beep(
  ctx: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType,
  when: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  gain.gain.setValueAtTime(0.15, when);
  gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
  osc.start(when);
  osc.stop(when + duration);
}

function playScore(ctx: AudioContext, when: number) {
  beep(ctx, 523, 0.08, 'sine', when);        // C5
  beep(ctx, 659, 0.08, 'sine', when + 0.09); // E5
}

function playBingo(ctx: AudioContext, when: number) {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => beep(ctx, f, 0.12, 'sine', when + i * 0.12));
}

function playWin(ctx: AudioContext, when: number) {
  const notes = [523, 659, 784, 1047, 1319];
  notes.forEach((f, i) => beep(ctx, f, 0.15, 'sine', when + i * 0.1));
}
