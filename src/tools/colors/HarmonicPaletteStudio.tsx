import React, { useState, useEffect } from 'react';
import { Copy, Check, Palette, RefreshCw, Lock, Unlock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SegmentedPicker } from '../../components/controls/SegmentedPicker';
import { hexToRgb, rgbToHex } from '../../utils/colorUtils';

type HarmonyType = 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'monochromatic';

export const HarmonicPaletteStudio: React.FC = () => {
  const [baseHex, setBaseHex] = useState<string>('#444CF7');
  const [harmony, setHarmony] = useState<HarmonyType>('analogous');
  const [palette, setPalette] = useState<string[]>([]);
  const [locked, setLocked] = useState<boolean[]>([false, false, false, false, false]);
  const [copied, setCopied] = useState(false);

  // HSL conversion helpers
  const hexToHsl = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
        case gNorm: h = (bNorm - rNorm) / d + 2; break;
        case bNorm: h = (rNorm - gNorm) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s, l };
  };

  const hslToHex = (h: number, s: number, l: number) => {
    h = (h % 360 + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

    return rgbToHex({
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    });
  };

  const generateHarmonies = (hex: string, rule: HarmonyType): string[] => {
    const { h, s, l } = hexToHsl(hex);

    switch (rule) {
      case 'analogous':
        return [
          hslToHex(h - 40, s, l),
          hslToHex(h - 20, s, l),
          hex,
          hslToHex(h + 20, s, l),
          hslToHex(h + 40, s, l)
        ];
      case 'complementary':
        return [
          hslToHex(h, s, Math.min(0.9, l + 0.2)),
          hex,
          hslToHex(h + 180, s, l),
          hslToHex(h + 180, s, Math.min(0.9, l + 0.2)),
          hslToHex(h + 180, s, Math.max(0.1, l - 0.2))
        ];
      case 'triadic':
        return [
          hex,
          hslToHex(h + 120, s, l),
          hslToHex(h + 240, s, l),
          hslToHex(h + 120, s, Math.min(0.9, l + 0.25)),
          hslToHex(h + 240, s, Math.max(0.1, l - 0.25))
        ];
      case 'tetradic':
        return [
          hex,
          hslToHex(h + 90, s, l),
          hslToHex(h + 180, s, l),
          hslToHex(h + 270, s, l),
          hslToHex(h + 90, s, Math.min(0.9, l + 0.2))
        ];
      case 'monochromatic':
        return [
          hslToHex(h, s, 0.15),
          hslToHex(h, s, 0.35),
          hex,
          hslToHex(h, s, 0.70),
          hslToHex(h, s, 0.90)
        ];
    }
  };

  useEffect(() => {
    const generated = generateHarmonies(baseHex, harmony);
    setPalette((prev) => {
      if (prev.length === 0) return generated;
      return generated.map((col, idx) => (locked[idx] ? prev[idx] : col));
    });
  }, [baseHex, harmony]);

  const handleShuffleRandom = () => {
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setBaseHex(randomHex);
  };

  const handleCopyPalette = () => {
    navigator.clipboard.writeText(JSON.stringify(palette, null, 2));
    setCopied(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none">
      {/* Sidebar Controls */}
      <aside className="w-80 h-full min-h-0 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Harmonic Palette Studio
            </span>
          </div>
          <button
            type="button"
            onClick={handleShuffleRandom}
            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Shuffle</span>
          </button>
        </div>

        {/* Harmony Rule */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Color Harmony Rule
          </label>
          <SegmentedPicker<HarmonyType>
            value={harmony}
            onChange={setHarmony}
            options={[
              { value: 'analogous', label: 'Analogous' },
              { value: 'complementary', label: 'Comp.' },
              { value: 'triadic', label: 'Triadic' },
              { value: 'monochromatic', label: 'Mono' }
            ]}
          />
        </div>

        {/* Base Color Picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Key Anchor Color
          </label>
          <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <input
              type="color"
              value={baseHex}
              onChange={(e) => setBaseHex(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
            />
            <input
              type="text"
              value={baseHex.toUpperCase()}
              onChange={(e) => setBaseHex(e.target.value)}
              className="w-24 px-2 py-1 text-xs font-mono rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyPalette}
          className="w-full mt-auto py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied JSON!' : 'Copy Palette JSON'}</span>
        </button>
      </aside>

      {/* Main Preview */}
      <main className="flex-1 canvas-grid-bg flex items-center justify-center p-8 overflow-hidden">
        <div className="w-full max-w-4xl h-[65vh] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 flex">
          {palette.map((hex, idx) => (
            <div
              key={idx}
              className="flex-1 h-full flex flex-col justify-between p-6 transition-all duration-300 group relative"
              style={{ backgroundColor: hex }}
            >
              <button
                type="button"
                onClick={() => {
                  const nextLock = [...locked];
                  nextLock[idx] = !nextLock[idx];
                  setLocked(nextLock);
                }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white cursor-pointer shadow-xs"
              >
                {locked[idx] ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 opacity-60" />}
              </button>

              <div className="flex flex-col gap-1 bg-black/30 backdrop-blur-md p-3 rounded-2xl text-white">
                <span className="text-sm font-mono font-bold">{hex.toUpperCase()}</span>
                <span className="text-[10px] opacity-75">Click to lock</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
