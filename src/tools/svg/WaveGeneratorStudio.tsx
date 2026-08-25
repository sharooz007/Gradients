import React, { useState } from 'react';
import { Download, Copy, Check, Waves, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SliderControl } from '../../components/controls/SliderControl';
import { ToggleSwitch } from '../../components/controls/ToggleSwitch';
import { getRandomPalette } from '../../data/palettes';

export const WaveGeneratorStudio: React.FC = () => {
  const [layers, setLayers] = useState<number>(3);
  const [amplitude, setAmplitude] = useState<number>(80);
  const [wavelength, setWavelength] = useState<number>(4);
  const [colors, setColors] = useState<string[]>(['#4338CA', '#6366F1', '#818CF8', '#C7D2FE']);
  const bgColor = '#0F172A';
  const [flipped, setFlipped] = useState<boolean>(false);
  const [seed, setSeed] = useState<number>(55);
  const [copied, setCopied] = useState(false);

  // Generate SVG path string for a wave layer
  const generateWavePath = (layerIndex: number, totalLayers: number) => {
    const width = 1440;
    const height = 600;
    const baseHeight = 350 + (layerIndex / totalLayers) * 150;
    const layerAmp = amplitude * (1 - (layerIndex / totalLayers) * 0.4);

    let path = `M 0,${baseHeight} `;
    const pointsCount = wavelength + 1;
    const dx = width / (pointsCount - 1);

    let s = seed + layerIndex * 17;
    const random = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < pointsCount; i++) {
      const x = i * dx;
      const waveShift = Math.sin((i / pointsCount) * Math.PI * 2 + layerIndex) * layerAmp;
      const jitter = (random() - 0.5) * layerAmp * 0.4;
      const y = baseHeight + waveShift + jitter;
      pts.push({ x, y });
    }

    // Connect with smooth cubic beziers
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) * 0.5;
      const cy1 = p0.y;
      const cx2 = p0.x + (p1.x - p0.x) * 0.5;
      const cy2 = p1.y;
      path += `C ${cx1},${cy1} ${cx2},${cy2} ${p1.x},${p1.y} `;
    }

    path += `L ${width},${height} L 0,${height} Z`;
    return path;
  };

  const getSvgMarkup = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 600" width="100%" height="100%" preserveAspectRatio="none" style="${flipped ? 'transform: rotate(180deg);' : ''}">
  <rect width="1440" height="600" fill="${bgColor}" />
  ${Array.from({ length: layers })
    .map((_, i) => {
      const col = colors[i % colors.length];
      const opacity = 0.5 + (i / layers) * 0.5;
      return `<path fill="${col}" fill-opacity="${opacity.toFixed(2)}" d="${generateWavePath(i, layers)}" />`;
    })
    .join('\n  ')}
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
    a.download = `layered-waves-${Date.now()}.svg`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  const handleShuffleColors = () => {
    const pal = getRandomPalette();
    setColors(pal);
    setSeed(Math.random() * 10000);
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none">
      {/* Sidebar Controls */}
      <aside className="w-80 h-full min-h-0 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 gap-4 overflow-y-auto custom-scrollbar pb-10">
        <div className="flex flex-col w-full min-h-max">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Layered Wave Controls
            </span>
          </div>
          <button
            type="button"
            onClick={handleShuffleColors}
            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Shuffle</span>
          </button>
        </div>

        {/* Colors */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Layer Colors
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {colors.slice(0, layers).map((col, i) => (
              <input
                key={i}
                type="color"
                value={col}
                onChange={(e) => {
                  const next = [...colors];
                  next[i] = e.target.value;
                  setColors(next);
                }}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
              />
            ))}
          </div>
        </div>

        <SliderControl
          label="Wave Layers"
          value={layers}
          min={1}
          max={6}
          step={1}
          onChange={setLayers}
        />

        <SliderControl
          label="Wave Amplitude (Height)"
          value={amplitude}
          min={20}
          max={200}
          step={5}
          unit="px"
          onChange={setAmplitude}
        />

        <SliderControl
          label="Wave Frequency / Nodes"
          value={wavelength}
          min={2}
          max={8}
          step={1}
          onChange={setWavelength}
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Flip Upside Down</span>
          <ToggleSwitch size="sm" checked={flipped} onChange={setFlipped} />
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
      </div>
      </aside>

      {/* Preview */}
      <main className="flex-1 canvas-grid-bg flex items-center justify-center p-8 overflow-hidden">
        <div
          className="w-full max-w-4xl h-[65vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: getSvgMarkup() }}
        />
      </main>
    </div>
  );
};
