import React, { useState } from 'react';
import { Copy, Check, Repeat } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SeamlessPatternStudio: React.FC = () => {
  const [motifSize, setMotifSize] = useState<number>(36);
  const [spacing, setSpacing] = useState<number>(64);
  const [rotationJitter, setRotationJitter] = useState<number>(45);
  const [color1, setColor1] = useState<string>('#f97316');
  const [color2, setColor2] = useState<string>('#3b82f6');
  const [color3, setColor3] = useState<string>('#10b981');
  const [color4, setColor4] = useState<string>('#8b5cf6');
  const [bgColor, setBgColor] = useState<string>('#fffbeb');
  const [isCopied, setIsCopied] = useState(false);

  const getSvgPattern = () => `
    <pattern id="seamless-tile" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
      <circle cx="${spacing * 0.25}" cy="${spacing * 0.25}" r="${motifSize * 0.18}" fill="${color1}" />
      <rect x="${spacing * 0.6}" y="${spacing * 0.15}" width="${motifSize * 0.35}" height="${motifSize * 0.35}" rx="${motifSize * 0.08}" fill="${color2}" transform="rotate(${rotationJitter} ${spacing * 0.6 + motifSize * 0.175} ${spacing * 0.15 + motifSize * 0.175})" />
      <polygon points="${spacing * 0.5},${spacing * 0.6} ${spacing * 0.65},${spacing * 0.85} ${spacing * 0.35},${spacing * 0.85}" fill="${color3}" />
      <path d="M${spacing * 0.8} ${spacing * 0.65} Q${spacing * 0.95} ${spacing * 0.55} ${spacing} ${spacing * 0.7}" stroke="${color4}" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M0 ${spacing * 0.65} Q${spacing * 0.15} ${spacing * 0.55} ${spacing * 0.2} ${spacing * 0.7}" stroke="${color4}" stroke-width="3" fill="none" stroke-linecap="round" />
    </pattern>`;

  const copySvg = () => {
    const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>${getSvgPattern()}</defs>
  <rect width="100%" height="100%" fill="${bgColor}" />
  <rect width="100%" height="100%" fill="url(#seamless-tile)" />
</svg>`;
    navigator.clipboard.writeText(svgCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    confetti({ particleCount: 25, spread: 45 });
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#f5f5f7]">
      {/* Left Control Sidebar */}
      <aside className="w-80 h-full max-h-full shrink-0 border-r border-[#e5e5ea] bg-white overflow-y-auto overflow-x-hidden flex flex-col z-20 custom-scrollbar overscroll-contain">
        <div className="flex items-center justify-between p-4 border-b border-[#e5e5ea]">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-[#0071e3]" />
            <span className="text-xs font-semibold text-[#1d1d1f]">
              Seamless Patterns
            </span>
          </div>
        </div>

        {/* Motif Dimensions & Spacing */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Tile Grid Spacing</span>
              <span className="font-mono text-[#1d1d1f]">{spacing}px</span>
            </div>
            <input
              type="range"
              min="32"
              max="120"
              value={spacing}
              onChange={(e) => setSpacing(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Motif Scale</span>
              <span className="font-mono text-[#1d1d1f]">{motifSize}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="64"
              value={motifSize}
              onChange={(e) => setMotifSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Rotation Angle</span>
              <span className="font-mono text-[#1d1d1f]">{rotationJitter}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              value={rotationJitter}
              onChange={(e) => setRotationJitter(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Color Palette */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-2.5">
          <span className="text-xs font-medium text-[#1d1d1f]">Motif Colorways</span>
          <div className="grid grid-cols-5 gap-1.5">
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
              value={color4}
              onChange={(e) => setColor4(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer border border-[#e5e5ea] p-0.5 bg-white"
              title="Color 4"
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
            <defs dangerouslySetInnerHTML={{ __html: getSvgPattern() }} />
            <rect width="100%" height="100%" fill={bgColor} />
            <rect width="100%" height="100%" fill="url(#seamless-tile)" />
          </svg>
        </div>
      </main>
    </div>
  );
};
