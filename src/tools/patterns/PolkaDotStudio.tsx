import React, { useState } from 'react';
import { Copy, Check, Dot } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PolkaDotStudio: React.FC = () => {
  const [layoutMode, setLayoutMode] = useState<'square' | 'staggered'>('staggered');
  const [radius, setRadius] = useState<number>(6);
  const [spacing, setSpacing] = useState<number>(32);
  const [dotColor, setDotColor] = useState<string>('#e11d48');
  const [bgColor, setBgColor] = useState<string>('#fff1f2');
  const [opacity, setOpacity] = useState<number>(1.0);
  const [isCopied, setIsCopied] = useState(false);

  const getCssCode = () => {
    if (layoutMode === 'square') {
      return `background-color: ${bgColor};\nbackground-image: radial-gradient(${dotColor} ${radius}px, transparent ${radius}px);\nbackground-size: ${spacing}px ${spacing}px;`;
    } else {
      const half = spacing / 2;
      return `background-color: ${bgColor};\nbackground-image:\n  radial-gradient(${dotColor} ${radius}px, transparent ${radius}px),\n  radial-gradient(${dotColor} ${radius}px, transparent ${radius}px);\nbackground-position: 0 0, ${half}px ${half}px;\nbackground-size: ${spacing}px ${spacing}px;`;
    }
  };

  const copyCss = () => {
    navigator.clipboard.writeText(getCssCode());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    confetti({ particleCount: 25, spread: 40 });
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#f5f5f7]">
      {/* Left Control Sidebar */}
      <aside className="w-80 h-full min-h-0 shrink-0 border-r border-[#e5e5ea] bg-white overflow-y-auto overflow-x-hidden z-20 custom-scrollbar overscroll-contain pb-10">
        <div className="flex flex-col w-full min-h-max">
        <div className="flex items-center justify-between p-4 border-b border-[#e5e5ea]">
          <div className="flex items-center gap-2">
            <Dot className="w-5 h-5 text-[#0071e3]" />
            <span className="text-xs font-semibold text-[#1d1d1f]">
              Polka Dot Matrix
            </span>
          </div>
        </div>

        {/* Layout Mode */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-2">
          <span className="text-xs font-medium text-[#1d1d1f]">Grid Arrangement</span>
          <div className="grid grid-cols-2 gap-1 p-0.5 rounded-full bg-[#f2f2f7] border border-[#e5e5ea] text-xs">
            <button
              type="button"
              onClick={() => setLayoutMode('square')}
              className={`py-1 rounded-full font-medium transition-all cursor-pointer ${
                layoutMode === 'square'
                  ? 'bg-white text-[#1d1d1f] shadow-2xs font-semibold'
                  : 'text-[#86868b]'
              }`}
            >
              Square Grid
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('staggered')}
              className={`py-1 rounded-full font-medium transition-all cursor-pointer ${
                layoutMode === 'staggered'
                  ? 'bg-white text-[#1d1d1f] shadow-2xs font-semibold'
                  : 'text-[#86868b]'
              }`}
            >
              Staggered Hex
            </button>
          </div>
        </div>

        {/* Size & Pitch Controls */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Dot Radius</span>
              <span className="font-mono text-[#1d1d1f]">{radius}px</span>
            </div>
            <input
              type="range"
              min="2"
              max="24"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Grid Pitch (Spacing)</span>
              <span className="font-mono text-[#1d1d1f]">{spacing}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="80"
              value={spacing}
              onChange={(e) => setSpacing(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Dot Opacity</span>
              <span className="font-mono text-[#1d1d1f]">{(opacity * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Colors Panel */}
        <div className="p-3.5 border-b border-[#e5e5ea] grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-[#86868b]">Dot Color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={dotColor}
                onChange={(e) => setDotColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-[#e5e5ea] p-0.5 bg-white"
              />
              <span className="text-xs font-mono text-[#1d1d1f]">{dotColor}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-[#86868b]">Background</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-[#e5e5ea] p-0.5 bg-white"
              />
              <span className="text-xs font-mono text-[#1d1d1f]">{bgColor}</span>
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
      </div>
      </aside>

      {/* Main Pattern Canvas Preview Area */}
      <main className="relative flex-1 h-full apple-grid-bg flex items-center justify-center p-8 overflow-hidden select-none">
        <div
          className="relative w-[720px] h-[480px] rounded-2xl overflow-hidden shadow-2xl border border-[#e5e5ea]"
          style={{
            backgroundColor: bgColor,
            backgroundImage:
              layoutMode === 'square'
                ? `radial-gradient(${dotColor} ${radius}px, transparent ${radius}px)`
                : `radial-gradient(${dotColor} ${radius}px, transparent ${radius}px), radial-gradient(${dotColor} ${radius}px, transparent ${radius}px)`,
            backgroundPosition: layoutMode === 'square' ? '0 0' : `0 0, ${spacing / 2}px ${spacing / 2}px`,
            backgroundSize: `${spacing}px ${spacing}px`,
            opacity: opacity
          }}
        />
      </main>
    </div>
  );
};
