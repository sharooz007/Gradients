export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

export type GlassStyle = 'fractal' | 'frosted' | 'fluted';

export interface ShaderState {
  colors: string[];
  
  // Wave
  speed: number;
  zoom: number;
  freq: number;
  sharpness: number;
  amplitude: number;
  waveWidthMod: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  seed: number;
  animate: boolean;

  // Warp / Distortion
  localWarpIntensity: number;
  localWarpFreqX: number;
  localWarpFreqY: number;
  warpDirection: [number, number];

  // Bayer Dithering
  ditherEnabled: boolean;
  ditherLevels: number;
  ditherScale: number;

  // Film Grain
  grainEnabled: boolean;
  grainIntensity: number;
  grainSpeed: number;

  // Vignette
  vignetteEnabled: boolean;
  vignetteIntensity: number;
  vignetteRadius: number;

  // Frosted / Fluted Fractal Glass
  fractalGlassEnabled: boolean;
  fractalGlassStyle: GlassStyle;
  fractalGlassSteps: number;
  fractalGlassDistortion: number;
  fractalGlassBlur: number;

  // Color adjustments / Filters
  brightness: number;
  contrast: number;
  hue: number;
}

export interface CanvasDimensions {
  width: number;
  height: number;
  label?: string;
  aspectRatio?: string;
}

export interface Preset {
  id: string;
  name: string;
  dimensions: CanvasDimensions;
  state: ShaderState;
  isCustom?: boolean;
}

export interface Keyframe {
  id: string;
  time: number; // in seconds
  values: Partial<ShaderState>;
  easing: EasingType;
}

export interface VideoProject {
  duration: number; // in seconds (1 - 30)
  fps: number; // 30 or 60
  globals: {
    colors?: string[];
    [key: string]: any;
  };
  keyframes: Keyframe[];
}

export type AppMode = 'image' | 'video';

export type ExportFormat = 'png' | 'jpeg' | 'webp' | 'webm' | 'mp4' | 'gif';
export type ExportResolutionScale = 1 | 2 | 3 | 4;
