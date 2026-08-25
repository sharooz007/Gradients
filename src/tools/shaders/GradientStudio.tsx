import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Shuffle,
  Plus,
  X,
  Code,
  Palette
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getRandomPalette } from '../../data/palettes';
import { SliderControl } from '../../components/controls/SliderControl';
import { SegmentedPicker } from '../../components/controls/SegmentedPicker';

type GradientType = 'linear' | 'radial' | 'conic';

interface ColorStop {
  color: string;
  position: number; // 0 to 100
}

export const GradientStudio: React.FC = () => {
  const [type, setType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState<number>(135);
  const [radialShape, setRadialShape] = useState<'circle' | 'ellipse'>('circle');
  const [radialPos, setRadialPos] = useState<'center' | 'top left' | 'bottom right'>('center');
  const [copied, setCopied] = useState(false);

  const [stops, setStops] = useState<ColorStop[]>([
    { color: '#4F46E5', position: 0 },
    { color: '#7C3AED', position: 50 },
    { color: '#EC4899', position: 100 }
  ]);

  // Generate CSS string
  const getCssGradient = () => {
    const stopsStr = stops
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((s) => `${s.color} ${s.position}%`)
      .join(', ');

    if (type === 'linear') {
      return `linear-gradient(${angle}deg, ${stopsStr})`;
    } else if (type === 'radial') {
      return `radial-gradient(${radialShape} at ${radialPos}, ${stopsStr})`;
    } else {
      return `conic-gradient(from ${angle}deg at 50% 50%, ${stopsStr})`;
    }
  };

  const cssString = `background: ${getCssGradient()};`;

  const handleShuffle = () => {
    const colors = getRandomPalette();
    const newStops = colors.map((col, idx) => ({
      color: col,
      position: Math.round((idx / (colors.length - 1)) * 100)
    }));
    setStops(newStops);
  };

  const handleAddStop = () => {
    if (stops.length >= 8) return;
    const last = stops[stops.length - 1];
    setStops([...stops, { color: '#ffffff', position: Math.min(100, last.position + 15) }]);
  };

  const handleRemoveStop = (index: number) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleUpdateStop = (index: number, updates: Partial<ColorStop>) => {
    const next = [...stops];
    next[index] = { ...next[index], ...updates };
    setStops(next);
  };

  const handleCopyCss = () => {
    navigator.clipboard.writeText(cssString);
    setCopied(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2400;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw high-res gradient
    if (type === 'linear') {
      const rad = (angle * Math.PI) / 180;
      const x0 = canvas.width / 2 - Math.cos(rad) * canvas.width * 0.5;
      const y0 = canvas.height / 2 - Math.sin(rad) * canvas.height * 0.5;
      const x1 = canvas.width / 2 + Math.cos(rad) * canvas.width * 0.5;
      const y1 = canvas.height / 2 + Math.sin(rad) * canvas.height * 0.5;
      const grad = ctx.createLinearGradient(x0, y0, x1, y1);
      stops.forEach((s) => grad.addColorStop(s.position / 100, s.color));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (type === 'radial') {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = Math.max(canvas.width, canvas.height) / 2;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      stops.forEach((s) => grad.addColorStop(s.position / 100, s.color));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      const grad = ctx.createConicGradient((angle * Math.PI) / 180, canvas.width / 2, canvas.height / 2);
      stops.forEach((s) => grad.addColorStop(s.position / 100, s.color));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const a = document.createElement('a');
    a.download = `gradient-${type}-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  const handleDownloadSvg = () => {
    let svgContent = '';
    if (type === 'linear') {
      const x1 = Math.round(50 - Math.cos((angle * Math.PI) / 180) * 50);
      const y1 = Math.round(50 - Math.sin((angle * Math.PI) / 180) * 50);
      const x2 = Math.round(50 + Math.cos((angle * Math.PI) / 180) * 50);
      const y2 = Math.round(50 + Math.sin((angle * Math.PI) / 180) * 50);

      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1000 600">
  <defs>
    <linearGradient id="grad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
      ${stops.map((s) => `<stop offset="${s.position}%" stop-color="${s.color}" />`).join('\n      ')}
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)" />
</svg>`;
    } else {
      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1000 600">
  <defs>
    <radialGradient id="grad" cx="50%" cy="50%" r="50%">
      ${stops.map((s) => `<stop offset="${s.position}%" stop-color="${s.color}" />`).join('\n      ')}
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)" />
</svg>`;
    }

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `gradient-${type}-${Date.now()}.svg`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none">
      {/* Left Customization Panel */}
      <aside className="w-80 h-full min-h-0 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Gradient Settings
            </span>
          </div>
          <button
            type="button"
            onClick={handleShuffle}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>
        </div>

        {/* Gradient Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Gradient Type
          </label>
          <SegmentedPicker<GradientType>
            value={type}
            onChange={setType}
            options={[
              { value: 'linear', label: 'Linear' },
              { value: 'radial', label: 'Radial' },
              { value: 'conic', label: 'Conic' }
            ]}
          />
        </div>

        {/* Angle control for linear / conic */}
        {type !== 'radial' && (
          <SliderControl
            label="Gradient Angle"
            value={angle}
            min={0}
            max={360}
            step={1}
            isAngle={true}
            onChange={setAngle}
          />
        )}

        {/* Radial controls */}
        {type === 'radial' && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Shape
              </label>
              <SegmentedPicker<'circle' | 'ellipse'>
                value={radialShape}
                onChange={setRadialShape}
                options={[
                  { value: 'circle', label: 'Circle' },
                  { value: 'ellipse', label: 'Ellipse' }
                ]}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Center Origin
              </label>
              <SegmentedPicker<'center' | 'top left' | 'bottom right'>
                value={radialPos}
                onChange={setRadialPos}
                options={[
                  { value: 'center', label: 'Center' },
                  { value: 'top left', label: 'Top Left' },
                  { value: 'bottom right', label: 'Bottom Right' }
                ]}
              />
            </div>
          </div>
        )}

        {/* Color Stops Manager */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Color Stops ({stops.length}/8)
            </label>
            {stops.length < 8 && (
              <button
                type="button"
                onClick={handleAddStop}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stop</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            {stops.map((stop, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => handleUpdateStop(i, { color: e.target.value })}
                  className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0 bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={stop.color.toUpperCase()}
                  onChange={(e) => handleUpdateStop(i, { color: e.target.value })}
                  className="w-18 px-1.5 py-1 text-xs font-mono rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none"
                />
                <div className="flex-1 flex items-center gap-1">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={stop.position}
                    onChange={(e) => handleUpdateStop(i, { position: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
                    {stop.position}%
                  </span>
                </div>
                {stops.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveStop(i)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-col gap-2 pt-4 mt-auto">
          <button
            type="button"
            onClick={handleCopyCss}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied CSS!' : 'Copy CSS Gradient'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PNG (4K)</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              <span>SVG File</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Preview Center */}
      <main className="flex-1 canvas-grid-bg flex items-center justify-center p-8 overflow-hidden">
        <div
          className="w-full max-w-4xl h-[70vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 transition-all duration-300"
          style={{ background: getCssGradient() }}
        />
      </main>
    </div>
  );
};
