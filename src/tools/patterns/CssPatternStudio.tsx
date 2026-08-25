import React, { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';
import confetti from 'canvas-confetti';

const CSS_PATTERNS = [
  {
    id: 'stripes-diagonal',
    name: 'Diagonal Stripes',
    category: 'stripes',
    css: (c1: string, c2: string, size: number) =>
      `background: repeating-linear-gradient(45deg, ${c1}, ${c1} ${size}px, ${c2} ${size}px, ${c2} ${size * 2}px);`
  },
  {
    id: 'polka-dots',
    name: 'Polka Dots Matrix',
    category: 'dots',
    css: (c1: string, c2: string, size: number) =>
      `background-color: ${c2};\nbackground-image: radial-gradient(${c1} 2px, transparent 2px);\nbackground-size: ${size}px ${size}px;`
  },
  {
    id: 'grid-lines',
    name: 'Minimalist Grid',
    category: 'grid',
    css: (c1: string, c2: string, size: number) =>
      `background-color: ${c2};\nbackground-image: linear-gradient(${c1} 1px, transparent 1px), linear-gradient(90deg, ${c1} 1px, transparent 1px);\nbackground-size: ${size}px ${size}px;`
  },
  {
    id: 'checkerboard',
    name: 'Retro Checkerboard',
    category: 'geometric',
    css: (c1: string, c2: string, size: number) =>
      `background-color: ${c2};\nbackground-image: linear-gradient(45deg, ${c1} 25%, transparent 25%), linear-gradient(-45deg, ${c1} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${c1} 75%), linear-gradient(-45deg, transparent 75%, ${c1} 75%);\nbackground-size: ${size}px ${size}px;\nbackground-position: 0 0, 0 ${size / 2}px, ${size / 2}px -${size / 2}px, -${size / 2}px 0px;`
  },
  {
    id: 'crosshatch',
    name: 'Crosshatch Weave',
    category: 'geometric',
    css: (c1: string, c2: string, size: number) =>
      `background: repeating-linear-gradient(45deg, ${c1} 0, ${c1} 1px, transparent 0, transparent 50%), repeating-linear-gradient(-45deg, ${c1} 0, ${c1} 1px, ${c2} 0, ${c2} 50%);\nbackground-size: ${size}px ${size}px;`
  },
  {
    id: 'zigzag',
    name: 'Zig-zag Chevron',
    category: 'waves',
    css: (c1: string, c2: string, size: number) =>
      `background-color: ${c2};\nbackground-image: linear-gradient(135deg, ${c1} 25%, transparent 25%), linear-gradient(225deg, ${c1} 25%, transparent 25%), linear-gradient(315deg, ${c1} 25%, transparent 25%), linear-gradient(45deg, ${c1} 25%, transparent 25%);\nbackground-position: -${size / 2}px 0, -${size / 2}px 0, 0 0, 0 0;\nbackground-size: ${size}px ${size}px;`
  }
];

export const CssPatternStudio: React.FC = () => {
  const [selectedPatternId, setSelectedPatternId] = useState<string>('stripes-diagonal');
  const [size, setSize] = useState<number>(24);
  const [color1, setColor1] = useState<string>('#3b82f6');
  const [color2, setColor2] = useState<string>('#eff6ff');
  const [isCopied, setIsCopied] = useState(false);

  const activePattern = CSS_PATTERNS.find((p) => p.id === selectedPatternId) || CSS_PATTERNS[0];
  const generatedCss = activePattern.css(color1, color2, size);

  const copyCss = () => {
    navigator.clipboard.writeText(generatedCss);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    confetti({ particleCount: 25, spread: 40 });
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#f5f5f7]">
      {/* Left Control Sidebar */}
      <aside className="w-80 h-full max-h-full shrink-0 border-r border-[#e5e5ea] bg-white overflow-y-auto overflow-x-hidden flex flex-col z-20 custom-scrollbar overscroll-contain">
        <div className="flex items-center justify-between p-4 border-b border-[#e5e5ea]">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-[#0071e3]" />
            <span className="text-xs font-semibold text-[#1d1d1f]">
              CSS Background Patterns
            </span>
          </div>
        </div>

        {/* Pattern Selection Grid */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-2">
          <span className="text-xs font-medium text-[#1d1d1f]">Pattern Types</span>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {CSS_PATTERNS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPatternId(p.id)}
                className={`py-2 px-2.5 rounded-xl font-medium text-left transition-all cursor-pointer ${
                  selectedPatternId === p.id
                    ? 'bg-[#1d1d1f] text-white shadow-2xs'
                    : 'bg-white text-[#86868b] hover:text-[#1d1d1f] border border-[#e5e5ea]'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Scale Slider */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-[#86868b]">
            <span>Pattern Scale</span>
            <span className="font-mono text-[#1d1d1f]">{size}px</span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* 2-Color Palette */}
        <div className="p-3.5 border-b border-[#e5e5ea] grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-[#86868b]">Foreground</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color1}
                onChange={(e) => setColor1(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-[#e5e5ea] p-0.5 bg-white"
              />
              <span className="text-xs font-mono text-[#1d1d1f]">{color1}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-[#86868b]">Background</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color2}
                onChange={(e) => setColor2(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-[#e5e5ea] p-0.5 bg-white"
              />
              <span className="text-xs font-mono text-[#1d1d1f]">{color2}</span>
            </div>
          </div>
        </div>

        {/* Export Action */}
        <div className="mt-auto p-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={copyCss}
            className="apple-btn apple-btn-primary gap-1.5 shadow-2xs"
          >
            {isCopied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? 'CSS Code Copied!' : 'Copy CSS Background'}</span>
          </button>
        </div>
      </aside>

      {/* Main Pattern Canvas Preview Area */}
      <main className="relative flex-1 h-full apple-grid-bg flex items-center justify-center p-8 overflow-hidden select-none">
        <div
          className="relative w-[720px] h-[480px] rounded-2xl overflow-hidden shadow-2xl border border-[#e5e5ea]"
          style={Object.fromEntries(
            generatedCss
              .split(';')
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line) => {
                const [prop, val] = line.split(':');
                return [
                  prop
                    .trim()
                    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
                  val ? val.trim() : ''
                ];
              })
          )}
        />
      </main>
    </div>
  );
};
