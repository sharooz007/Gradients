import React, { useState } from 'react';
import { Copy, Check, SunMedium } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ColorTintsShadesStudio: React.FC = () => {
  const [baseColor, setBaseColor] = useState<string>('#3b82f6');
  const [steps, setSteps] = useState<number>(10);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

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
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const copyJson = () => {
    const fullRamp = {
      base: baseColor,
      tints,
      shades,
      tones
    };
    navigator.clipboard.writeText(JSON.stringify(fullRamp, null, 2));
    setCopiedHex('ALL_JSON');
    setTimeout(() => setCopiedHex(null), 2000);
    confetti({ particleCount: 25, spread: 40 });
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#f5f5f7]">
      {/* Left Control Sidebar */}
      <aside className="w-80 h-full min-h-0 shrink-0 border-r border-[#e5e5ea] bg-white overflow-y-auto overflow-x-hidden z-20 custom-scrollbar overscroll-contain pb-10">
        <div className="flex flex-col w-full min-h-max">
        <div className="flex items-center justify-between p-4 border-b border-[#e5e5ea]">
          <div className="flex items-center gap-2">
            <SunMedium className="w-4 h-4 text-[#0071e3]" />
            <span className="text-xs font-semibold text-[#1d1d1f]">
              Tints & Shades
            </span>
          </div>
        </div>

        {/* Base Color Picker */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-2.5">
          <span className="text-xs font-medium text-[#1d1d1f]">Anchor Base Color</span>
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

        {/* Steps Slider */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-[#86868b]">
            <span>Ramp Steps</span>
            <span className="font-mono text-[#1d1d1f]">{steps} steps</span>
          </div>
          <input
            type="range"
            min="5"
            max="16"
            value={steps}
            onChange={(e) => setSteps(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Export Action */}
        <div className="mt-auto p-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={copyJson}
            className="apple-btn apple-btn-primary gap-1.5 shadow-2xs"
          >
            {copiedHex === 'ALL_JSON' ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copiedHex === 'ALL_JSON' ? 'JSON Copied!' : 'Copy Ramp JSON'}</span>
          </button>
        </div>
      </div>
      </aside>

      {/* Main Color Ramps Visualizer */}
      <main className="relative flex-1 h-full apple-grid-bg flex items-center justify-center p-8 overflow-y-auto custom-scrollbar select-none">
        <div className="w-full max-w-4xl flex flex-col gap-6">
          {/* 1. Tints Section */}
          <div className="p-5 bg-white rounded-2xl shadow-xl border border-[#e5e5ea] flex flex-col gap-3">
            <span className="text-xs font-semibold text-[#1d1d1f]">
              Tints (Interpolated with Pure White #FFF)
            </span>
            <div className="flex h-20 rounded-xl overflow-hidden shadow-xs border border-[#e5e5ea]">
              {tints.map((hex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => copyColor(hex)}
                  className="flex-1 h-full flex flex-col justify-end p-2 transition-transform hover:scale-105 cursor-pointer relative group"
                  style={{ backgroundColor: hex }}
                >
                  <span className="text-[10px] font-mono text-black/80 opacity-0 group-hover:opacity-100 bg-white/80 rounded px-1">
                    {copiedHex === hex ? 'Copied' : hex.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Shades Section */}
          <div className="p-5 bg-white rounded-2xl shadow-xl border border-[#e5e5ea] flex flex-col gap-3">
            <span className="text-xs font-semibold text-[#1d1d1f]">
              Shades (Interpolated with Pure Black #000)
            </span>
            <div className="flex h-20 rounded-xl overflow-hidden shadow-xs border border-[#e5e5ea]">
              {shades.map((hex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => copyColor(hex)}
                  className="flex-1 h-full flex flex-col justify-end p-2 transition-transform hover:scale-105 cursor-pointer relative group"
                  style={{ backgroundColor: hex }}
                >
                  <span className="text-[10px] font-mono text-white/90 opacity-0 group-hover:opacity-100 bg-black/60 rounded px-1">
                    {copiedHex === hex ? 'Copied' : hex.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Tones Section */}
          <div className="p-5 bg-white rounded-2xl shadow-xl border border-[#e5e5ea] flex flex-col gap-3">
            <span className="text-xs font-semibold text-[#1d1d1f]">
              Tones (Interpolated with Neutral Gray #808080)
            </span>
            <div className="flex h-20 rounded-xl overflow-hidden shadow-xs border border-[#e5e5ea]">
              {tones.map((hex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => copyColor(hex)}
                  className="flex-1 h-full flex flex-col justify-end p-2 transition-transform hover:scale-105 cursor-pointer relative group"
                  style={{ backgroundColor: hex }}
                >
                  <span className="text-[10px] font-mono text-white/90 opacity-0 group-hover:opacity-100 bg-black/60 rounded px-1">
                    {copiedHex === hex ? 'Copied' : hex.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Interpolation Helper
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
