import React, { useState } from 'react';
import { Copy, Check, TrendingUp, RotateCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SvgChartStudio: React.FC = () => {
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
  const [dataPoints, setDataPoints] = useState<number[]>([25, 60, 45, 90, 75, 120, 110, 150]);
  const [strokeWidth, setStrokeWidth] = useState<number>(3.5);
  const [lineColor, setLineColor] = useState<string>('#0071e3');
  const [fillColor, setFillColor] = useState<string>('#38bdf8');
  const [showDots, setShowDots] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState(false);

  const randomizeData = () => {
    setDataPoints(
      Array.from({ length: 8 }, () => Math.floor(20 + Math.random() * 140))
    );
  };

  // Generate SVG path coordinate strings
  const width = 720;
  const height = 400;
  const padding = 60;
  const maxVal = Math.max(...dataPoints, 160);
  const stepX = (width - padding * 2) / (dataPoints.length - 1);

  const points = dataPoints.map((val, i) => ({
    x: padding + i * stepX,
    y: height - padding - (val / maxVal) * (height - padding * 2)
  }));

  // Build smooth cubic bezier spline
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const mx = (p0.x + p1.x) / 2;
    pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const copySvg = () => {
    const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${fillColor}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="${fillColor}" stop-opacity="0" />
    </linearGradient>
  </defs>
  ${chartType === 'area' ? `<path d="${areaD}" fill="url(#chart-grad)" />` : ''}
  <path d="${pathD}" fill="none" stroke="${lineColor}" stroke-width="${strokeWidth}" stroke-linecap="round" />
  ${showDots ? points.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="5" fill="${lineColor}" stroke="#ffffff" stroke-width="2.5" />`).join('\n  ') : ''}
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
            <TrendingUp className="w-4 h-4 text-[#0071e3]" />
            <span className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
              SVG Chart Generator
            </span>
          </div>
          <button
            type="button"
            onClick={randomizeData}
            className="p-1.5 rounded-lg hover:bg-[#f2f2f7] text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer"
            title="Randomize Data"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Chart Style Switcher */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-2">
          <span className="text-xs font-medium text-[#1d1d1f]">Chart Visualization</span>
          <div className="grid grid-cols-3 gap-1 p-0.5 rounded-full bg-[#f2f2f7] border border-[#e5e5ea] text-xs">
            {(['area', 'line', 'bar'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setChartType(t)}
                className={`py-1 rounded-full font-medium capitalize transition-all cursor-pointer ${
                  chartType === t
                    ? 'bg-white text-[#1d1d1f] shadow-2xs font-semibold'
                    : 'text-[#86868b]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Stroke & Style Controls */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Stroke Weight</span>
              <span className="font-mono text-[#1d1d1f]">{strokeWidth}px</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="8"
              step="0.5"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#1d1d1f]">Data Point Markers</span>
            <input
              type="checkbox"
              checked={showDots}
              onChange={(e) => setShowDots(e.target.checked)}
              className="w-4 h-4 text-[#0071e3]"
            />
          </div>
        </div>

        {/* Colors Panel */}
        <div className="p-3.5 border-b border-[#e5e5ea] grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-[#86868b]">Line Stroke</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={lineColor}
                onChange={(e) => setLineColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-[#e5e5ea] p-0.5 bg-white"
              />
              <span className="text-xs font-mono text-[#1d1d1f]">{lineColor}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-[#86868b]">Area Fill</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-[#e5e5ea] p-0.5 bg-white"
              />
              <span className="text-xs font-mono text-[#1d1d1f]">{fillColor}</span>
            </div>
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

      {/* Main SVG Preview Area */}
      <main className="relative flex-1 h-full apple-grid-bg flex items-center justify-center p-8 overflow-hidden select-none">
        <div className="relative w-[720px] h-[400px] rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#000000]/10 bg-white p-4">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            <defs>
              <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fillColor} stopOpacity="0.4" />
                <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Guideline Ticks */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e5ea" strokeWidth="1" />
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#e5e5ea" strokeWidth="1" strokeDasharray="4 4" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#e5e5ea" strokeWidth="1" strokeDasharray="4 4" />

            {/* Chart Render */}
            {chartType === 'bar' ? (
              points.map((p, idx) => (
                <rect
                  key={idx}
                  x={p.x - 14}
                  y={p.y}
                  width="28"
                  height={height - padding - p.y}
                  rx="6"
                  fill={lineColor}
                />
              ))
            ) : (
              <>
                {chartType === 'area' && (
                  <path d={areaD} fill="url(#chart-area-grad)" />
                )}
                <path
                  d={pathD}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
                {showDots &&
                  points.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r="5.5"
                      fill={lineColor}
                      stroke="#ffffff"
                      strokeWidth="3"
                    />
                  ))}
              </>
            )}
          </svg>
        </div>
      </main>
    </div>
  );
};
