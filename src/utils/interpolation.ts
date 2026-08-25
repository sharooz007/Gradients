import type { EasingType, Keyframe, ShaderState, VideoProject } from '../types/shader';
import { lerp, lerpAngle } from './mathUtils';
import { lerpColorArrays } from './colorUtils';

export function applyEasing(t: number, easing: EasingType): number {
  switch (easing) {
    case 'easeIn':
      return t * t;
    case 'easeOut':
      return t * (2 - t);
    case 'easeInOut':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    case 'linear':
    default:
      return t;
  }
}

export function interpolateShaderStates(
  stateA: ShaderState,
  stateB: ShaderState,
  progress: number,
  easing: EasingType = 'linear'
): ShaderState {
  const t = applyEasing(progress, easing);

  return {
    ...stateA,
    colors: lerpColorArrays(stateA.colors, stateB.colors, t),
    speed: lerp(stateA.speed, stateB.speed, t),
    zoom: lerp(stateA.zoom, stateB.zoom, t),
    freq: lerp(stateA.freq, stateB.freq, t),
    sharpness: lerp(stateA.sharpness, stateB.sharpness, t),
    amplitude: lerp(stateA.amplitude, stateB.amplitude, t),
    waveWidthMod: lerp(stateA.waveWidthMod, stateB.waveWidthMod, t),
    offsetX: lerp(stateA.offsetX, stateB.offsetX, t),
    offsetY: lerp(stateA.offsetY, stateB.offsetY, t),
    rotation: lerpAngle(stateA.rotation, stateB.rotation, t),
    seed: lerp(stateA.seed, stateB.seed, t),
    animate: stateA.animate || stateB.animate,

    localWarpIntensity: lerp(stateA.localWarpIntensity, stateB.localWarpIntensity, t),
    localWarpFreqX: lerp(stateA.localWarpFreqX, stateB.localWarpFreqX, t),
    localWarpFreqY: lerp(stateA.localWarpFreqY, stateB.localWarpFreqY, t),
    warpDirection: [
      lerp(stateA.warpDirection[0], stateB.warpDirection[0], t),
      lerp(stateA.warpDirection[1], stateB.warpDirection[1], t)
    ],

    ditherEnabled: t < 0.5 ? stateA.ditherEnabled : stateB.ditherEnabled,
    ditherLevels: lerp(stateA.ditherLevels, stateB.ditherLevels, t),
    ditherScale: lerp(stateA.ditherScale, stateB.ditherScale, t),

    grainEnabled: t < 0.5 ? stateA.grainEnabled : stateB.grainEnabled,
    grainIntensity: lerp(stateA.grainIntensity, stateB.grainIntensity, t),
    grainSpeed: lerp(stateA.grainSpeed, stateB.grainSpeed, t),

    vignetteEnabled: t < 0.5 ? stateA.vignetteEnabled : stateB.vignetteEnabled,
    vignetteIntensity: lerp(stateA.vignetteIntensity, stateB.vignetteIntensity, t),
    vignetteRadius: lerp(stateA.vignetteRadius, stateB.vignetteRadius, t),

    fractalGlassEnabled: t < 0.5 ? stateA.fractalGlassEnabled : stateB.fractalGlassEnabled,
    fractalGlassStyle: t < 0.5 ? stateA.fractalGlassStyle : stateB.fractalGlassStyle,
    fractalGlassSteps: Math.round(lerp(stateA.fractalGlassSteps, stateB.fractalGlassSteps, t)),
    fractalGlassDistortion: lerp(stateA.fractalGlassDistortion, stateB.fractalGlassDistortion, t),
    fractalGlassBlur: lerp(stateA.fractalGlassBlur, stateB.fractalGlassBlur, t),

    brightness: lerp(stateA.brightness, stateB.brightness, t),
    contrast: lerp(stateA.contrast, stateB.contrast, t),
    hue: lerpAngle(stateA.hue, stateB.hue, t)
  };
}

export function interpolateVideoState(
  baseState: ShaderState,
  project: VideoProject,
  currentTime: number
): ShaderState {
  if (!project.keyframes || project.keyframes.length === 0) {
    return {
      ...baseState,
      ...(project.globals || {}),
      seed: baseState.seed + currentTime * baseState.speed
    };
  }

  // Sort keyframes by time
  const sorted = [...project.keyframes].sort((a, b) => a.time - b.time);

  // Before first keyframe
  if (currentTime <= sorted[0].time) {
    return {
      ...baseState,
      ...sorted[0].values,
      ...(project.globals || {})
    };
  }

  // After last keyframe
  if (currentTime >= sorted[sorted.length - 1].time) {
    return {
      ...baseState,
      ...sorted[sorted.length - 1].values,
      ...(project.globals || {})
    };
  }

  // Find surrounding keyframes
  let prevKf: Keyframe = sorted[0];
  let nextKf: Keyframe = sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i++) {
    if (currentTime >= sorted[i].time && currentTime <= sorted[i + 1].time) {
      prevKf = sorted[i];
      nextKf = sorted[i + 1];
      break;
    }
  }

  const segmentDuration = nextKf.time - prevKf.time;
  const progress = segmentDuration > 0 ? (currentTime - prevKf.time) / segmentDuration : 0;

  const stateA: ShaderState = {
    ...baseState,
    ...prevKf.values,
    ...(project.globals || {})
  };

  const stateB: ShaderState = {
    ...baseState,
    ...nextKf.values,
    ...(project.globals || {})
  };

  return interpolateShaderStates(stateA, stateB, progress, prevKf.easing);
}
