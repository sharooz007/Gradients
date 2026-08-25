import React, { useState } from 'react';
import { Copy, Check, Lock, Unlock, RotateCw, Palette } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaletteColor {
  hex: string;
  isLocked: boolean;
}

export const HarmonicPaletteStudio: React.FC = () => {
  const [harmony, setHarmony] = useState<'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'monochromatic'>('analogous');
  const [colors, setColors] = useState<PaletteColor[]>([
    { hex: '#3B82F6', isLocked: false },
    { hex: '#10B981', isLocked: false },
    { hex: '#F59E0B', isLocked: false },
    { hex: '#EC4899', isLocked: false },
    { hex: '#8B5CF6', isLocked: false }
  ]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Generate Harmonious Colors based on Base Color and Harmony Mode
  const generateHarmony = () => {
    const baseHex = colors[0].hex;
    const baseHsl = hexToHsl(baseHex);

    const offsets: Record<typeof harmony, number[]> = {
      analogous: [0, 30, 60, -30, -60],
      complementary: [0, 180, 20, 200, 40],
      triadic: [0, 120, 240, 60, 180],
      tetradic: [0, 90, 180, 270, 45],
      monochromatic: [0, 0, 0, 0, 0]
    };

    const currentOffsets = offsets[harmony];

    const nextColors = colors.map((col, idx) => {
      if (col.isLocked) return col;

      if (harmony === 'monochromatic') {
        const lumSteps = [0.2, 0.4, 0.6, 0.8, 0.95];
        return {
          ...col,
          hex: hslToHex(baseHsl.h, baseHsl.s, lumSteps[idx])
        };
      } else {
        const offset = currentOffsets[idx];
        const newH = (baseHsl.h + offset + 360) % 360;
        return {
          ...col,
          hex: hslToHex(newH, Math.max(0.4, baseHsl.s), Math.max(0.3, Math.min(0.7, baseHsl.l)))
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

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const copyJson = () => {
    const json = JSON.stringify(colors.map((c) => c.hex), null, 2);
    navigator.clipboard.writeText(json);
    setCopiedHex('ALL_JSON');
    setTimeout(() => setCopiedHex(null), 2000);
    confetti({ particleCount: 25, spread: 40 });
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#f5f5f7]">
      {/* Left Control Sidebar */}
      <aside className="w-80 h-full max-h-full shrink-0 border-r border-[#e5e5ea] bg-white overflow-y-auto overflow-x-hidden flex flex-col z-20 custom-scrollbar overscroll-contain">
        <div className="flex items-center justify-between p-4 border-b border-[#e5e5ea]">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#0071e3]" />
            <span className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
              Harmonic Palette Generator
            </span>
          </div>
          <button
            type="button"
            onClick={generateHarmony}
            className="p-1.5 rounded-lg hover:bg-[#f2f2f7] text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer"
            title="Shuffle Colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Harmony Mode Selector */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-2">
          <span className="text-xs font-medium text-[#1d1d1f]">Color Harmony Formula</span>
          <div className="flex flex-col gap-1.5 text-xs">
            {(['analogous', 'complementary', 'triadic', 'tetradic', 'monochromatic'] as const).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHarmony(h)}
                className={`py-2 px-3 rounded-xl font-medium capitalize text-left transition-all cursor-pointer ${
                  harmony === h
                    ? 'bg-[#1d1d1f] text-white shadow-2xs'
                    : 'bg-white text-[#86868b] hover:text-[#1d1d1f] border border-[#e5e5ea]'
                }`}
              >
                {h} Harmony
              </button>
            ))}
          </div>
        </div>

        {/* Export Action */}
        <div className="mt-auto p-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={copyJson}
            className="apple-btn apple-btn-primary gap-1.5 shadow-2xs"
          >
            {copiedHex === 'ALL_JSON' ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copiedHex === 'ALL_JSON' ? 'JSON Copied!' : 'Copy Palette JSON'}</span>
          </button>
        </div>
      </aside>

      {/* Main Interactive Palette Canvas / Swatches */}
      <main className="relative flex-1 h-full apple-grid-bg flex items-center justify-center p-8 overflow-hidden select-none">
        <div className="relative w-[760px] h-[450px] rounded-2xl overflow-hidden shadow-2xl border border-[#e5e5ea] flex">
          {colors.map((col, idx) => {
            const isDark = getLuminance(col.hex) < 0.5;
            return (
              <div
                key={idx}
                className="flex-1 h-full flex flex-col justify-between p-6 transition-colors duration-200 group relative"
                style={{ backgroundColor: col.hex }}
              >
                {/* Top Lock Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => toggleLock(idx)}
                    className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                      col.isLocked
                        ? 'bg-black/60 text-white'
                        : 'bg-white/40 text-black/80 opacity-0 group-hover:opacity-100 hover:bg-white/70'
                    }`}
                    title={col.isLocked ? 'Locked' : 'Click to Lock'}
                  >
                    {col.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                </div>

                {/* Bottom Color Details & Hex Copy */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => copyColor(col.hex)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-sm font-bold tracking-wider backdrop-blur-md flex items-center justify-between transition-transform group-hover:scale-105 cursor-pointer ${
                      isDark ? 'bg-white/20 text-white' : 'bg-black/15 text-[#1d1d1f]'
                    }`}
                  >
                    <span>{col.hex.toUpperCase()}</span>
                    {copiedHex === col.hex ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 opacity-60" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

// HSL / Hex Math Helpers
function hexToHsl(hex: string) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s, l };
}

function hslToHex(h: number, s: number, l: number) {
  h = (h % 360) / 360;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getLuminance(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
