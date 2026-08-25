import React, { useState } from 'react';
import { Copy, Check, Boxes, RotateCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GeometricPatternStudio: React.FC = () => {
  const [patternType, setPatternType] = useState<'isometric-cubes' | 'triangles' | 'hexagons' | 'scales' | 'octagons'>('isometric-cubes');
  const [scale, setScale] = useState<number>(60);
  const [strokeWidth, setStrokeWidth] = useState<number>(1.5);
  const [color1, setColor1] = useState<string>('#6366f1');
  const [color2, setColor2] = useState<string>('#4f46e5');
  const [color3, setColor3] = useState<string>('#818cf8');
  const [bgColor, setBgColor] = useState<string>('#0f172a');
  const [isCopied, setIsCopied] = useState(false);

  const randomizeColors = () => {
    const palettes = [
      ['#3b82f6', '#1d4ed8', '#60a5fa', '#0b132b'],
      ['#ec4899', '#be185d', '#f472b6', '#1e1b4b'],
      ['#10b981', '#047857', '#34d399', '#064e3b'],
      ['#f59e0b', '#b45309', '#fbbf24', '#451a03'],
      ['#64748b', '#334155', '#94a3b8', '#0f172a']
    ];
    const p = palettes[Math.floor(Math.random() * palettes.length)];
    setColor1(p[0]);
    setColor2(p[1]);
    setColor3(p[2]);
    setBgColor(p[3]);
  };

  const getSvgPatternMarkup = () => {
    if (patternType === 'isometric-cubes') {
      return `
        <pattern id="iso-cubes" width="${scale}" height="${scale * 1.732}" patternUnits="userSpaceOnUse">
          <path d="M${scale / 2} 0 L${scale} ${scale * 0.288} L${scale} ${scale * 0.866} L${scale / 2} ${scale * 0.577} Z" fill="${color1}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <path d="M0 ${scale * 0.288} L${scale / 2} 0 L${scale / 2} ${scale * 0.577} L0 ${scale * 0.866} Z" fill="${color2}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <path d="M0 ${scale * 0.866} L${scale / 2} ${scale * 0.577} L${scale} ${scale * 0.866} L${scale / 2} ${scale * 1.155} Z" fill="${color3}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <path d="M${scale / 2} ${scale * 0.866} L${scale} ${scale * 1.155} L${scale} ${scale * 1.732} L${scale / 2} ${scale * 1.443} Z" fill="${color1}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <path d="M0 ${scale * 1.155} L${scale / 2} ${scale * 0.866} L${scale / 2} ${scale * 1.443} L0 ${scale * 1.732} Z" fill="${color2}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <path d="M0 ${scale * 1.732} L${scale / 2} ${scale * 1.443} L${scale} ${scale * 1.732} L${scale / 2} ${scale * 2.02} Z" fill="${color3}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
        </pattern>`;
    } else if (patternType === 'triangles') {
      return `
        <pattern id="triangles" width="${scale}" height="${scale}" patternUnits="userSpaceOnUse">
          <polygon points="0,0 ${scale},0 ${scale / 2},${scale}" fill="${color1}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <polygon points="0,0 0,${scale} ${scale / 2},${scale}" fill="${color2}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <polygon points="${scale},0 ${scale},${scale} ${scale / 2},${scale}" fill="${color3}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
        </pattern>`;
    } else if (patternType === 'hexagons') {
      return `
        <pattern id="hexagons" width="${scale * 1.732}" height="${scale * 3}" patternUnits="userSpaceOnUse">
          <polygon points="${scale * 0.866},0 ${scale * 1.732},${scale * 0.5} ${scale * 1.732},${scale * 1.5} ${scale * 0.866},${scale * 2} 0,${scale * 1.5} 0,${scale * 0.5}" fill="${color1}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <polygon points="${scale * 0.866},${scale * 2} ${scale * 1.732},${scale * 2.5} ${scale * 1.732},${scale * 3.5} ${scale * 0.866},${scale * 4} 0,${scale * 3.5} 0,${scale * 2.5}" fill="${color2}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
        </pattern>`;
    } else if (patternType === 'scales') {
      return `
        <pattern id="scales" width="${scale}" height="${scale * 0.75}" patternUnits="userSpaceOnUse">
          <path d="M0 ${scale * 0.75} A ${scale / 2} ${scale / 2} 0 0 1 ${scale} ${scale * 0.75} Z" fill="${color1}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <path d="M${-scale / 2} 0 A ${scale / 2} ${scale / 2} 0 0 1 ${scale / 2} 0 Z" fill="${color2}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <path d="M${scale / 2} 0 A ${scale / 2} ${scale / 2} 0 0 1 ${scale * 1.5} 0 Z" fill="${color3}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
        </pattern>`;
    } else {
      return `
        <pattern id="octagons" width="${scale}" height="${scale}" patternUnits="userSpaceOnUse">
          <polygon points="${scale * 0.3},0 ${scale * 0.7},0 ${scale},${scale * 0.3} ${scale},${scale * 0.7} ${scale * 0.7},${scale} ${scale * 0.3},${scale} 0,${scale * 0.7} 0,${scale * 0.3}" fill="${color1}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <rect x="${scale * 0.4}" y="${scale * 0.4}" width="${scale * 0.2}" height="${scale * 0.2}" fill="${color2}" />
        </pattern>`;
    }
  };

  const copySvg = () => {
    const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>${getSvgPatternMarkup()}</defs>
  <rect width="100%" height="100%" fill="${bgColor}" />
  <rect width="100%" height="100%" fill="url(#${patternType === 'isometric-cubes' ? 'iso-cubes' : patternType})" />
</svg>`;
    navigator.clipboard.writeText(svgCode);
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
            <Boxes className="w-4 h-4 text-[#0071e3]" />
            <span className="text-xs font-semibold text-[#1d1d1f]">
              Geometric Tessellations
            </span>
          </div>
          <button
            type="button"
            onClick={randomizeColors}
            className="p-1.5 rounded-lg hover:bg-[#f2f2f7] text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer"
            title="Randomize Palette"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pattern Shape Mode */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-2">
          <span className="text-xs font-medium text-[#1d1d1f]">Pattern Geometry</span>
          <div className="flex flex-col gap-1.5 text-xs">
            {(['isometric-cubes', 'triangles', 'hexagons', 'scales', 'octagons'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPatternType(p)}
                className={`py-1.5 px-3 rounded-xl font-medium capitalize text-left transition-all cursor-pointer ${
                  patternType === p
                    ? 'bg-[#1d1d1f] text-white shadow-2xs'
                    : 'bg-white text-[#86868b] hover:text-[#1d1d1f] border border-[#e5e5ea]'
                }`}
              >
                {p.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Scale & Stroke Controls */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Tile Scale</span>
              <span className="font-mono text-[#1d1d1f]">{scale}px</span>
            </div>
            <input
              type="range"
              min="24"
              max="140"
              value={scale}
              onChange={(e) => setScale(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Stroke Seam Thickness</span>
              <span className="font-mono text-[#1d1d1f]">{strokeWidth}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="0.5"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* 3-Color Palette Manager */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-2.5">
          <span className="text-xs font-medium text-[#1d1d1f]">Tile Palette</span>
          <div className="grid grid-cols-4 gap-2">
            <input
              type="color"
              value={color1}
              onChange={(e) => setColor1(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer border border-[#e5e5ea] p-0.5 bg-white"
              title="Color 1"
            />
            <input
              type="color"
              value={color2}
              onChange={(e) => setColor2(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer border border-[#e5e5ea] p-0.5 bg-white"
              title="Color 2"
            />
            <input
              type="color"
              value={color3}
              onChange={(e) => setColor3(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer border border-[#e5e5ea] p-0.5 bg-white"
              title="Color 3"
            />
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer border border-[#e5e5ea] p-0.5 bg-white"
              title="Background"
            />
          </div>
        </div>

        {/* Export Action */}
        <div className="mt-auto p-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={copySvg}
            className="apple-btn apple-btn-primary gap-1.5 shadow-2xs"
          >
            {isCopied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? 'SVG Code Copied!' : 'Copy Vector SVG'}</span>
          </button>
        </div>
      </aside>

      {/* Main Pattern Canvas Preview Area */}
      <main className="relative flex-1 h-full apple-grid-bg flex items-center justify-center p-8 overflow-hidden select-none">
        <div className="relative w-[720px] h-[480px] rounded-2xl overflow-hidden shadow-2xl border border-[#e5e5ea]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs dangerouslySetInnerHTML={{ __html: getSvgPatternMarkup() }} />
            <rect width="100%" height="100%" fill={bgColor} />
            <rect
              width="100%"
              height="100%"
              fill={`url(#${patternType === 'isometric-cubes' ? 'iso-cubes' : patternType})`}
            />
          </svg>
        </div>
      </main>
    </div>
  );
};
