import React, { useState } from 'react';
import { Copy, Check, Grid } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GridBackgroundStudio: React.FC = () => {
  const [theme, setTheme] = useState<'blueprint' | 'millimeter' | 'dots' | 'isometric'>('blueprint');
  const [majorSize, setMajorSize] = useState<number>(60);
  const [subdivisions, setSubdivisions] = useState<number>(5);
  const [majorColor, setMajorColor] = useState<string>('rgba(0, 180, 255, 0.4)');
  const [minorColor, setMinorColor] = useState<string>('rgba(0, 180, 255, 0.15)');
  const [bgColor, setBgColor] = useState<string>('#0a192f');
  const [showCoords, setShowCoords] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState(false);

  const applyTheme = (t: 'blueprint' | 'millimeter' | 'dots' | 'isometric') => {
    setTheme(t);
    if (t === 'blueprint') {
      setBgColor('#0a192f');
      setMajorColor('rgba(0, 180, 255, 0.4)');
      setMinorColor('rgba(0, 180, 255, 0.15)');
      setMajorSize(60);
    } else if (t === 'millimeter') {
      setBgColor('#ffffff');
      setMajorColor('rgba(239, 68, 68, 0.5)');
      setMinorColor('rgba(239, 68, 68, 0.18)');
      setMajorSize(50);
    } else if (t === 'dots') {
      setBgColor('#f8fafc');
      setMajorColor('rgba(15, 23, 42, 0.4)');
      setMinorColor('rgba(15, 23, 42, 0.1)');
      setMajorSize(40);
    } else {
      setBgColor('#0f172a');
      setMajorColor('rgba(99, 102, 241, 0.4)');
      setMinorColor('rgba(99, 102, 241, 0.15)');
      setMajorSize(50);
    }
  };

  const copyCss = () => {
    const minorSize = majorSize / subdivisions;
    const css = `background-color: ${bgColor};\nbackground-image:\n  linear-gradient(${majorColor} 1px, transparent 1px),\n  linear-gradient(90deg, ${majorColor} 1px, transparent 1px),\n  linear-gradient(${minorColor} 1px, transparent 1px),\n  linear-gradient(90deg, ${minorColor} 1px, transparent 1px);\nbackground-size: ${majorSize}px ${majorSize}px, ${majorSize}px ${majorSize}px, ${minorSize}px ${minorSize}px, ${minorSize}px ${minorSize}px;`;
    navigator.clipboard.writeText(css);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    confetti({ particleCount: 25, spread: 40 });
  };

  const minorSize = majorSize / subdivisions;

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#f5f5f7]">
      {/* Left Control Sidebar */}
      <aside className="w-80 h-full max-h-full shrink-0 border-r border-[#e5e5ea] bg-white overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 z-20 custom-scrollbar overscroll-contain">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-[#0071e3]" />
            <span className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
              Technical Grid Studio
            </span>
          </div>
        </div>

        {/* Theme Presets */}
        <div className="p-3.5 bg-[#fafafc] rounded-2xl border border-[#e5e5ea] flex flex-col gap-2">
          <span className="text-xs font-medium text-[#1d1d1f]">Grid Style Presets</span>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {(['blueprint', 'millimeter', 'dots', 'isometric'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => applyTheme(t)}
                className={`py-1.5 px-3 rounded-xl font-medium capitalize text-center transition-all cursor-pointer ${
                  theme === t
                    ? 'bg-[#1d1d1f] text-white shadow-2xs'
                    : 'bg-white text-[#86868b] hover:text-[#1d1d1f] border border-[#e5e5ea]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Sizing & Subdivisions */}
        <div className="p-3.5 bg-[#fafafc] rounded-2xl border border-[#e5e5ea] flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Major Grid Size</span>
              <span className="font-mono text-[#1d1d1f]">{majorSize}px</span>
            </div>
            <input
              type="range"
              min="24"
              max="120"
              value={majorSize}
              onChange={(e) => setMajorSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Minor Subdivisions</span>
              <span className="font-mono text-[#1d1d1f]">{subdivisions}</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              value={subdivisions}
              onChange={(e) => setSubdivisions(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#1d1d1f]">Coordinate Axes Overlay</span>
            <input
              type="checkbox"
              checked={showCoords}
              onChange={(e) => setShowCoords(e.target.checked)}
              className="w-4 h-4 text-[#0071e3]"
            />
          </div>
        </div>

        {/* Colors Panel */}
        <div className="p-3.5 bg-[#fafafc] rounded-2xl border border-[#e5e5ea] flex flex-col gap-2.5">
          <span className="text-xs font-medium text-[#1d1d1f]">Colors</span>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#86868b]">Background Color</span>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-[#e5e5ea] p-0.5 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Export Action */}
        <div className="mt-auto pt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={copyCss}
            className="apple-pill-btn apple-pill-btn-primary gap-1.5 shadow-2xs"
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
          style={{
            backgroundColor: bgColor,
            backgroundImage: `linear-gradient(${majorColor} 1px, transparent 1px), linear-gradient(90deg, ${majorColor} 1px, transparent 1px), linear-gradient(${minorColor} 1px, transparent 1px), linear-gradient(90deg, ${minorColor} 1px, transparent 1px)`,
            backgroundSize: `${majorSize}px ${majorSize}px, ${majorSize}px ${majorSize}px, ${minorSize}px ${minorSize}px, ${minorSize}px ${minorSize}px`
          }}
        >
          {showCoords && (
            <div className="absolute top-4 left-4 p-2 bg-black/60 backdrop-blur-md rounded-lg font-mono text-[11px] text-cyan-400 border border-white/10 flex flex-col gap-0.5">
              <span>GRID: {majorSize}px × {majorSize}px</span>
              <span>SUBDIV: {subdivisions} (step {minorSize.toFixed(1)}px)</span>
              <span>ORIGIN: [0, 0]</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
