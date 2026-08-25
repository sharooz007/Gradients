import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { EasingType, Keyframe, ShaderState, VideoProject } from '../types/shader';
import { interpolateVideoState } from '../utils/interpolation';

export function useVideoTimeline(baseState: ShaderState) {
  const [project, setProject] = useState<VideoProject>({
    duration: 5.0, // 5 seconds default
    fps: 30,
    globals: {},
    keyframes: [
      {
        id: 'kf-start',
        time: 0.0,
        values: { ...baseState },
        easing: 'easeInOut'
      },
      {
        id: 'kf-end',
        time: 5.0,
        values: {
          ...baseState,
          rotation: (baseState.rotation + 180) % 360,
          amplitude: Math.min(baseState.amplitude * 1.5, 4.0),
          localWarpIntensity: Math.min(baseState.localWarpIntensity * 1.8, 5.0)
        },
        easing: 'easeInOut'
      }
    ]
  });

  const [playhead, setPlayhead] = useState<number>(0.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | null>('kf-start');

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const effectiveState = useMemo(() => {
    return interpolateVideoState(baseState, project, playhead);
  }, [baseState, project, playhead]);

  // Play / Pause animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setPlayhead((prev) => {
        let next = prev + delta;
        if (next >= project.duration) {
          if (isLooping) {
            next = next % project.duration;
          } else {
            setIsPlaying(false);
            return project.duration;
          }
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, isLooping, project.duration]);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const seek = useCallback((time: number) => {
    const clamped = Math.max(0, Math.min(project.duration, time));
    setPlayhead(clamped);
  }, [project.duration]);

  const addKeyframeAtPlayhead = useCallback((values?: Partial<ShaderState>) => {
    const newId = `kf-${Date.now()}`;
    const newKf: Keyframe = {
      id: newId,
      time: Math.round(playhead * 100) / 100,
      values: values || { ...effectiveState },
      easing: 'easeInOut'
    };

    setProject((prev) => {
      // If a keyframe already exists at this exact timestamp, replace it
      const filtered = prev.keyframes.filter((k) => Math.abs(k.time - newKf.time) > 0.05);
      const updated = [...filtered, newKf].sort((a, b) => a.time - b.time);
      return { ...prev, keyframes: updated };
    });

    setSelectedKeyframeId(newId);
  }, [playhead, effectiveState]);

  const removeKeyframe = useCallback((id: string) => {
    setProject((prev) => {
      if (prev.keyframes.length <= 1) return prev; // Keep at least 1 keyframe
      const updated = prev.keyframes.filter((k) => k.id !== id);
      return { ...prev, keyframes: updated };
    });
    if (selectedKeyframeId === id) {
      setSelectedKeyframeId(null);
    }
  }, [selectedKeyframeId]);

  const updateKeyframeEasing = useCallback((id: string, easing: EasingType) => {
    setProject((prev) => ({
      ...prev,
      keyframes: prev.keyframes.map((k) => (k.id === id ? { ...k, easing } : k))
    }));
  }, []);

  const updateKeyframeValues = useCallback((id: string, values: Partial<ShaderState>) => {
    setProject((prev) => ({
      ...prev,
      keyframes: prev.keyframes.map((k) => (k.id === id ? { ...k, values: { ...k.values, ...values } } : k))
    }));
  }, []);

  const setDuration = useCallback((duration: number) => {
    const d = Math.max(1, Math.min(30, duration));
    setProject((prev) => ({
      ...prev,
      duration: d,
      keyframes: prev.keyframes.map((k) => ({
        ...k,
        time: Math.min(k.time, d)
      }))
    }));
    setPlayhead((p) => Math.min(p, d));
  }, []);

  const setGlobal = useCallback((key: string, value: any) => {
    setProject((prev) => ({
      ...prev,
      globals: {
        ...prev.globals,
        [key]: value
      }
    }));
  }, []);

  return {
    project,
    playhead,
    isPlaying,
    isLooping,
    setIsLooping,
    selectedKeyframeId,
    setSelectedKeyframeId,
    effectiveState,
    togglePlay,
    seek,
    addKeyframeAtPlayhead,
    removeKeyframe,
    updateKeyframeEasing,
    updateKeyframeValues,
    setDuration,
    setGlobal
  };
}
