import React, { useState } from 'react';
import {
  Grid,
  Film,
  Play,
  RotateCw,
  Eye,
  ChevronDown,
  Layers,
  Sparkles,
  Maximize2,
  Sliders,
  Video,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import type { AppMode, CanvasDimensions, EasingType, ShaderState, VideoProject } from '../../types/shader';
import { ColorPickerGroup } from '../controls/ColorPickerGroup';
import { SliderControl } from '../controls/SliderControl';
import { ToggleSwitch } from '../controls/ToggleSwitch';
import { CANVAS_SIZE_PRESETS } from '../../data/canvasSizes';

interface LeftSidebarProps {
  state: ShaderState;
  dimensions: CanvasDimensions;
  mode?: AppMode;
  project?: VideoProject;
  selectedKeyframeId?: string | null;
  onSelectKeyframe?: (id: string) => void;
  onUpdateKeyframeEasing?: (id: string, easing: EasingType) => void;
  onRemoveKeyframe?: (id: string) => void;
  onChangeDuration?: (dur: number) => void;
  onUpdateState: (updates: Partial<ShaderState>, commit?: boolean) => void;
  onUpdateDimensions: (dimensions: CanvasDimensions) => void;
  onShuffleColors: () => void;
  onShuffleSeed: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  state,
  dimensions,
  mode = 'image',
  project,
  selectedKeyframeId,
  onSelectKeyframe,
  onUpdateKeyframeEasing,
  onRemoveKeyframe,
  onChangeDuration,
  onUpdateState,
  onUpdateDimensions,
  onShuffleColors,
  onShuffleSeed
}) => {
  // Accordion section states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    video: true,
    colors: true,
    customize: true,
    effects: true,
    filters: false,
    canvasSize: false,
    animation: true
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCustomDimension = (key: 'width' | 'height', val: number) => {
    const clamped = Math.max(100, Math.min(8000, val));
    const next: CanvasDimensions = {
      ...dimensions,
      [key]: clamped,
      label: `Custom (${key === 'width' ? clamped : dimensions.width}x${key === 'height' ? clamped : dimensions.height})`,
      aspectRatio: `${key === 'width' ? clamped : dimensions.width}:${key === 'height' ? clamped : dimensions.height}`
    };
    onUpdateDimensions(next);
  };

  // Video keyframe helpers
  const keyframes = project?.keyframes || [];
  const selectedIndex = keyframes.findIndex((k) => k.id === selectedKeyframeId);
  const activeKf = selectedIndex !== -1 ? keyframes[selectedIndex] : keyframes[0];
  const activeIndex = selectedIndex !== -1 ? selectedIndex : 0;


  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="w-10 h-full shrink-0 border-r border-[#23242c] bg-[#16171d] flex flex-col items-center py-4 z-20">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 rounded-lg text-[#8f94a8] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
          title="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-80 h-full min-h-0 shrink-0 border-r border-[#23242c] bg-[#16171d] overflow-y-auto overflow-x-hidden z-20 custom-scrollbar overscroll-contain pb-12 select-none relative">
      {/* Collapse button on top-right */}
      <button
        type="button"
        onClick={() => setIsCollapsed(true)}
        className="absolute top-3 right-3 p-1 rounded-md text-[#686c82] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer z-30"
        title="Collapse sidebar"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      <div className="flex flex-col w-full min-h-max">
        {/* Video Mode Timeline Keyframe Header */}
        {mode === 'video' && project && (
          <div className="border-b border-[#23242c] bg-[#1a1b24] overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('video')}
              className="w-full px-3.5 py-3 flex items-center justify-between text-[11px] font-bold text-[#818cf8] tracking-wider uppercase hover:bg-[#20222e] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Video className="w-3.5 h-3.5 text-[#818cf8]" />
                <span>Video</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#818cf8] transition-transform duration-200 ${
                  openSections.video ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openSections.video && (
              <div className="p-3.5 pt-0 flex flex-col gap-3">
                {/* Duration control */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-[#8f94a8] tracking-wider uppercase">
                    Duration
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={project.duration}
                      onChange={(e) => onChangeDuration && onChangeDuration(parseFloat(e.target.value) || 5)}
                      className="w-14 px-2 py-1 text-xs font-mono font-semibold text-right bg-[#23242c] rounded-lg border border-[#2e303b] text-[#f2f2f5] outline-none focus:border-[#6268f8]"
                    />
                    <span className="text-xs text-[#686c82] font-medium">sec</span>
                  </div>
                </div>

                {/* Keyframe selector & stepper */}
                {activeKf && (
                  <div className="p-2.5 rounded-xl bg-[#23242c] border border-[#2e303b] flex flex-col gap-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Diamond Badge */}
                        <div className="w-5 h-5 rounded bg-[#6268f8] text-white text-[10px] font-extrabold flex items-center justify-center rotate-45 shadow-[0_0_8px_rgba(98,104,248,0.5)]">
                          <span className="-rotate-45">{activeIndex + 1}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#f2f2f5]">
                            Keyframe {activeIndex + 1} of {keyframes.length}
                          </span>
                          <span className="text-[10px] font-mono text-[#8f94a8]">
                            at {activeKf.time.toFixed(2)}s
                          </span>
                        </div>
                      </div>

                      {/* Stepper buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={activeIndex <= 0}
                          onClick={() => onSelectKeyframe && onSelectKeyframe(keyframes[activeIndex - 1].id)}
                          className="p-1 rounded-lg border border-[#2e303b] bg-[#1a1b24] hover:bg-[#2e303b] text-[#f2f2f5] disabled:opacity-30 transition-all cursor-pointer"
                          title="Previous Keyframe"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={activeIndex >= keyframes.length - 1}
                          onClick={() => onSelectKeyframe && onSelectKeyframe(keyframes[activeIndex + 1].id)}
                          className="p-1 rounded-lg border border-[#2e303b] bg-[#1a1b24] hover:bg-[#2e303b] text-[#f2f2f5] disabled:opacity-30 transition-all cursor-pointer"
                          title="Next Keyframe"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        {keyframes.length > 1 && onRemoveKeyframe && (
                          <button
                            type="button"
                            onClick={() => onRemoveKeyframe(activeKf.id)}
                            className="p-1 rounded-lg border border-[#2e303b] bg-[#1a1b24] hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40 text-[#8f94a8] transition-all cursor-pointer ml-1"
                            title="Delete Keyframe"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Easing Selector */}
                    <div className="pt-2 border-t border-[#2e303b] flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-[#8f94a8] tracking-wider uppercase">
                        Easing
                      </span>
                      <select
                        value={activeKf.easing}
                        onChange={(e) => onUpdateKeyframeEasing && onUpdateKeyframeEasing(activeKf.id, e.target.value as EasingType)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#1a1b24] border border-[#2e303b] text-[#f2f2f5] outline-none cursor-pointer focus:border-[#6268f8]"
                      >
                        <option value="linear">Linear</option>
                        <option value="easeInOut">Ease In/Out</option>
                        <option value="easeIn">Ease In</option>
                        <option value="easeOut">Ease Out</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Colors Panel */}
        <div className="p-3.5 border-b border-[#23242c] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase flex items-center gap-1.5">
              <span>Colors</span>
            </span>
          </div>
          <ColorPickerGroup
            colors={state.colors}
            onChange={(cols) => onUpdateState({ colors: cols }, true)}
            onShuffle={onShuffleColors}
          />
        </div>

        {/* Customize Panel (Wave, Zoom, Position & Warp) */}
        <div className="border-b border-[#23242c] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('customize')}
            className="w-full px-3.5 py-3 flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:bg-[#1a1b24] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#8f94a8]" />
              <span>Customize</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#8f94a8] transition-transform duration-200 ${
                openSections.customize ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.customize && (
            <div className="p-3.5 pt-0 flex flex-col gap-3.5">
              {/* Position Offset X & Y */}
              <div className="grid grid-cols-2 gap-2.5">
                <SliderControl
                  label="X"
                  value={state.offsetX}
                  min={-2.0}
                  max={2.0}
                  step={0.01}
                  onChange={(v) => onUpdateState({ offsetX: v })}
                  onChangeEnd={(v) => onUpdateState({ offsetX: v }, true)}
                />
                <SliderControl
                  label="Y"
                  value={state.offsetY}
                  min={-2.0}
                  max={2.0}
                  step={0.01}
                  onChange={(v) => onUpdateState({ offsetY: v })}
                  onChangeEnd={(v) => onUpdateState({ offsetY: v }, true)}
                />
              </div>

              {/* Zoom & Rotation */}
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

              {/* Mesh Waves Sub-Header */}
              <div className="pt-2 pb-0.5 border-t border-[#23242c]">
                <span className="text-[10px] font-bold text-[#686c82] tracking-wider uppercase">
                  Mesh Waves
                </span>
              </div>

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

              {/* Distortion Sub-Header */}
              <div className="pt-2 pb-0.5 border-t border-[#23242c]">
                <span className="text-[10px] font-bold text-[#686c82] tracking-wider uppercase">
                  Distortion
                </span>
              </div>

              <SliderControl
                label="Intensity"
                value={state.localWarpIntensity}
                min={0.0}
                max={5.0}
                step={0.1}
                onChange={(v) => onUpdateState({ localWarpIntensity: v })}
                onChangeEnd={(v) => onUpdateState({ localWarpIntensity: v }, true)}
              />

              <SliderControl
                label="Warp"
                value={state.localWarpFreqY}
                min={0.0}
                max={10.0}
                step={0.1}
                onChange={(v) => onUpdateState({ localWarpFreqY: v })}
                onChangeEnd={(v) => onUpdateState({ localWarpFreqY: v }, true)}
              />
            </div>
          )}
        </div>

        {/* Effects Section (Dithering, Grain, Vignette, Fractal Glass) */}
        <div className="border-b border-[#23242c] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('effects')}
            className="w-full px-3.5 py-3 flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:bg-[#1a1b24] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#8f94a8]" />
              <span>Effects</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#8f94a8] transition-transform duration-200 ${
                openSections.effects ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.effects && (
            <div className="p-3.5 pt-0 flex flex-col gap-3">
              {/* Dithering Card */}
              <div className="p-3 rounded-xl border border-[#2e303b] bg-[#1a1b24] flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Grid className="w-3.5 h-3.5 text-[#8f94a8]" />
                    <span className="text-xs font-semibold text-[#f2f2f5]">Dithering</span>
                  </div>
                  <ToggleSwitch
                    size="sm"
                    checked={state.ditherEnabled}
                    onChange={(checked) => onUpdateState({ ditherEnabled: checked }, true)}
                  />
                </div>

                {state.ditherEnabled && (
                  <div className="pt-2 border-t border-[#2e303b] flex flex-col gap-3">
                    <SliderControl
                      label="Levels"
                      value={state.ditherLevels}
                      min={2}
                      max={64}
                      step={1}
                      onChange={(v) => onUpdateState({ ditherLevels: v })}
                      onChangeEnd={(v) => onUpdateState({ ditherLevels: v }, true)}
                    />
                    <SliderControl
                      label="Pattern Size"
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

              {/* Grain Card */}
              <div className="p-3 rounded-xl border border-[#2e303b] bg-[#1a1b24] flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film className="w-3.5 h-3.5 text-[#8f94a8]" />
                    <span className="text-xs font-semibold text-[#f2f2f5]">Grain</span>
                  </div>
                  <ToggleSwitch
                    size="sm"
                    checked={state.grainEnabled}
                    onChange={(checked) => onUpdateState({ grainEnabled: checked }, true)}
                  />
                </div>

                {state.grainEnabled && (
                  <div className="pt-2 border-t border-[#2e303b] flex flex-col gap-3">
                    <SliderControl
                      label="Intensity"
                      value={state.grainIntensity}
                      min={0.0}
                      max={0.2}
                      step={0.001}
                      onChange={(v) => onUpdateState({ grainIntensity: v })}
                      onChangeEnd={(v) => onUpdateState({ grainIntensity: v }, true)}
                    />
                  </div>
                )}
              </div>

              {/* Vignette Card */}
              <div className="p-3 rounded-xl border border-[#2e303b] bg-[#1a1b24] flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-[#8f94a8]" />
                    <span className="text-xs font-semibold text-[#f2f2f5]">Vignette</span>
                  </div>
                  <ToggleSwitch
                    size="sm"
                    checked={state.vignetteEnabled}
                    onChange={(checked) => onUpdateState({ vignetteEnabled: checked }, true)}
                  />
                </div>

                {state.vignetteEnabled && (
                  <div className="pt-2 border-t border-[#2e303b] flex flex-col gap-3">
                    <SliderControl
                      label="Intensity"
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
                      min={0.01}
                      max={1.0}
                      step={0.01}
                      onChange={(v) => onUpdateState({ vignetteRadius: v })}
                      onChangeEnd={(v) => onUpdateState({ vignetteRadius: v }, true)}
                    />
                  </div>
                )}
              </div>

              {/* Fractal Glass Card */}
              <div className="p-3 rounded-xl border border-[#2e303b] bg-[#1a1b24] flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#8f94a8]" />
                    <span className="text-xs font-semibold text-[#f2f2f5]">Fractal Glass</span>
                  </div>
                  <ToggleSwitch
                    size="sm"
                    checked={state.fractalGlassEnabled}
                    onChange={(checked) => onUpdateState({ fractalGlassEnabled: checked }, true)}
                  />
                </div>

                {state.fractalGlassEnabled && (
                  <div className="pt-2 border-t border-[#2e303b] flex flex-col gap-3">
                    <SliderControl
                      label="Steps"
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
                      label="Blur"
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
            </div>
          )}
        </div>

        {/* Filters Section (Brightness, Contrast, Hue) */}
        <div className="border-b border-[#23242c] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('filters')}
            className="w-full px-3.5 py-3 flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:bg-[#1a1b24] transition-colors cursor-pointer"
          >
            <span>Filters</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#8f94a8] transition-transform duration-200 ${
                openSections.filters ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSections.filters && (
            <div className="p-3.5 pt-0 flex flex-col gap-3">
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
                label="Hue"
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

        {/* Canvas Size Section */}
        <div className="border-b border-[#23242c] overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('canvasSize')}
            className="w-full px-3.5 py-3 flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:bg-[#1a1b24] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Maximize2 className="w-3.5 h-3.5 text-[#8f94a8]" />
              <span>Canvas Size</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-[#686c82]">
                {dimensions.width}×{dimensions.height}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#8f94a8] transition-transform duration-200 ${
                  openSections.canvasSize ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {openSections.canvasSize && (
            <div className="p-3.5 pt-0 flex flex-col gap-3">
              {/* Presets List */}
              <div className="grid grid-cols-2 gap-1.5">
                {CANVAS_SIZE_PRESETS.map((preset, i) => {
                  const isSelected =
                    dimensions.width === preset.width && dimensions.height === preset.height;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onUpdateDimensions(preset)}
                      className={`px-2.5 py-1.5 text-left rounded-lg text-xs transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-[#6268f8] bg-[#6268f8]/15 text-[#818cf8] font-semibold shadow-xs'
                          : 'border-[#2e303b] bg-[#1a1b24] text-[#f2f2f5] hover:bg-[#23242c] hover:border-[#3d4050]'
                      }`}
                    >
                      <div className="truncate text-[11px] font-medium">{preset.label}</div>
                      <div className="text-[10px] text-[#686c82] font-mono">
                        {preset.width} × {preset.height}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Width and Height Inputs */}
              <div className="pt-2 border-t border-[#23242c] flex flex-col gap-2">
                <span className="text-[10px] font-bold text-[#8f94a8] tracking-wider uppercase">
                  Custom Dimensions
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#2e303b] bg-[#23242c]">
                    <span className="text-[11px] text-[#8f94a8] font-medium">W:</span>
                    <input
                      type="number"
                      min={100}
                      max={8000}
                      value={dimensions.width}
                      onChange={(e) => handleCustomDimension('width', parseInt(e.target.value) || 1000)}
                      className="w-full text-xs font-mono font-medium text-[#f2f2f5] bg-transparent outline-none"
                    />
                    <span className="text-[10px] text-[#686c82]">px</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#2e303b] bg-[#23242c]">
                    <span className="text-[11px] text-[#8f94a8] font-medium">H:</span>
                    <input
                      type="number"
                      min={100}
                      max={8000}
                      value={dimensions.height}
                      onChange={(e) => handleCustomDimension('height', parseInt(e.target.value) || 1000)}
                      className="w-full text-xs font-mono font-medium text-[#f2f2f5] bg-transparent outline-none"
                    />
                    <span className="text-[10px] text-[#686c82]">px</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Animation & Seed */}
        <div className="border-b border-[#23242c] overflow-hidden">
          <div className="px-3.5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-[#8f94a8]" />
              <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">
                Live Animate
              </span>
            </div>
            <ToggleSwitch
              size="sm"
              checked={state.animate}
              onChange={(checked) => onUpdateState({ animate: checked }, true)}
            />
          </div>

          <div className="p-3.5 pt-0 flex flex-col gap-3">
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
              <span className="text-xs font-medium text-[#f2f2f5]">Random Seed</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={Number.isInteger(state.seed) ? state.seed : Number(state.seed.toFixed(2))}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      onUpdateState({ seed: val }, true);
                    }
                  }}
                  className="w-16 px-2 py-1 text-xs font-mono text-center rounded-lg bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] outline-none focus:border-[#818cf8] transition-colors"
                  placeholder="0"
                  step="any"
                  title="Manually enter seed number"
                />
                <button
                  type="button"
                  onClick={onShuffleSeed}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#2e303b] bg-[#23242c] hover:bg-[#2a2b36] text-xs font-medium text-[#f2f2f5] transition-colors cursor-pointer shadow-xs"
                  title="Shuffle to random seed"
                >
                  <RotateCw className="w-3 h-3 text-[#818cf8]" />
                  <span>Shuffle</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
};

