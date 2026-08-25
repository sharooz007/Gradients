import { useState, useRef, useCallback, useEffect } from 'react';
import type { ShaderState, CanvasDimensions } from '../types/shader';
import { DEFAULT_SHADER_STATE } from '../data/presets';
import { getRandomPalette } from '../data/palettes';
import { randomRange } from '../utils/mathUtils';

const MAX_HISTORY = 30;

export function useShaderState(initialState?: Partial<ShaderState>) {
  const [state, setState] = useState<ShaderState>({
    ...DEFAULT_SHADER_STATE,
    ...initialState
  });

  const [dimensions, setDimensions] = useState<CanvasDimensions>({
    width: 2000,
    height: 1400,
    label: 'Landscape (2000x1400)',
    aspectRatio: '10:7'
  });

  // History for Undo / Redo
  const historyRef = useRef<ShaderState[]>([
    { ...DEFAULT_SHADER_STATE, ...initialState }
  ]);
  const historyIndexRef = useRef<number>(0);
  const [, setHistoryTick] = useState(0);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const pushHistory = useCallback((newState: ShaderState) => {
    // Truncate future history if at an earlier index
    const trimmed = historyRef.current.slice(0, historyIndexRef.current + 1);
    trimmed.push(newState);
    if (trimmed.length > MAX_HISTORY) {
      trimmed.shift();
    }
    historyRef.current = trimmed;
    historyIndexRef.current = trimmed.length - 1;
    setHistoryTick((t) => t + 1);
  }, []);

  const updateState = useCallback((updates: Partial<ShaderState>, commitToHistory: boolean = false) => {
    setState((prev) => {
      const next = { ...prev, ...updates };
      if (commitToHistory) {
        pushHistory(next);
      }
      return next;
    });
  }, [pushHistory]);

  const commitState = useCallback((nextState: ShaderState) => {
    setState(nextState);
    pushHistory(nextState);
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prev = historyRef.current[historyIndexRef.current];
      setState(prev);
      setHistoryTick((t) => t + 1);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const next = historyRef.current[historyIndexRef.current];
      setState(next);
      setHistoryTick((t) => t + 1);
    }
  }, []);

  // Keyboard shortcut listener for ⌘Z / ⌘⇧Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Shuffle colors
  const shuffleColors = useCallback(() => {
    const newColors = getRandomPalette();
    updateState({ colors: newColors }, true);
  }, [updateState]);

  // Shuffle seed
  const shuffleSeed = useCallback(() => {
    updateState({ seed: Math.random() * 100 }, true);
  }, [updateState]);

  // Generate completely new randomized state
  const randomizeAll = useCallback(() => {
    const randomColors = getRandomPalette();
    const randomized: ShaderState = {
      ...state,
      colors: randomColors,
      seed: Math.random() * 100,
      zoom: randomRange(0.6, 1.8, 0.05),
      freq: randomRange(2, 8, 0.1),
      sharpness: randomRange(1.2, 5.0, 0.1),
      amplitude: randomRange(0.5, 2.2, 0.05),
      waveWidthMod: randomRange(0.2, 1.1, 0.05),
      localWarpIntensity: randomRange(0.2, 2.5, 0.1),
      localWarpFreqX: randomRange(0.5, 2.5, 0.1),
      localWarpFreqY: randomRange(1.0, 4.5, 0.1),
      rotation: randomRange(0, 360, 1),
      offsetX: randomRange(-0.6, 0.6, 0.05),
      offsetY: randomRange(-0.6, 0.6, 0.05),
      ditherEnabled: Math.random() < 0.25,
      ditherLevels: Math.floor(randomRange(6, 24, 1)),
      ditherScale: randomRange(2, 6, 0.5),
      grainEnabled: Math.random() < 0.65,
      grainIntensity: randomRange(0.015, 0.07, 0.005),
      vignetteEnabled: Math.random() < 0.2,
      vignetteIntensity: randomRange(0.5, 0.95, 0.05),
      vignetteRadius: randomRange(0.3, 0.55, 0.05),
      brightness: 1.0,
      contrast: 1.0,
      hue: 0
    };
    commitState(randomized);
  }, [state, commitState]);

  return {
    state,
    dimensions,
    setDimensions,
    updateState,
    commitState,
    undo,
    redo,
    canUndo,
    canRedo,
    shuffleColors,
    shuffleSeed,
    randomizeAll
  };
}
