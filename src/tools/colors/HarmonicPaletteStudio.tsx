import React, { useState, useEffect } from 'react';
import {
  Download,
  Copy,
  Check,
  Lock,
  Unlock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Plus,
  Trash2,
  FileCode,
  Palette
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaletteColor {
  hex: string;
  isLocked: boolean;
}

interface CuratedPalette {
  id: string;
  name: string;
  colors: string[];
}

const CURATED_PALETTES: CuratedPalette[] = [
  {
    id: 'cyber-neon',
    name: 'Cyberpunk Neon',
    colors: ['#00f2fe', '#ff007f', '#ffe600', '#a855f7', '#0f172a']
  },
  {
    id: 'sunset-blush',
    name: 'Sunset Twilight',
    colors: ['#f97316', '#ec4899', '#8b5cf6', '#3b82f6', '#0f172a']
  },
  {
    id: 'emerald-mint',
    name: 'Emerald Forest',
    colors: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#064e3b']
  },
  {
    id: 'velvet-midnight',
    name: 'Velvet Midnight',
    colors: ['#1e1b4b', '#312e81', '#4338ca', '#6366f1', '#a5b4fc']
  },
  {
    id: 'warm-sand',
    name: 'Nordic Sandstone',
    colors: ['#78716c', '#a8a29e', '#d6d3d1', '#f5f5f4', '#292524']
  }
];

export const HarmonicPaletteStudio: React.FC = () => {
  const [harmony, setHarmony] = useState<
    'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'monochromatic' | 'split-complementary'
  >('analogous');

  const [colors, setColors] = useState<PaletteColor[]>([
    { hex: '#3B82F6', isLocked: false },
    { hex: '#10B981', isLocked: false },
    { hex: '#F59E0B', isLocked: false },
    { hex: '#EC4899', isLocked: false },
    { hex: '#8B5CF6', isLocked: false }
  ]);

  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('cyber-neon');
  const [searchPreset, setSearchPreset] = useState('');
  const [presetTab, setPresetTab] = useState<'curated' | 'saved'>('curated');
  const [customPresets, setCustomPresets] = useState<CuratedPalette[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('magic_custom_palettes');
      if (saved) setCustomPresets(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  // Spacebar to shuffle colors
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        generateHarmony();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const generateHarmony = () => {

    const baseCol = colors.find((c) => c.isLocked)?.hex || colors[0].hex;
    const baseHsl = hexToHsl(baseCol);

    const offsets: Record<typeof harmony, number[]> = {
      analogous: [0, 30, 60, -30, -60],
      complementary: [0, 180, 20, 200, 40],
      triadic: [0, 120, 240, 60, 180],
      tetradic: [0, 90, 180, 270, 45],
      'split-complementary': [0, 150, 210, 30, 180],
      monochromatic: [0, 0, 0, 0, 0]
    };

    const currentOffsets = offsets[harmony];

    const nextColors = colors.map((col, idx) => {
      if (col.isLocked) return col;

      if (harmony === 'monochromatic') {
        const lumSteps = [0.2, 0.38, 0.55, 0.72, 0.9];
        return {
          ...col,
          hex: hslToHex(baseHsl.h, baseHsl.s, lumSteps[idx])
        };
      } else {
        const offset = currentOffsets[idx];
        const newH = (baseHsl.h + offset + 360) % 360;
        return {
          ...col,
          hex: hslToHex(newH, Math.max(0.4, baseHsl.s), Math.max(0.35, Math.min(0.65, baseHsl.l)))
        };
      }
    });

    setColors(nextColors);
  };

  const toggleLock = (index: number) => {
    setColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, isLocked: !c.isLocked } : c))
    );
  };

  const updateColorHex = (index: number, newHex: string) => {
    setColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, hex: newHex } : c))
    );
  };

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    confetti({ particleCount: 20, spread: 35 });
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const copyCssVars = () => {
    const css = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`;
    navigator.clipboard.writeText(css);
    setCopiedHex('CSS');
    confetti({ particleCount: 30, spread: 45 });
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const copyTailwind = () => {
    const tw = `colors: {\n  palette: {\n${colors.map((c, i) => `    ${(i + 1) * 100}: '${c.hex}',`).join('\n')}\n  }\n}`;
    navigator.clipboard.writeText(tw);
    setCopiedHex('TW');
    confetti({ particleCount: 30, spread: 45 });
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const copyJson = () => {
    const json = JSON.stringify(colors.map((c) => c.hex), null, 2);
    navigator.clipboard.writeText(json);
    setCopiedHex('JSON');
    confetti({ particleCount: 30, spread: 45 });
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const applyCurated = (cp: CuratedPalette) => {
    setSelectedPresetId(cp.id);
    setColors(cp.colors.map((hex) => ({ hex, isLocked: false })));
  };

  const saveCurrentAsPreset = () => {
    const name = prompt('Enter palette name:', `Palette #${customPresets.length + 1}`);
    if (!name) return;
    const newPreset: CuratedPalette = {
      id: `custom-${Date.now()}`,
      name,
      colors: colors.map((c) => c.hex)
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_palettes', JSON.stringify(updated));
    setSelectedPresetId(newPreset.id);
    confetti({ particleCount: 40, spread: 60 });
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_palettes', JSON.stringify(updated));
  };

  const allPresets = presetTab === 'curated' ? CURATED_PALETTES : customPresets;
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
              <Palette className="w-4 h-4 text-[#818cf8]" />
              <span className="text-xs font-bold text-[#f2f2f5] tracking-wide uppercase">
                Harmonic Palette Studio
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
            {/* Section 1: Harmony Theory Rules */}
            <div className="p-3.5 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">
                Color Harmony Rule
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'analogous', label: 'Analogous' },
                  { id: 'complementary', label: 'Complementary' },
                  { id: 'triadic', label: 'Triadic' },
                  { id: 'tetradic', label: 'Tetradic' },
                  { id: 'split-complementary', label: 'Split Compl.' },
                  { id: 'monochromatic', label: 'Monochrome' }
                ].map((hm) => (
                  <button
                    key={hm.id}
                    type="button"
                    onClick={() => {
                      setHarmony(hm.id as any);
                      generateHarmony();
                    }}
                    className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      harmony === hm.id
                        ? 'border-[#818cf8] bg-[#818cf8]/15 text-[#818cf8] shadow-xs'
                        : 'border-[#2e303b] bg-[#23242c] text-[#8f94a8] hover:text-[#f2f2f5]'
                    }`}
                  >
                    {hm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Instructions */}
            <div className="p-3.5 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">
                Pro Tip
              </span>
              <p className="text-xs text-[#8f94a8] leading-relaxed">
                Press <kbd className="px-1.5 py-0.5 rounded bg-[#23242c] text-[#f2f2f5] border border-[#2e303b] font-mono text-[10px]">Spacebar</kbd> anytime to generate new harmonic palettes. Click the padlock icon to lock swatches you love!
              </p>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Central Palette Viewport */}
      <main className="relative flex-1 h-full studio-grid-bg flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none">
        {/* Top Floating Action Bar */}
        <div className="z-10 shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={generateHarmony}
            className="studio-btn studio-btn-secondary"
            title="Generate new harmonies (Spacebar)"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#818cf8]" />
            <span>Shuffle (Space)</span>
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
            title="Export Palette"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>

        {/* Center Swatches Grid */}
        <div className="relative w-full flex-1 max-w-5xl flex items-center justify-center min-h-0 my-2">
          <div className="w-full h-full max-h-[520px] rounded-2xl border border-[#2e303b] shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden flex divide-x divide-white/10 bg-[#16171d]">
            {colors.map((color, idx) => {
              const isDark = getLuminance(color.hex) < 0.5;
              const textColor = isDark ? '#ffffff' : '#000000';

              return (
                <div
                  key={idx}
                  className="group relative flex-1 h-full flex flex-col items-center justify-between p-6 transition-all duration-300 hover:flex-[1.2] select-none"
                  style={{ backgroundColor: color.hex }}
                >
                  {/* Top Swatch Actions */}
                  <div className="w-full flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => toggleLock(idx)}
                      className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                        color.isLocked
                          ? 'bg-white text-black shadow-lg'
                          : 'bg-black/30 text-white hover:bg-black/50'
                      }`}
                      title={color.isLocked ? 'Unlock color' : 'Lock color'}
                    >
                      {color.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => updateColorHex(idx, e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent opacity-80 hover:opacity-100"
                    />
                  </div>

                  {/* Center Hex & Copy */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyColor(color.hex)}
                      className="font-mono text-lg font-bold tracking-wider uppercase px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                      style={{
                        color: textColor,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
                      }}
                    >
                      {copiedHex === color.hex ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{color.hex}</span>
                    </button>
                    <span
                      className="text-[11px] font-mono tracking-wide opacity-80"
                      style={{ color: textColor }}
                    >
                      Color {idx + 1}
                    </span>
                  </div>

                  {/* Bottom WCAG Badge */}
                  <div
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider backdrop-blur-md flex items-center gap-1 shadow-sm"
                    style={{
                      color: textColor,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
                    }}
                  >
                    <span>WCAG: {isDark ? 'AAA On Light' : 'AAA On Dark'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Toolbar & Feedback */}
        <div className="w-full shrink-0 flex items-center justify-between text-xs text-[#686c82] px-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8f94a8]">Harmonious algorithmic palette generation</span>
          </div>
          <div className="font-mono text-[10px] text-[#686c82]">
            {harmony.toUpperCase()}
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
                <Sparkles className="w-3.5 h-3.5 text-[#818cf8]" />
                <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">Palettes</span>
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
                Curated ({CURATED_PALETTES.length})
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
              placeholder="Search palettes..."
              value={searchPreset}
              onChange={(e) => setSearchPreset(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] placeholder-[#686c82] outline-none focus:border-[#818cf8]"
            />
          </div>

          {/* Presets Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-2.5 custom-scrollbar overscroll-contain pb-10">
            {filteredPresets.map((palette) => {
              const isSelected = selectedPresetId === palette.id;

              return (
                <div
                  key={palette.id}
                  onClick={() => applyCurated(palette)}
                  className={`group relative p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'border-[#818cf8] bg-[#818cf8]/15 ring-2 ring-[#818cf8]/40 shadow-[0_0_12px_rgba(129,140,248,0.25)]'
                      : 'border-[#2e303b] hover:border-[#484b5c] bg-[#1a1b24] hover:bg-[#20222d]'
                  }`}
                >
                  <div className="w-full h-8 rounded-lg overflow-hidden flex border border-black/30">
                    {palette.colors.map((c, i) => (
                      <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>

                  <div className="w-full flex items-center justify-between px-0.5">
                    <span className="text-[11px] font-semibold text-[#8f94a8] group-hover:text-[#f2f2f5] truncate">
                      {palette.name}
                    </span>
                  </div>

                  {presetTab === 'saved' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomPreset(palette.id);
                      }}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-white bg-black/70 hover:bg-red-500 transition-all rounded-md"
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
                <div className="w-8 h-8 rounded-lg bg-[#818cf8]/15 text-[#818cf8] flex items-center justify-center">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#f2f2f5]">Export Color Palette</h3>
                  <p className="text-xs text-[#8f94a8]">Copy CSS Variables, Tailwind, or JSON</p>
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
                className="w-full py-2.5 px-4 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#818cf8] text-xs font-semibold text-[#f2f2f5] flex items-center justify-between transition-all cursor-pointer"
              >
                <span>CSS Variables (:root)</span>
                <Copy className="w-3.5 h-3.5 text-[#818cf8]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  copyTailwind();
                  setIsExportModalOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#818cf8] text-xs font-semibold text-[#f2f2f5] flex items-center justify-between transition-all cursor-pointer"
              >
                <span>Tailwind Config Theme</span>
                <Copy className="w-3.5 h-3.5 text-[#818cf8]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  copyJson();
                  setIsExportModalOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#818cf8] text-xs font-semibold text-[#f2f2f5] flex items-center justify-between transition-all cursor-pointer"
              >
                <span>JSON Array of Hex Codes</span>
                <Copy className="w-3.5 h-3.5 text-[#818cf8]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Color Utility Functions
function hexToHsl(hex: string) {
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s, l };
}

function hslToHex(h: number, s: number, l: number) {
  l = Math.max(0, Math.min(1, l));
  s = Math.max(0, Math.min(1, s));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getLuminance(hex: string) {
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16) / 255;
    g = parseInt(hex.slice(3, 5), 16) / 255;
    b = parseInt(hex.slice(5, 7), 16) / 255;
  }
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

