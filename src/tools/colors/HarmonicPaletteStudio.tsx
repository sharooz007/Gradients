import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Copy,
  Check,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Undo2,
  Redo2,
  Bookmark,
  Share2,
  ArrowLeftRight,
  FileCode
} from 'lucide-react';
import confetti from 'canvas-confetti';


type HarmonyMode = 'auto' | 'mono' | 'analogous' | 'complementary' | 'split' | 'triadic' | 'tetradic';

interface PaletteColor {
  id: string;
  hex: string;
  isLocked: boolean;
}

const INITIAL_COLORS: PaletteColor[] = [
  { id: 'c1', hex: '#E8D587', isLocked: false },
  { id: 'c2', hex: '#0E2430', isLocked: false },
  { id: 'c3', hex: '#FC3A51', isLocked: false },
  { id: 'c4', hex: '#F5B349', isLocked: false },
  { id: 'c5', hex: '#E8D589', isLocked: false }
];

export const HarmonicPaletteStudio: React.FC = () => {
  const [harmony, setHarmony] = useState<HarmonyMode>('auto');
  const [colors, setColors] = useState<PaletteColor[]>(INITIAL_COLORS);
  const [activeColorPickerId, setActiveColorPickerId] = useState<string | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<PaletteColor[][]>([INITIAL_COLORS]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Export and Save Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [savedPalettes, setSavedPalettes] = useState<{ id: string; name: string; colors: string[] }[]>([]);


  const colorPickerRef = useRef<HTMLDivElement>(null);
  const paletteContainerRef = useRef<HTMLDivElement>(null);

  // Load saved palettes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('magic_global_palettes');
      if (saved) setSavedPalettes(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setActiveColorPickerId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Push new state to history
  const pushState = (newColors: PaletteColor[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newColors);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setColors(newColors);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      setColors(history[nextIdx]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setColors(history[nextIdx]);
    }
  };

  // Spacebar to generate palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        generatePalette();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Algorithm to generate harmonic palette based on mode
  const generatePalette = () => {
    const lockedFirst = colors.find((c) => c.isLocked)?.hex;
    const baseHex = lockedFirst || getRandomHex();
    const baseHsl = hexToHsl(baseHex);

    const offsets: Record<HarmonyMode, number[]> = {
      auto: [0, 35, 180, 215, 60, 290, 120, 240],
      mono: [0, 0, 0, 0, 0, 0, 0, 0],
      analogous: [0, 25, 50, -25, -50, 75, -75, 100],
      complementary: [0, 180, 15, 195, 30, 210, -15, 165],
      split: [0, 150, 210, 30, 180, 120, 240, 60],
      triadic: [0, 120, 240, 30, 150, 270, 60, 180],
      tetradic: [0, 90, 180, 270, 45, 135, 225, 315]
    };

    const currentOffsets = offsets[harmony];

    const nextColors = colors.map((col, idx) => {
      if (col.isLocked) return col;

      if (harmony === 'mono') {
        const lumSteps = [0.9, 0.75, 0.55, 0.35, 0.18, 0.85, 0.65, 0.45];
        return {
          ...col,
          hex: hslToHex(baseHsl.h, baseHsl.s * 0.7, lumSteps[idx % lumSteps.length])
        };
      } else {
        const offset = currentOffsets[idx % currentOffsets.length];
        const newH = (baseHsl.h + offset + 360) % 360;
        const sat = Math.max(0.35, Math.min(0.9, baseHsl.s + (idx % 2 === 0 ? 0.1 : -0.1)));
        const lum = Math.max(0.2, Math.min(0.85, 0.25 + ((idx * 0.18) % 0.6)));
        return {
          ...col,
          hex: hslToHex(newH, sat, lum)
        };
      }
    });

    pushState(nextColors);
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.4 } });
  };

  const toggleLock = (id: string) => {
    const next = colors.map((c) => (c.id === id ? { ...c, isLocked: !c.isLocked } : c));
    setColors(next);
  };

  const updateColorHex = (id: string, newHex: string) => {
    const next = colors.map((c) => (c.id === id ? { ...c, hex: newHex } : c));
    pushState(next);
  };

  const addColorColumn = () => {
    if (colors.length >= 8) return;
    const baseHsl = hexToHsl(colors[colors.length - 1].hex);
    const newHex = hslToHex((baseHsl.h + 40) % 360, baseHsl.s, 0.5);
    const next = [...colors, { id: `c-${Date.now()}`, hex: newHex, isLocked: false }];
    pushState(next);
    confetti({ particleCount: 25, spread: 45 });
  };

  const removeColorColumn = (id: string) => {
    if (colors.length <= 2) return;
    const next = colors.filter((c) => c.id !== id);
    pushState(next);
  };

  const moveColumn = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= colors.length) return;
    const next = [...colors];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    pushState(next);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHex(text);
    setCopiedToast(`Copied ${label}`);
    setTimeout(() => {
      setCopiedHex(null);
      setCopiedToast(null);
    }, 1800);
  };

  const savePaletteToStorage = () => {
    const defaultName = `Palette #${savedPalettes.length + 1}`;
    const name = prompt('Name your palette:', defaultName);
    if (!name) return;

    const newPal = {
      id: `palette-${Date.now()}`,
      name: name.trim(),
      colors: colors.map((c) => c.hex)
    };
    const updated = [newPal, ...savedPalettes];
    setSavedPalettes(updated);
    localStorage.setItem('magic_global_palettes', JSON.stringify(updated));
    confetti({ particleCount: 40, spread: 60 });
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar select-none bg-[#0e0f14] text-[#f2f2f5] relative">
      {/* 1. Top Global Navigation / Action Bar */}
      <header className="w-full shrink-0 px-6 py-3 border-b border-[#23242c] bg-[#16171d] flex items-center justify-between z-20">
        {/* Left: Undo / Redo controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-xl text-[#8f94a8] hover:text-[#f2f2f5] hover:bg-[#23242c] disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-xl text-[#8f94a8] hover:text-[#f2f2f5] hover:bg-[#23242c] disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Center Harmony Selector Segmented Pills */}
        <div className="flex items-center p-1 rounded-full bg-[#0e0f14] border border-[#2e303b] text-xs">
          {(
            [
              { id: 'auto', label: 'Auto' },
              { id: 'mono', label: 'Mono' },
              { id: 'analogous', label: 'Analogous' },
              { id: 'complementary', label: 'Complementary' },
              { id: 'split', label: 'Split' },
              { id: 'triadic', label: 'Triadic' },
              { id: 'tetradic', label: 'Tetradic' }
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setHarmony(item.id);
                generatePalette();
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                harmony === item.id
                  ? 'bg-white text-black shadow-md'
                  : 'text-[#8f94a8] hover:text-[#f2f2f5]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Generate Palette Spacebar button */}
          <button
            type="button"
            onClick={generatePalette}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-md cursor-pointer transform hover:scale-[1.02]"
            title="Generate new palette (Spacebar)"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6366f1]" />
            <span>Generate Palette</span>
            <kbd className="px-1.5 py-0.5 rounded bg-black/10 text-black/70 font-mono text-[10px] font-semibold border border-black/15">
              SPACEBAR
            </kbd>
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={savePaletteToStorage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2a2b36] text-xs font-semibold text-[#f2f2f5] transition-all cursor-pointer"
            title="Save Palette"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#818cf8]" />
            <span>Save</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={() => {
              const url = `${window.location.origin}${window.location.pathname}#palette=${colors.map((c) => c.hex.replace('#', '')).join('-')}`;
              copyToClipboard(url, 'Shareable Link');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2a2b36] text-xs font-semibold text-[#f2f2f5] transition-all cursor-pointer"
            title="Copy Shareable Link"
          >
            <Share2 className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Share</span>
          </button>

          {/* Export Modal Button */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-xs font-bold text-white transition-all cursor-pointer shadow-md"
            title="Export Palette"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

        </div>
      </header>

      {/* 2. Main Center Canvas & Tints Section */}
      <main className="flex-1 studio-grid-bg flex flex-col items-center justify-start p-6 sm:p-10 gap-8">
        {/* Main Palette Columns Box */}
        <div className="relative w-full max-w-5xl flex items-center justify-center">
          {/* Main Color Swatches Container */}
          <div
            ref={paletteContainerRef}
            className="relative w-full h-[360px] sm:h-[400px] rounded-3xl border border-[#2e303b] shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden flex divide-x divide-black/10 bg-[#16171d]"
          >
            {colors.map((color, index) => {
              const isDark = getLuminance(color.hex) < 0.5;
              const textColor = isDark ? '#ffffff' : '#000000';
              const cleanHex = color.hex.replace('#', '').toUpperCase();
              const isPickerOpen = activeColorPickerId === color.id;

              return (
                <div
                  key={color.id}
                  className="group relative flex-1 h-full flex flex-col justify-between p-5 transition-all duration-300 select-none"
                  style={{ backgroundColor: color.hex }}
                >
                  {/* Floating Action Toolbar (Appears on Column Hover) */}
                  <div className="w-full flex justify-end">
                    <div
                      className={`flex flex-col items-center gap-1.5 p-1.5 rounded-2xl backdrop-blur-xl border border-white/20 transition-all duration-200 shadow-xl ${
                        color.isLocked || isPickerOpen
                          ? 'opacity-100 bg-black/40'
                          : 'opacity-0 group-hover:opacity-100 bg-black/30'
                      }`}
                    >
                      {/* 1. Lock / Unlock */}
                      <button
                        type="button"
                        onClick={() => toggleLock(color.id)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          color.isLocked
                            ? 'bg-white text-black shadow-md'
                            : 'text-white/80 hover:text-white hover:bg-white/20'
                        }`}
                        title={color.isLocked ? 'Unlock color' : 'Lock color'}
                      >
                        {color.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>

                      {/* 2. Edit Color */}
                      <button
                        type="button"
                        onClick={() => setActiveColorPickerId(isPickerOpen ? null : color.id)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          isPickerOpen
                            ? 'bg-white text-black shadow-md'
                            : 'text-white/80 hover:text-white hover:bg-white/20'
                        }`}
                        title="Edit color"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* 3. Copy Hex */}
                      <button
                        type="button"
                        onClick={() => copyToClipboard(color.hex, color.hex)}
                        className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                        title="Copy HEX code"
                      >
                        {copiedHex === color.hex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {/* 4. Move Left/Right */}
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => moveColumn(index, 'left')}
                          className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                          title="Move left"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* 5. Delete Column */}
                      {colors.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeColorColumn(color.id)}
                          className="p-2 rounded-xl text-white/80 hover:text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                          title="Delete color"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Popover Color Picker Dropdown */}
                  {isPickerOpen && (
                    <div
                      ref={colorPickerRef}
                      className="absolute top-20 right-4 z-50 p-3 bg-[#16171d] rounded-2xl shadow-2xl border border-[#2e303b] flex flex-col gap-2.5 min-w-[180px] animate-in fade-in"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color.hex}
                          onChange={(e) => updateColorHex(color.id, e.target.value)}
                          className="w-9 h-9 rounded-xl cursor-pointer border border-[#2e303b] p-0.5 bg-transparent"
                        />
                        <input
                          type="text"
                          value={color.hex.toUpperCase()}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val.startsWith('#') && val.length <= 7) {
                              updateColorHex(color.id, val);
                            } else if (!val.startsWith('#') && val.length <= 6) {
                              updateColorHex(color.id, '#' + val);
                            }
                          }}
                          className="flex-1 px-2.5 py-1.5 text-xs font-mono font-bold rounded-xl bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] outline-none focus:border-[#818cf8]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Bottom Hex Code Display */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(color.hex, color.hex)}
                      className="font-mono text-base sm:text-lg font-black tracking-wider uppercase px-3 py-1 rounded-xl transition-all cursor-pointer transform hover:scale-105"
                      style={{ color: textColor }}
                      title="Click to copy HEX"
                    >
                      {cleanHex}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Right (+) Add Color Button */}
          {colors.length < 8 && (
            <button
              type="button"
              onClick={addColorColumn}
              className="absolute -right-5 z-20 w-10 h-10 rounded-full bg-white text-black hover:bg-neutral-200 border-2 border-[#0e0f14] shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 cursor-pointer"
              title="Add color column (+)"
            >
              <Plus className="w-5 h-5 font-bold" />
            </button>
          )}
        </div>

        {/* 3. Tints & Shades Columns Underneath */}
        <div className="w-full max-w-5xl flex gap-3 sm:gap-4 items-start justify-center">
          {colors.map((color) => {
            const tintsAndShades = generateTintsAndShades(color.hex, 10);

            return (
              <div key={`ts-${color.id}`} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-[#8f94a8] uppercase tracking-wider">
                  TINTS & SHADES
                </span>

                <div className="w-full rounded-2xl border border-[#2e303b] overflow-hidden bg-[#16171d] shadow-xl flex flex-col divide-y divide-black/15">
                  {tintsAndShades.map((shadeHex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => copyToClipboard(shadeHex, shadeHex)}
                      className="w-full h-6 sm:h-7 transition-all duration-150 hover:scale-[1.04] hover:z-10 cursor-pointer relative group flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: shadeHex }}
                      title={`Copy ${shadeHex.toUpperCase()}`}
                    >
                      <span className="opacity-0 group-hover:opacity-100 font-mono text-[9px] font-black px-1.5 py-0.5 rounded bg-black/70 text-white shadow-md transition-opacity">
                        {shadeHex.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Copied Toast */}
      {copiedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#16171d] border border-[#2e303b] text-xs font-bold text-[#f2f2f5] shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#16171d] rounded-3xl shadow-2xl border border-[#2e303b] overflow-hidden flex flex-col text-[#f2f2f5]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#23242c]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#6366f1]/15 text-[#818cf8] flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#f2f2f5]">Export Color Palette</h3>
                  <p className="text-xs text-[#8f94a8]">Export formats & code snippets</p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1.5 rounded-lg text-[#686c82] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  const css = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`;
                  copyToClipboard(css, 'CSS Variables');
                  setIsExportModalOpen(false);
                }}
                className="w-full py-3 px-4 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#818cf8] text-xs font-semibold text-[#f2f2f5] flex items-center justify-between transition-all cursor-pointer"
              >
                <span>CSS Variables (:root)</span>
                <FileCode className="w-3.5 h-3.5 text-[#818cf8]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const tw = `colors: {\n  palette: {\n${colors.map((c, i) => `    ${(i + 1) * 100}: '${c.hex}',`).join('\n')}\n  }\n}`;
                  copyToClipboard(tw, 'Tailwind Theme');
                  setIsExportModalOpen(false);
                }}
                className="w-full py-3 px-4 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#818cf8] text-xs font-semibold text-[#f2f2f5] flex items-center justify-between transition-all cursor-pointer"
              >
                <span>Tailwind Config Theme</span>
                <Copy className="w-3.5 h-3.5 text-[#818cf8]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const json = JSON.stringify(colors.map((c) => c.hex), null, 2);
                  copyToClipboard(json, 'JSON Array');
                  setIsExportModalOpen(false);
                }}
                className="w-full py-3 px-4 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#818cf8] text-xs font-semibold text-[#f2f2f5] flex items-center justify-between transition-all cursor-pointer"
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

// Generate 10 tints & shades for a base hex
function generateTintsAndShades(hex: string, steps: number = 10): string[] {
  const tintsCount = Math.floor(steps / 2);
  const shadesCount = steps - tintsCount;

  // Tints (towards #ffffff)
  const tints: string[] = [];
  for (let i = tintsCount; i >= 1; i--) {
    const factor = i / (tintsCount + 1);
    tints.push(interpolateColor(hex, '#ffffff', factor));
  }

  // Shades (towards #000000)
  const shades: string[] = [];
  for (let i = 1; i <= shadesCount; i++) {
    const factor = i / (shadesCount + 1);
    shades.push(interpolateColor(hex, '#000000', factor));
  }

  return [...tints, ...shades];
}

// Interpolate between two colors
function interpolateColor(c1: string, c2: string, factor: number): string {
  const rgb1 = hexToRgb(c1);
  const rgb2 = hexToRgb(c2);

  const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
  const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
  const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));

  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string) {
  let clean = hex.replace('#', '');
  if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getRandomHex(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

function hexToHsl(hex: string) {
  let { r, g, b } = hexToRgb(hex);
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

  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
}


