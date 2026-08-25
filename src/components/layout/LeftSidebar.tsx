import React, { useState } from 'react';
import {
  Waves,
  Sparkles,
  Grid,
  Film,
  SunMedium,
  Play,
  RotateCw,
  Eye,
  ChevronDown,
  Layers
} from 'lucide-react';
import type { ShaderState } from '../../types/shader';
import { ColorPickerGroup } from '../controls/ColorPickerGroup';
import { SliderControl } from '../controls/SliderControl';
import { ToggleSwitch } from '../controls/ToggleSwitch';
import { SegmentedPicker } from '../controls/SegmentedPicker';

interface LeftSidebarProps {
  state: ShaderState;
  onUpdateState: (updates: Partial<ShaderState>, commit?: boolean) => void;
  onShuffleColors: () => void;
  onShuffleSeed: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  state,
  onUpdateState,
  onShuffleColors,
  onShuffleSeed
}) => {
  // Accordion section states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    colors: true,
    wave: true,
    warp: true,
    dither: false,
    grain: false,
    vignette: false,
    glass: false,
    filters: false,
    animation: true
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className="w-80 h-full min-h-0 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col z-20 overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
        {/* Colors Panel */}
        <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-3">
          <ColorPickerGroup
            colors={state.colors}
            onChange={(cols) => onUpdateState({ colors: cols }, true)}
            onShuffle={onShuffleColors}
          />
        </div>

        {/* Wave Controls */}
        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('wave')}
            className="w-full px-3.5 py-3 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-indigo-500" />
              <span>Wave Geometry</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openSections.wave ? 'rotate-180' : ''}`} />
          </button>

          {openSections.wave && (
            <div className="p-3.5 pt-0 flex flex-col gap-3.5 border-t border-slate-200/60 dark:border-slate-700/40">
              <SliderControl
                label="Zoom"
                value={state.zoom}
                min={0.25}
                max={3.0}
                step={0.01}
                onChange={(v) => onUpdateState({ zoom: v })}
                onChangeEnd={(v) => onUpdateState({ zoom: v }, true)}
              />

              <SliderControl
                label="Rotation"
                value={state.rotation}
                min={0}
                max={360}
                step={1}
                isAngle={true}
                onChange={(v) => onUpdateState({ rotation: v })}
                onChangeEnd={(v) => onUpdateState({ rotation: v }, true)}
              />

              <SliderControl
                label="Frequency"
                value={state.freq}
                min={1.0}
                max={20.0}
                step={0.1}
                onChange={(v) => onUpdateState({ freq: v })}
                onChangeEnd={(v) => onUpdateState({ freq: v }, true)}
              />

              <SliderControl
                label="Sharpness"
                value={state.sharpness}
                min={1.0}
                max={20.0}
                step={0.1}
                onChange={(v) => onUpdateState({ sharpness: v })}
                onChangeEnd={(v) => onUpdateState({ sharpness: v }, true)}
              />

              <SliderControl
                label="Amplitude"
                value={state.amplitude}
                min={0.0}
                max={5.0}
                step={0.01}
                onChange={(v) => onUpdateState({ amplitude: v })}
                onChangeEnd={(v) => onUpdateState({ amplitude: v }, true)}
              />

              <SliderControl
                label="Wave Width"
                value={state.waveWidthMod}
                min={0.0}
                max={2.0}
                step={0.01}
                onChange={(v) => onUpdateState({ waveWidthMod: v })}
                onChangeEnd={(v) => onUpdateState({ waveWidthMod: v }, true)}
              />

              <div className="grid grid-cols-2 gap-2">
                <SliderControl
                  label="Offset X"
                  value={state.offsetX}
                  min={-2.0}
                  max={2.0}
                  step={0.01}
                  onChange={(v) => onUpdateState({ offsetX: v })}
                  onChangeEnd={(v) => onUpdateState({ offsetX: v }, true)}
                />
                <SliderControl
                  label="Offset Y"
                  value={state.offsetY}
                  min={-2.0}
                  max={2.0}
                  step={0.01}
                  onChange={(v) => onUpdateState({ offsetY: v })}
                  onChangeEnd={(v) => onUpdateState({ offsetY: v }, true)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Distortion / Local Warp */}
        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('warp')}
            className="w-full px-3.5 py-3 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Distortion & Warp</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openSections.warp ? 'rotate-180' : ''}`} />
          </button>

          {openSections.warp && (
            <div className="p-3.5 pt-0 flex flex-col gap-3.5 border-t border-slate-200/60 dark:border-slate-700/40">
              <SliderControl
                label="Warp Intensity"
                value={state.localWarpIntensity}
                min={0.0}
                max={10.0}
                step={0.1}
                onChange={(v) => onUpdateState({ localWarpIntensity: v })}
                onChangeEnd={(v) => onUpdateState({ localWarpIntensity: v }, true)}
              />

              <div className="grid grid-cols-2 gap-2">
                <SliderControl
                  label="Freq X"
                  value={state.localWarpFreqX}
                  min={0.0}
                  max={10.0}
                  step={0.1}
                  onChange={(v) => onUpdateState({ localWarpFreqX: v })}
                  onChangeEnd={(v) => onUpdateState({ localWarpFreqX: v }, true)}
                />
                <SliderControl
                  label="Freq Y"
                  value={state.localWarpFreqY}
                  min={0.0}
                  max={10.0}
                  step={0.1}
                  onChange={(v) => onUpdateState({ localWarpFreqY: v })}
                  onChangeEnd={(v) => onUpdateState({ localWarpFreqY: v }, true)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bayer Dithering */}
        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          <div className="px-3.5 py-3 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/40">
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Retro Dithering
              </span>
            </div>
            <ToggleSwitch
              size="sm"
              checked={state.ditherEnabled}
              onChange={(checked) => onUpdateState({ ditherEnabled: checked }, true)}
            />
          </div>

          {state.ditherEnabled && (
            <div className="p-3.5 flex flex-col gap-3.5 animate-in fade-in duration-150">
              <SliderControl
                label="Dither Levels"
                value={state.ditherLevels}
                min={2}
                max={64}
                step={1}
                onChange={(v) => onUpdateState({ ditherLevels: v })}
                onChangeEnd={(v) => onUpdateState({ ditherLevels: v }, true)}
              />

              <SliderControl
                label="Pattern Block Size"
                value={state.ditherScale}
                min={1}
                max={16}
                step={0.5}
                unit="px"
                onChange={(v) => onUpdateState({ ditherScale: v })}
                onChangeEnd={(v) => onUpdateState({ ditherScale: v }, true)}
              />
            </div>
          )}
        </div>

        {/* Film Grain */}
        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          <div className="px-3.5 py-3 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/40">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Film Grain
              </span>
            </div>
            <ToggleSwitch
              size="sm"
              checked={state.grainEnabled}
              onChange={(checked) => onUpdateState({ grainEnabled: checked }, true)}
            />
          </div>

          {state.grainEnabled && (
            <div className="p-3.5 flex flex-col gap-3.5 animate-in fade-in duration-150">
              <SliderControl
                label="Grain Intensity"
                value={state.grainIntensity}
                min={0.0}
                max={0.2}
                step={0.001}
                onChange={(v) => onUpdateState({ grainIntensity: v })}
                onChangeEnd={(v) => onUpdateState({ grainIntensity: v }, true)}
              />

              <SliderControl
                label="Grain Speed"
                value={state.grainSpeed}
                min={0}
                max={100}
                step={1}
                onChange={(v) => onUpdateState({ grainSpeed: v })}
                onChangeEnd={(v) => onUpdateState({ grainSpeed: v }, true)}
              />
            </div>
          )}
        </div>

        {/* Vignette */}
        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          <div className="px-3.5 py-3 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/40">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Vignette
              </span>
            </div>
            <ToggleSwitch
              size="sm"
              checked={state.vignetteEnabled}
              onChange={(checked) => onUpdateState({ vignetteEnabled: checked }, true)}
            />
          </div>

          {state.vignetteEnabled && (
            <div className="p-3.5 flex flex-col gap-3.5 animate-in fade-in duration-150">
              <SliderControl
                label="Vignette Intensity"
                value={state.vignetteIntensity}
                min={0.0}
                max={1.0}
                step={0.01}
                onChange={(v) => onUpdateState({ vignetteIntensity: v })}
                onChangeEnd={(v) => onUpdateState({ vignetteIntensity: v }, true)}
              />

              <SliderControl
                label="Radius"
                value={state.vignetteRadius}
                min={0.05}
                max={1.0}
                step={0.01}
                onChange={(v) => onUpdateState({ vignetteRadius: v })}
                onChangeEnd={(v) => onUpdateState({ vignetteRadius: v }, true)}
              />
            </div>
          )}
        </div>

        {/* Frosted / Fluted Fractal Glass Effect */}
        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          <div className="px-3.5 py-3 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/40">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Glass Refraction
              </span>
            </div>
            <ToggleSwitch
              size="sm"
              checked={state.fractalGlassEnabled}
              onChange={(checked) => onUpdateState({ fractalGlassEnabled: checked }, true)}
            />
          </div>

          {state.fractalGlassEnabled && (
            <div className="p-3.5 flex flex-col gap-3.5 animate-in fade-in duration-150">
              <SegmentedPicker<'fractal' | 'frosted' | 'fluted'>
                size="sm"
                value={state.fractalGlassStyle}
                onChange={(style) => onUpdateState({ fractalGlassStyle: style }, true)}
                options={[
                  { value: 'fractal', label: 'Fractal' },
                  { value: 'fluted', label: 'Fluted' },
                  { value: 'frosted', label: 'Frosted' }
                ]}
              />

              <SliderControl
                label="Flute Sections"
                value={state.fractalGlassSteps}
                min={5}
                max={60}
                step={1}
                onChange={(v) => onUpdateState({ fractalGlassSteps: v })}
                onChangeEnd={(v) => onUpdateState({ fractalGlassSteps: v }, true)}
              />

              <SliderControl
                label="Distortion"
                value={state.fractalGlassDistortion}
                min={0.0}
                max={1.0}
                step={0.01}
                onChange={(v) => onUpdateState({ fractalGlassDistortion: v })}
                onChangeEnd={(v) => onUpdateState({ fractalGlassDistortion: v }, true)}
              />

              <SliderControl
                label="Blur Amount"
                value={state.fractalGlassBlur}
                min={0.0}
                max={1.0}
                step={0.01}
                onChange={(v) => onUpdateState({ fractalGlassBlur: v })}
                onChangeEnd={(v) => onUpdateState({ fractalGlassBlur: v }, true)}
              />
            </div>
          )}
        </div>

        {/* Color Filters & Adjustments */}
        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('filters')}
            className="w-full px-3.5 py-3 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <SunMedium className="w-4 h-4 text-yellow-500" />
              <span>Color Filters</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openSections.filters ? 'rotate-180' : ''}`} />
          </button>

          {openSections.filters && (
            <div className="p-3.5 pt-0 flex flex-col gap-3.5 border-t border-slate-200/60 dark:border-slate-700/40">
              <SliderControl
                label="Brightness"
                value={state.brightness}
                min={0.0}
                max={2.0}
                step={0.01}
                onChange={(v) => onUpdateState({ brightness: v })}
                onChangeEnd={(v) => onUpdateState({ brightness: v }, true)}
              />

              <SliderControl
                label="Contrast"
                value={state.contrast}
                min={0.0}
                max={2.0}
                step={0.01}
                onChange={(v) => onUpdateState({ contrast: v })}
                onChangeEnd={(v) => onUpdateState({ contrast: v }, true)}
              />

              <SliderControl
                label="Hue Rotation"
                value={state.hue}
                min={0}
                max={360}
                step={1}
                isAngle={true}
                onChange={(v) => onUpdateState({ hue: v })}
                onChangeEnd={(v) => onUpdateState({ hue: v }, true)}
              />
            </div>
          )}
        </div>

        {/* Animation & Seed */}
        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden mb-6">
          <div className="px-3.5 py-3 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/40">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Live Animate
              </span>
            </div>
            <ToggleSwitch
              size="sm"
              checked={state.animate}
              onChange={(checked) => onUpdateState({ animate: checked }, true)}
            />
          </div>

          <div className="p-3.5 flex flex-col gap-3.5">
            {state.animate && (
              <SliderControl
                label="Animation Speed"
                value={state.speed}
                min={0.1}
                max={5.0}
                step={0.05}
                onChange={(v) => onUpdateState({ speed: v })}
                onChangeEnd={(v) => onUpdateState({ speed: v }, true)}
              />
            )}

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Random Seed</span>
              <button
                type="button"
                onClick={onShuffleSeed}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3 h-3 text-slate-400" />
                <span>Shuffle Seed ({Math.round(state.seed)})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
