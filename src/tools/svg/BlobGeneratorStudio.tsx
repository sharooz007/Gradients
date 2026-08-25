import React, { useState } from 'react';
import { Download, Copy, Check, Droplet, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SliderControl } from '../../components/controls/SliderControl';
import { ToggleSwitch } from '../../components/controls/ToggleSwitch';

export const BlobGeneratorStudio: React.FC = () => {
  const [points, setPoints] = useState<number>(6);
  const [randomness, setRandomness] = useState<number>(30);
  const size = 400;
  const [color1, setColor1] = useState<string>('#6366F1');
  const [color2, setColor2] = useState<string>('#EC4899');
  const [isGradient, setIsGradient] = useState<boolean>(true);
  const [hasStroke, setHasStroke] = useState<boolean>(false);
  const [seed, setSeed] = useState<number>(101);
  const [copied, setCopied] = useState(false);

  // Generate smooth closed spline blob path
  const generateBlobPath = () => {
    const center = size / 2;
    const baseRadius = size * 0.38;

    let s = seed;
    const random = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    const angles: number[] = [];
    const rads: number[] = [];
    const step = (Math.PI * 2) / points;

    for (let i = 0; i < points; i++) {
      angles.push(i * step);
      const variance = (random() - 0.5) * randomness * 3;
      rads.push(Math.max(size * 0.15, baseRadius + variance));
    }

    const pts = angles.map((a, i) => ({
      x: center + Math.cos(a) * rads[i],
      y: center + Math.sin(a) * rads[i]
    }));

    let path = `M ${pts[0].x},${pts[0].y} `;

    for (let i = 0; i < points; i++) {
      const p0 = pts[i];
      const p1 = pts[(i + 1) % points];
      const pPrev = pts[(i - 1 + points) % points];
      const pNext = pts[(i + 2) % points];

      const cx1 = p0.x + (p1.x - pPrev.x) * 0.25;
      const cy1 = p0.y + (p1.y - pPrev.y) * 0.25;
      const cx2 = p1.x - (pNext.x - p0.x) * 0.25;
      const cy2 = p1.y - (pNext.y - p0.y) * 0.25;

      path += `C ${cx1.toFixed(1)},${cy1.toFixed(1)} ${cx2.toFixed(1)},${cy2.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)} `;
    }

    path += 'Z';
    return path;
  };

  const getSvgMarkup = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="blob-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>
  </defs>
  <path d="${generateBlobPath()}" fill="${isGradient ? 'url(#blob-grad)' : color1}" ${
      hasStroke ? `stroke="${color1}" stroke-width="4" fill-opacity="0.85"` : ''
    } />
</svg>`;
  };

  const handleCopySvg = () => {
    navigator.clipboard.writeText(getSvgMarkup());
    setCopied(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([getSvgMarkup()], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `organic-blob-${Date.now()}.svg`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden select-none">
      {/* Sidebar Controls */}
      <aside className="w-80 h-full border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-pink-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Organic Blob Controls
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSeed(Math.random() * 10000)}
            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reshape</span>
          </button>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-slate-500">Color 1</span>
            <input
              type="color"
              value={color1}
              onChange={(e) => setColor1(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-slate-500">Color 2</span>
            <input
              type="color"
              value={color2}
              onChange={(e) => setColor2(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer border-0 bg-transparent"
            />
          </div>
        </div>

        <SliderControl
          label="Control Points (Complexity)"
          value={points}
          min={3}
          max={12}
          step={1}
          onChange={setPoints}
        />

        <SliderControl
          label="Randomness Variance"
          value={randomness}
          min={5}
          max={60}
          step={2}
          onChange={setRandomness}
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Gradient Fill</span>
          <ToggleSwitch size="sm" checked={isGradient} onChange={setIsGradient} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Outline Stroke</span>
          <ToggleSwitch size="sm" checked={hasStroke} onChange={setHasStroke} />
        </div>

        <div className="flex flex-col gap-2 pt-4 mt-auto">
          <button
            type="button"
            onClick={handleCopySvg}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied SVG Code!' : 'Copy SVG Markup'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSvg}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download .SVG File</span>
          </button>
        </div>
      </aside>

      {/* Preview */}
      <main className="flex-1 canvas-grid-bg flex items-center justify-center p-8 overflow-hidden">
        <div
          className="w-96 h-96 flex items-center justify-center transition-all duration-300 transform hover:scale-105"
          dangerouslySetInnerHTML={{ __html: getSvgMarkup() }}
        />
      </main>
    </div>
  );
};
