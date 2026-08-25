import React, { useState } from 'react';
import { Copy, Check, PaintBucket } from 'lucide-react';
import confetti from 'canvas-confetti';
import { hexToRgb, rgbToHex } from '../../utils/colorUtils';

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export const TailwindPaletteStudio: React.FC = () => {
  const [baseHex, setBaseHex] = useState<string>('#6366F1');
  const [name, setName] = useState<string>('brand');
  const [copied, setCopied] = useState(false);

  // Generate 50–950 tints and shades
  const generateTailwindScale = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);

    const scale: Record<number, string> = {};

    // 50 to 400 (blend towards white)
    const lightFactors: Record<number, number> = {
      50: 0.95,
      100: 0.85,
      200: 0.65,
      300: 0.45,
      400: 0.2
    };

    Object.entries(lightFactors).forEach(([shade, factor]) => {
      scale[Number(shade)] = rgbToHex({
        r: Math.round(r + (255 - r) * factor),
        g: Math.round(g + (255 - g) * factor),
        b: Math.round(b + (255 - b) * factor)
      });
    });

    scale[500] = hex;

    // 600 to 950 (blend towards dark tone)
    const darkFactors: Record<number, number> = {
      600: 0.85,
      700: 0.68,
      800: 0.5,
      900: 0.35,
      950: 0.18
    };

    Object.entries(darkFactors).forEach(([shade, factor]) => {
      scale[Number(shade)] = rgbToHex({
        r: Math.round(r * factor),
        g: Math.round(g * factor),
        b: Math.round(b * factor)
      });
    });

    return scale;
  };

  const scale = generateTailwindScale(baseHex);

  const tailwindConfigCode = `'${name}': {\n${Object.entries(scale)
    .map(([k, v]) => `  ${k}: '${v}',`)
    .join('\n')}\n}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(tailwindConfigCode);
    setCopied(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none">
      {/* Sidebar Controls */}
      <aside className="w-80 h-full min-h-0 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <PaintBucket className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Tailwind Palette Generator
          </span>
        </div>

        {/* Color Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Color Key Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
          />
        </div>

        {/* Primary Anchor (500) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Primary 500 Base Color
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
          onClick={handleCopy}
          className="w-full mt-auto py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied Tailwind Config!' : 'Copy tailwind.config.js'}</span>
        </button>
      </aside>

      {/* Preview */}
      <main className="flex-1 canvas-grid-bg flex items-center justify-center p-8 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
            Generated {name} Scale (50–950)
          </h3>
          {SHADES.map((shade) => (
            <div
              key={shade}
              className="flex items-center justify-between p-3 rounded-xl transition-all shadow-xs"
              style={{ backgroundColor: scale[shade] }}
            >
              <span
                className={`text-xs font-bold font-mono ${
                  shade >= 500 ? 'text-white' : 'text-slate-900'
                }`}
              >
                {name}-{shade}
              </span>
              <span
                className={`text-xs font-mono ${
                  shade >= 500 ? 'text-white/80' : 'text-slate-900/80'
                }`}
              >
                {scale[shade].toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
