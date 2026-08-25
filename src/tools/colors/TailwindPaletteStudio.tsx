import React, { useState } from 'react';
import { Copy, Check, Wand2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

export const TailwindPaletteStudio: React.FC = () => {
  const [baseColor, setBaseColor] = useState<string>('#0284c7');
  const [paletteName, setPaletteName] = useState<string>('brand');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Generate 50-950 luminance shades from anchor 500
  const shades: Record<number, string> = {
    50: interpolateColor('#ffffff', baseColor, 0.1),
    100: interpolateColor('#ffffff', baseColor, 0.22),
    200: interpolateColor('#ffffff', baseColor, 0.4),
    300: interpolateColor('#ffffff', baseColor, 0.6),
    400: interpolateColor('#ffffff', baseColor, 0.8),
    500: baseColor,
    600: interpolateColor(baseColor, '#000000', 0.18),
    700: interpolateColor(baseColor, '#000000', 0.38),
    800: interpolateColor(baseColor, '#000000', 0.58),
    900: interpolateColor(baseColor, '#000000', 0.75),
    950: interpolateColor(baseColor, '#000000', 0.88)
  };

  const copyConfig = () => {
    const jsObj = `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        '${paletteName}': {
${SHADE_STEPS.map((step) => `          ${step}: '${shades[step]}',`).join('\n')}
        }
      }
    }
  }
};`;

    navigator.clipboard.writeText(jsObj);
    setCopiedKey('CONFIG');
    setTimeout(() => setCopiedKey(null), 2000);
    confetti({ particleCount: 25, spread: 40 });
  };

  const copyShade = (step: number, hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedKey(`${step}`);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#f5f5f7]">
      {/* Left Control Sidebar */}
      <aside className="w-80 h-full max-h-full shrink-0 border-r border-[#e5e5ea] bg-white overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 z-20 custom-scrollbar overscroll-contain">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-[#0071e3]" />
            <span className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
              Tailwind Palette
            </span>
          </div>
        </div>

        {/* Base Anchor 500 Color */}
        <div className="p-3.5 bg-[#fafafc] rounded-2xl border border-[#e5e5ea] flex flex-col gap-2.5">
          <span className="text-xs font-medium text-[#1d1d1f]">Anchor (500 Shade)</span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-10 h-10 rounded-xl cursor-pointer border border-[#e5e5ea] p-0.5 bg-white"
            />
            <input
              type="text"
              value={baseColor.toUpperCase()}
              onChange={(e) => setBaseColor(e.target.value)}
              className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-white border border-[#e5e5ea] text-[#1d1d1f]"
            />
          </div>
        </div>

        {/* Palette Name */}
        <div className="p-3.5 bg-[#fafafc] rounded-2xl border border-[#e5e5ea] flex flex-col gap-2">
          <span className="text-xs font-medium text-[#1d1d1f]">Tailwind Color Key Name</span>
          <input
            type="text"
            value={paletteName}
            onChange={(e) => setPaletteName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white border border-[#e5e5ea] text-[#1d1d1f]"
            placeholder="e.g. brand, primary, ocean"
          />
        </div>

        {/* Export Action */}
        <div className="mt-auto pt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={copyConfig}
            className="apple-pill-btn apple-pill-btn-primary gap-1.5 shadow-2xs"
          >
            {copiedKey === 'CONFIG' ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copiedKey === 'CONFIG' ? 'Config Copied!' : 'Copy tailwind.config.js'}</span>
          </button>
        </div>
      </aside>

      {/* Main Tailwind Scale Visualizer */}
      <main className="relative flex-1 h-full apple-grid-bg flex items-center justify-center p-8 overflow-y-auto custom-scrollbar select-none">
        <div className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-xl border border-[#e5e5ea] flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1d1d1f] tracking-tight">
                {paletteName} (50–950 Shades)
              </h2>
              <p className="text-xs text-[#86868b] mt-0.5">
                Luminance-calibrated color ramp for Tailwind CSS utilities
              </p>
            </div>
          </div>

          <div className="grid grid-cols-11 gap-2">
            {SHADE_STEPS.map((step) => {
              const hex = shades[step];
              const isDark = step >= 500;
              return (
                <button
                  key={step}
                  type="button"
                  onClick={() => copyShade(step, hex)}
                  className="flex flex-col h-32 rounded-xl border border-[#e5e5ea] overflow-hidden justify-between p-2.5 transition-transform hover:scale-105 cursor-pointer relative group shadow-2xs"
                  style={{ backgroundColor: hex }}
                >
                  <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {step}
                  </span>
                  <span className={`text-[10px] font-mono opacity-90 ${isDark ? 'text-white/80' : 'text-slate-800'}`}>
                    {copiedKey === `${step}` ? 'Copied!' : hex.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

function interpolateColor(color1: string, color2: string, factor: number) {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);

  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  const toHex = (x: number) => x.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
