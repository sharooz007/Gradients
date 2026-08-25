import React, { useState } from 'react';
import { Copy, Check, Grid } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SliderControl } from '../../components/controls/SliderControl';

interface PatternType {
  id: string;
  name: string;
  generateCss: (fg: string, bg: string, size: number, stroke: number, angle: number) => string;
}

const PATTERN_TYPES: PatternType[] = [
  {
    id: 'stripes-diagonal',
    name: 'Diagonal Stripes',
    generateCss: (fg, bg, size, stroke, angle) =>
      `background-color: ${bg}; background-image: repeating-linear-gradient(${angle}deg, ${fg} 0, ${fg} ${stroke}px, transparent ${stroke}px, transparent ${size}px);`
  },
  {
    id: 'polka-dots',
    name: 'Polka Dots',
    generateCss: (fg, bg, size, stroke) =>
      `background-color: ${bg}; background-image: radial-gradient(${fg} ${stroke}px, transparent ${stroke}px); background-size: ${size}px ${size}px;`
  },
  {
    id: 'grid-lines',
    name: 'Grid Lines',
    generateCss: (fg, bg, size, stroke) =>
      `background-color: ${bg}; background-image: linear-gradient(${fg} ${stroke}px, transparent ${stroke}px), linear-gradient(90deg, ${fg} ${stroke}px, transparent ${stroke}px); background-size: ${size}px ${size}px;`
  },
  {
    id: 'checkerboard',
    name: 'Checkerboard',
    generateCss: (fg, bg, size) =>
      `background-color: ${bg}; background-image: linear-gradient(45deg, ${fg} 25%, transparent 25%), linear-gradient(-45deg, ${fg} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${fg} 75%), linear-gradient(-45deg, transparent 75%, ${fg} 75%); background-size: ${size}px ${size}px; background-position: 0 0, 0 ${size / 2}px, ${size / 2}px -${size / 2}px, -${size / 2}px 0px;`
  },
  {
    id: 'crosshatch',
    name: 'Crosshatch',
    generateCss: (fg, bg, size, stroke) =>
      `background-color: ${bg}; background-image: repeating-linear-gradient(45deg, ${fg} 0, ${fg} ${stroke}px, transparent ${stroke}px, transparent ${size}px), repeating-linear-gradient(-45deg, ${fg} 0, ${fg} ${stroke}px, transparent ${stroke}px, transparent ${size}px);`
  },
  {
    id: 'zigzag',
    name: 'Zig-Zag Chevron',
    generateCss: (fg, bg, size) =>
      `background-color: ${bg}; background-image: linear-gradient(135deg, ${fg} 25%, transparent 25%), linear-gradient(225deg, ${fg} 25%, transparent 25%), linear-gradient(315deg, ${fg} 25%, transparent 25%), linear-gradient(45deg, ${fg} 25%, transparent 25%); background-position: -${size/2}px 0, -${size/2}px 0, 0 0, 0 0; background-size: ${size}px ${size}px;`
  }
];

export const CssPatternStudio: React.FC = () => {
  const [selectedPattern, setSelectedPattern] = useState<string>(PATTERN_TYPES[0].id);
  const [fgColor, setFgColor] = useState<string>('#444CF7');
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [size, setSize] = useState<number>(30);
  const [stroke, setStroke] = useState<number>(2);
  const [angle, setAngle] = useState<number>(45);
  const [copied, setCopied] = useState(false);

  const activePattern = PATTERN_TYPES.find((p) => p.id === selectedPattern) || PATTERN_TYPES[0];
  const cssStyle = activePattern.generateCss(fgColor, bgColor, size, stroke, angle);

  const handleCopy = () => {
    navigator.clipboard.writeText(cssStyle);
    setCopied(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden select-none">
      {/* Left Sidebar */}
      <aside className="w-80 h-full border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <Grid className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            CSS Pattern Settings
          </span>
        </div>

        {/* Pattern Types */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Pattern Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PATTERN_TYPES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPattern(p.id)}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                  selectedPattern === p.id
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Foreground</span>
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <span className="text-xs font-mono">{fgColor.toUpperCase()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Background</span>
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <span className="text-xs font-mono">{bgColor.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <SliderControl
          label="Pattern Tile Size"
          value={size}
          min={10}
          max={120}
          step={2}
          unit="px"
          onChange={setSize}
        />

        <SliderControl
          label="Stroke Width"
          value={stroke}
          min={1}
          max={20}
          step={1}
          unit="px"
          onChange={setStroke}
        />

        {selectedPattern === 'stripes-diagonal' && (
          <SliderControl
            label="Angle"
            value={angle}
            min={0}
            max={360}
            step={5}
            isAngle={true}
            onChange={setAngle}
          />
        )}

        <button
          type="button"
          onClick={handleCopy}
          className="w-full mt-auto py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied CSS!' : 'Copy CSS Background'}</span>
        </button>
      </aside>

      {/* Preview */}
      <main className="flex-1 canvas-grid-bg flex items-center justify-center p-8 overflow-hidden">
        <div
          className="w-full max-w-4xl h-[70vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 transition-all duration-200"
          style={{ cssText: cssStyle } as any}
        />
      </main>
    </div>
  );
};
