import React, { useState, useEffect } from 'react';
import {
  Download,
  Copy,
  Check,
  SunMedium,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Plus,
  Trash2,
  FileCode
} from 'lucide-react';
import confetti from 'canvas-confetti';


interface BaseColorPreset {
  id: string;
  name: string;
  hex: string;
}

const CURATED_BASE_COLORS: BaseColorPreset[] = [
  { id: 'electric-indigo', name: 'Electric Indigo', hex: '#6268f8' },
  { id: 'cyber-cyan', name: 'Cyberpunk Cyan', hex: '#00f2fe' },
  { id: 'neon-rose', name: 'Neon Rose', hex: '#f43f5e' },
  { id: 'emerald-mint', name: 'Emerald Green', hex: '#10b981' },
  { id: 'amber-flare', name: 'Solar Amber', hex: '#f59e0b' },
  { id: 'amethyst-purple', name: 'Amethyst Purple', hex: '#a855f7' }
];

export const ColorTintsShadesStudio: React.FC = () => {
  const [baseColor, setBaseColor] = useState<string>(CURATED_BASE_COLORS[0].hex);
  const [steps, setSteps] = useState<number>(10);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('electric-indigo');
  const [searchPreset, setSearchPreset] = useState('');
  const [presetTab, setPresetTab] = useState<'curated' | 'saved'>('curated');
  const [customPresets, setCustomPresets] = useState<BaseColorPreset[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('magic_custom_tint_presets');
      if (saved) setCustomPresets(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  // Generate Tints (mixed with white #ffffff)
  const tints = Array.from({ length: steps }, (_, i) => {
    const factor = (i + 1) / (steps + 1);
    return interpolateColor(baseColor, '#ffffff', 1 - factor);
  });

  // Generate Shades (mixed with black #000000)
  const shades = Array.from({ length: steps }, (_, i) => {
    const factor = (i + 1) / (steps + 1);
    return interpolateColor(baseColor, '#000000', factor);
  });

  // Generate Tones (mixed with neutral gray #808080)
  const tones = Array.from({ length: steps }, (_, i) => {
    const factor = (i + 1) / (steps + 1);
    return interpolateColor(baseColor, '#808080', factor);
  });

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    confetti({ particleCount: 20, spread: 35 });
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const randomize = () => {
    const randomHex = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    setBaseColor(randomHex);
  };

  const copyCssVars = () => {
    const css = `/* Base & Tints/Shades CSS Variables */
:root {
  --color-base: ${baseColor};
${tints.map((c, i) => `  --color-tint-${(i + 1) * 10}: ${c};`).join('\n')}
${shades.map((c, i) => `  --color-shade-${(i + 1) * 10}: ${c};`).join('\n')}
}`;
    navigator.clipboard.writeText(css);
    setCopiedHex('CSS');
    confetti({ particleCount: 30, spread: 45 });
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const copyJson = () => {
    const fullRamp = {
      base: baseColor,
      tints,
      shades,
      tones
    };
    navigator.clipboard.writeText(JSON.stringify(fullRamp, null, 2));
    setCopiedHex('JSON');
    confetti({ particleCount: 30, spread: 45 });
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const saveCurrentAsPreset = () => {
    const name = prompt('Enter color name:', `Tint Look #${customPresets.length + 1}`);
    if (!name) return;
    const newPreset: BaseColorPreset = {
      id: `custom-${Date.now()}`,
      name,
      hex: baseColor
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_tint_presets', JSON.stringify(updated));
    setSelectedPresetId(newPreset.id);
    confetti({ particleCount: 40, spread: 60 });
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_tint_presets', JSON.stringify(updated));
  };

  const allPresets = presetTab === 'curated' ? CURATED_BASE_COLORS : customPresets;
  const filteredPresets = allPresets.filter((p) =>
    p.name.toLowerCase().includes(searchPreset.toLowerCase())
  );

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#0e0f14] text-[#f2f2f5] relative">
      {/* 1. Left Control Sidebar */}
      {isLeftCollapsed ? (
        <div className="w-10 h-full shrink-0 border-r border-[#23242c] bg-[#16171d] flex flex-col items-center py-4 z-20">
          <button
            type="button"
            onClick={() => setIsLeftCollapsed(false)}
            className="p-1.5 rounded-lg text-[#8f94a8] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
            title="Expand controls"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <aside className="w-80 h-full min-h-0 shrink-0 border-r border-[#23242c] bg-[#16171d] flex flex-col z-20 overflow-y-auto overflow-x-hidden custom-scrollbar overscroll-contain pb-12 relative">
          {/* Header */}
          <div className="p-3.5 border-b border-[#23242c] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SunMedium className="w-4 h-4 text-[#fbbf24]" />
              <span className="text-xs font-bold text-[#f2f2f5] tracking-wide uppercase">
                Tints & Shades Studio
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsLeftCollapsed(true)}
              className="p-1 rounded-lg text-[#686c82] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col w-full min-h-max divide-y divide-[#23242c]">
            {/* Section 1: Base Color Picker */}
            <div className="p-3.5 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">
                Anchor Base Color
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-[#2e303b] p-0.5 bg-transparent"
                />
                <input
                  type="text"
                  value={baseColor.toUpperCase()}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] outline-none focus:border-[#fbbf24]"
                />
              </div>
            </div>

            {/* Section 2: Steps Slider */}
            <div className="p-3.5 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#8f94a8]">Ramp Steps</span>
                <span className="font-mono font-bold text-[#f2f2f5]">{steps} steps</span>
              </div>
              <input
                type="range"
                min={5}
                max={16}
                value={steps}
                onChange={(e) => setSteps(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#fbbf24]"
              />
            </div>
          </div>
        </aside>
      )}

      {/* 2. Central Viewport */}
      <main className="relative flex-1 h-full studio-grid-bg flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none">
        {/* Top Floating Action Bar */}
        <div className="z-10 shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={randomize}
            className="studio-btn studio-btn-secondary"
            title="Randomize base color"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>Randomize</span>
          </button>
          <button
            type="button"
            onClick={copyCssVars}
            className="studio-btn studio-btn-secondary"
            title="Copy CSS Variables"
          >
            {copiedHex === 'CSS' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
            <span>{copiedHex === 'CSS' ? 'Copied CSS!' : 'CSS Variables'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="studio-btn studio-btn-primary"
            title="Export Color Data"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>

        {/* Center Ramps Stack */}
        <div className="relative w-full flex-1 max-w-5xl flex flex-col justify-center gap-6 min-h-0 my-2 overflow-y-auto custom-scrollbar p-2">
          {/* 1. Tints Ramp (Towards White) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-[#f2f2f5] tracking-wide flex items-center gap-1.5">
                <span>Tints</span>
                <span className="text-[10px] text-[#8f94a8] font-normal">(Base mixed with White)</span>
              </span>
            </div>
            <div className="h-20 w-full rounded-2xl border border-[#2e303b] shadow-xl overflow-hidden flex divide-x divide-black/20">
              {tints.map((hex, i) => {
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => copyColor(hex)}

                    className="flex-1 h-full flex flex-col items-center justify-end pb-2 group hover:scale-105 transition-all cursor-pointer relative"
                    style={{ backgroundColor: hex }}
                  >
                    <span
                      className="font-mono text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white px-1.5 py-0.5 rounded shadow"
                    >
                      {copiedHex === hex ? 'Copied!' : hex.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Shades Ramp (Towards Black) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-[#f2f2f5] tracking-wide flex items-center gap-1.5">
                <span>Shades</span>
                <span className="text-[10px] text-[#8f94a8] font-normal">(Base mixed with Black)</span>
              </span>
            </div>
            <div className="h-20 w-full rounded-2xl border border-[#2e303b] shadow-xl overflow-hidden flex divide-x divide-black/20">
              {shades.map((hex, i) => {
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => copyColor(hex)}
                    className="flex-1 h-full flex flex-col items-center justify-end pb-2 group hover:scale-105 transition-all cursor-pointer relative"
                    style={{ backgroundColor: hex }}
                  >
                    <span
                      className="font-mono text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white px-1.5 py-0.5 rounded shadow"
                    >
                      {copiedHex === hex ? 'Copied!' : hex.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Tones Ramp (Towards Gray) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-[#f2f2f5] tracking-wide flex items-center gap-1.5">
                <span>Tones</span>
                <span className="text-[10px] text-[#8f94a8] font-normal">(Base mixed with Neutral Gray)</span>
              </span>
            </div>
            <div className="h-20 w-full rounded-2xl border border-[#2e303b] shadow-xl overflow-hidden flex divide-x divide-black/20">
              {tones.map((hex, i) => {
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => copyColor(hex)}
                    className="flex-1 h-full flex flex-col items-center justify-end pb-2 group hover:scale-105 transition-all cursor-pointer relative"
                    style={{ backgroundColor: hex }}
                  >
                    <span
                      className="font-mono text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white px-1.5 py-0.5 rounded shadow"
                    >
                      {copiedHex === hex ? 'Copied!' : hex.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Toolbar */}
        <div className="w-full shrink-0 flex items-center justify-between text-xs text-[#686c82] px-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8f94a8]">Click any swatch to copy HEX code</span>
          </div>
          <div className="font-mono text-[10px] text-[#686c82]">
            BASE: {baseColor.toUpperCase()}
          </div>
        </div>
      </main>

      {/* 3. Right Presets Sidebar */}
      {isRightCollapsed ? (
        <div className="w-10 h-full shrink-0 border-l border-[#23242c] bg-[#16171d] flex flex-col items-center py-4 z-20">
          <button
            type="button"
            onClick={() => setIsRightCollapsed(false)}
            className="p-1.5 rounded-lg text-[#8f94a8] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
            title="Expand presets"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <aside className="w-72 h-full min-h-0 shrink-0 border-l border-[#23242c] bg-[#16171d] flex flex-col z-20 overflow-hidden select-none">
          {/* Header */}
          <div className="p-3.5 shrink-0 border-b border-[#23242c] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">Presets</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={saveCurrentAsPreset}
                  title="Save current look"
                  className="p-1 rounded-lg hover:bg-[#23242c] text-[#8f94a8] hover:text-[#f2f2f5] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsRightCollapsed(true)}
                  title="Collapse presets"
                  className="p-1 rounded-lg hover:bg-[#23242c] text-[#686c82] hover:text-[#f2f2f5] transition-colors cursor-pointer ml-1"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tab switch */}
            <div className="grid grid-cols-2 p-0.5 rounded-full bg-[#23242c] border border-[#2e303b] text-xs">
              <button
                type="button"
                onClick={() => setPresetTab('curated')}
                className={`py-1 rounded-full transition-all cursor-pointer ${
                  presetTab === 'curated'
                    ? 'bg-[#16171d] text-[#f2f2f5] shadow-xs font-semibold'
                    : 'text-[#8f94a8] hover:text-[#f2f2f5]'
                }`}
              >
                Curated ({CURATED_BASE_COLORS.length})
              </button>
              <button
                type="button"
                onClick={() => setPresetTab('saved')}
                className={`py-1 rounded-full transition-all cursor-pointer ${
                  presetTab === 'saved'
                    ? 'bg-[#16171d] text-[#f2f2f5] shadow-xs font-semibold'
                    : 'text-[#8f94a8] hover:text-[#f2f2f5]'
                }`}
              >
                Saved ({customPresets.length})
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search colors..."
              value={searchPreset}
              onChange={(e) => setSearchPreset(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] placeholder-[#686c82] outline-none focus:border-[#fbbf24]"
            />
          </div>

          {/* Presets Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-2.5 custom-scrollbar overscroll-contain pb-10">
            {filteredPresets.map((preset) => {
              const isSelected = selectedPresetId === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    setSelectedPresetId(preset.id);
                    setBaseColor(preset.hex);
                  }}
                  className={`group relative p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'border-[#fbbf24] bg-[#fbbf24]/15 ring-2 ring-[#fbbf24]/40 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                      : 'border-[#2e303b] hover:border-[#484b5c] bg-[#1a1b24] hover:bg-[#20222d]'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg shrink-0 border border-black/30 shadow-inner"
                    style={{ backgroundColor: preset.hex }}
                  />

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-semibold text-[#f2f2f5] truncate">
                      {preset.name}
                    </span>
                    <span className="font-mono text-[10px] text-[#8f94a8]">
                      {preset.hex.toUpperCase()}
                    </span>
                  </div>

                  {presetTab === 'saved' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomPreset(preset.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-white bg-black/70 hover:bg-red-500 transition-all rounded-md"
                      title="Delete preset"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#16171d] rounded-2xl shadow-2xl border border-[#2e303b] overflow-hidden flex flex-col text-[#f2f2f5]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#23242c]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#fbbf24]/15 text-[#fbbf24] flex items-center justify-center">
                  <SunMedium className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#f2f2f5]">Export Tints & Shades</h3>
                  <p className="text-xs text-[#8f94a8]">Copy CSS Variables or JSON</p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 rounded-lg text-[#686c82] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  copyCssVars();
                  setIsExportModalOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#fbbf24] text-xs font-semibold text-[#f2f2f5] flex items-center justify-between transition-all cursor-pointer"
              >
                <span>CSS Variables (:root)</span>
                <Copy className="w-3.5 h-3.5 text-[#fbbf24]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  copyJson();
                  setIsExportModalOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#fbbf24] text-xs font-semibold text-[#f2f2f5] flex items-center justify-between transition-all cursor-pointer"
              >
                <span>JSON Object with Tints & Shades</span>
                <Copy className="w-3.5 h-3.5 text-[#fbbf24]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Interpolate between two hex colors
function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const r = Math.round(c1.r + factor * (c2.r - c1.r));
  const g = Math.round(c1.g + factor * (c2.g - c1.g));
  const b = Math.round(c1.b + factor * (c2.b - c1.b));

  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string) {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, n));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


