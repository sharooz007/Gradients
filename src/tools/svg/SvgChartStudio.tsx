import React, { useState } from 'react';
import { Download, Copy, Check, TrendingUp, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SliderControl } from '../../components/controls/SliderControl';
import { SegmentedPicker } from '../../components/controls/SegmentedPicker';
import { ToggleSwitch } from '../../components/controls/ToggleSwitch';

type ChartType = 'area' | 'line' | 'bar';

export const SvgChartStudio: React.FC = () => {
  const [type, setType] = useState<ChartType>('area');
  const [dataPoints, setDataPoints] = useState<number[]>([25, 40, 30, 65, 45, 80, 70, 95]);
  const [strokeColor, setStrokeColor] = useState<string>('#6366F1');
  const [fillColor, setFillColor] = useState<string>('#EC4899');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [curved, setCurved] = useState<boolean>(true);
  const [showDots, setShowDots] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);

  const width = 800;
  const height = 400;
  const padding = 50;

  const randomizeData = () => {
    const next = Array.from({ length: 8 }).map(() => Math.floor(Math.random() * 80) + 15);
    setDataPoints(next);
  };

  const getPoints = () => {
    const minVal = 0;
    const maxVal = Math.max(...dataPoints, 100);
    const plotW = width - padding * 2;
    const plotH = height - padding * 2;

    return dataPoints.map((val, idx) => {
      const x = padding + (idx / (dataPoints.length - 1)) * plotW;
      const y = height - padding - ((val - minVal) / (maxVal - minVal)) * plotH;
      return { x, y, val };
    });
  };

  const getPath = () => {
    const pts = getPoints();
    if (pts.length === 0) return '';

    let linePath = `M ${pts[0].x},${pts[0].y} `;

    if (curved) {
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const cx1 = p0.x + (p1.x - p0.x) * 0.5;
        const cy1 = p0.y;
        const cx2 = p0.x + (p1.x - p0.x) * 0.5;
        const cy2 = p1.y;
        linePath += `C ${cx1},${cy1} ${cx2},${cy2} ${p1.x},${p1.y} `;
      }
    } else {
      for (let i = 1; i < pts.length; i++) {
        linePath += `L ${pts[i].x},${pts[i].y} `;
      }
    }

    return linePath;
  };

  const getSvgMarkup = () => {
    const pts = getPoints();
    const linePath = getPath();
    const areaPath = `${linePath} L ${pts[pts.length - 1].x},${height - padding} L ${pts[0].x},${height - padding} Z`;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <defs>
    <linearGradient id="chart-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${fillColor}" stop-opacity="0.6" />
      <stop offset="100%" stop-color="${fillColor}" stop-opacity="0.0" />
    </linearGradient>
  </defs>

  <!-- Horizontal baseline grid -->
  <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#E2E8F0" stroke-width="1.5" />

  ${type === 'area' ? `<path d="${areaPath}" fill="url(#chart-grad)" />` : ''}

  ${
    type !== 'bar'
      ? `<path d="${linePath}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />`
      : pts
          .map(
            (p) =>
              `<rect x="${p.x - 18}" y="${p.y}" width="36" height="${height - padding - p.y}" rx="8" fill="${strokeColor}" />`
          )
          .join('\n  ')
  }

  ${
    showDots && type !== 'bar'
      ? pts
          .map(
            (p) =>
              `<circle cx="${p.x}" cy="${p.y}" r="${strokeWidth * 1.5}" fill="#FFFFFF" stroke="${strokeColor}" stroke-width="${strokeWidth * 0.75}" />`
          )
          .join('\n  ')
      : ''
  }
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
    a.download = `svg-chart-${type}-${Date.now()}.svg`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none">
      {/* Sidebar Controls */}
      <aside className="w-80 h-full min-h-0 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              SVG Chart Settings
            </span>
          </div>
          <button
            type="button"
            onClick={randomizeData}
            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Randomize</span>
          </button>
        </div>

        {/* Chart Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Chart Type
          </label>
          <SegmentedPicker<ChartType>
            value={type}
            onChange={setType}
            options={[
              { value: 'area', label: 'Area Fill' },
              { value: 'line', label: 'Line Spark' },
              { value: 'bar', label: 'Bars' }
            ]}
          />
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-slate-500">Stroke Color</span>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-slate-500">Area Color</span>
            <input
              type="color"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer border-0 bg-transparent"
            />
          </div>
        </div>

        <SliderControl
          label="Line Thickness"
          value={strokeWidth}
          min={2}
          max={10}
          step={1}
          unit="px"
          onChange={setStrokeWidth}
        />

        {type !== 'bar' && (
          <>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Smooth Spline Curve</span>
              <ToggleSwitch size="sm" checked={curved} onChange={setCurved} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Data Point Dots</span>
              <ToggleSwitch size="sm" checked={showDots} onChange={setShowDots} />
            </div>
          </>
        )}

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
          className="w-full max-w-3xl h-96 p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: getSvgMarkup() }}
        />
      </main>
    </div>
  );
};
