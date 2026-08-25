import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Copy,
  Check,
  TrendingUp,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Plus,
  Trash2,
  FileCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChartPreset {
  id: string;
  name: string;
  chartType: 'area' | 'line' | 'bar' | 'step';
  dataPoints: number[];
  lineColor: string;
  fillColor: string;
  strokeWidth: number;
  showDots: boolean;
  showGrid: boolean;
}

const CURATED_CHART_PRESETS: ChartPreset[] = [
  {
    id: 'crypto-bull',
    name: 'Crypto Bullish Run',
    chartType: 'area',
    dataPoints: [20, 35, 42, 68, 55, 95, 120, 160],
    lineColor: '#10b981',
    fillColor: '#059669',
    strokeWidth: 4,
    showDots: true,
    showGrid: true
  },
  {
    id: 'cyber-neon',
    name: 'Cyberpunk Wave',
    chartType: 'area',
    dataPoints: [40, 90, 30, 110, 60, 140, 85, 170],
    lineColor: '#00f2fe',
    fillColor: '#a855f7',
    strokeWidth: 3.5,
    showDots: true,
    showGrid: false
  },
  {
    id: 'saas-mrr',
    name: 'SaaS MRR Growth',
    chartType: 'area',
    dataPoints: [15, 28, 45, 60, 80, 105, 135, 180],
    lineColor: '#6366f1',
    fillColor: '#818cf8',
    strokeWidth: 3,
    showDots: true,
    showGrid: true
  },
  {
    id: 'bar-metrics',
    name: 'Server Throughput',
    chartType: 'bar',
    dataPoints: [45, 80, 65, 110, 95, 130, 115, 160],
    lineColor: '#f59e0b',
    fillColor: '#f97316',
    strokeWidth: 2,
    showDots: false,
    showGrid: true
  }
];

export const SvgChartStudio: React.FC = () => {
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar' | 'step'>('area');
  const [dataPoints, setDataPoints] = useState<number[]>([25, 60, 45, 90, 75, 120, 110, 150]);
  const [strokeWidth, setStrokeWidth] = useState<number>(3.5);
  const [lineColor, setLineColor] = useState<string>('#6366f1');
  const [fillColor, setFillColor] = useState<string>('#818cf8');
  const [showDots, setShowDots] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('saas-mrr');
  const [searchPreset, setSearchPreset] = useState('');
  const [presetTab, setPresetTab] = useState<'curated' | 'saved'>('curated');
  const [customPresets, setCustomPresets] = useState<ChartPreset[]>([]);

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('magic_custom_chart_presets');
      if (saved) setCustomPresets(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const randomizeData = () => {
    setDataPoints(
      Array.from({ length: 8 }, () => Math.floor(20 + Math.random() * 150))
    );
  };

  const width = 800;
  const height = 450;
  const padding = 60;
  const maxVal = Math.max(...dataPoints, 180);
  const stepX = (width - padding * 2) / (dataPoints.length - 1);

  const points = dataPoints.map((val, i) => ({
    x: padding + i * stepX,
    y: height - padding - (val / maxVal) * (height - padding * 2)
  }));

  let pathD = `M ${points[0].x} ${points[0].y}`;
  if (chartType === 'step') {
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i + 1];
      pathD += ` H ${p1.x} V ${p1.y}`;
    }
  } else {
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const generateSvgMarkup = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <defs>
    <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${fillColor}" stop-opacity="0.4" />
      <stop offset="100%" stop-color="${fillColor}" stop-opacity="0.0" />
    </linearGradient>
  </defs>
  ${
    showGrid
      ? `  <g stroke="#23242c" stroke-dasharray="4 4" stroke-width="1">
    <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" />
    <line x1="${padding}" y1="${(height - padding * 2) * 0.5 + padding}" x2="${width - padding}" y2="${(height - padding * 2) * 0.5 + padding}" />
    <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" />
  </g>`
      : ''
  }
  ${
    chartType === 'bar'
      ? points
          .map((p) => {
            const barW = stepX * 0.5;
            const barH = height - padding - p.y;
            return `  <rect x="${p.x - barW / 2}" y="${p.y}" width="${barW}" height="${barH}" rx="6" fill="${lineColor}" />`;
          })
          .join('\n')
      : `  ${chartType === 'area' ? `<path d="${areaD}" fill="url(#chart-grad)" />` : ''}
  <path d="${pathD}" fill="none" stroke="${lineColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />
  ${
    showDots
      ? points
          .map(
            (p) =>
              `  <circle cx="${p.x}" cy="${p.y}" r="6" fill="${lineColor}" stroke="#16171d" stroke-width="3" />`
          )
          .join('\n')
      : ''
  }`
  }
</svg>`;
  };

  const copySvgCode = () => {
    navigator.clipboard.writeText(generateSvgMarkup());
    setCopiedType('SVG');
    confetti({ particleCount: 30, spread: 45 });
    setTimeout(() => setCopiedType(null), 2000);
  };

  const copyReactCode = () => {
    const reactComponent = `import React from 'react';

export const GeneratedChart = () => (
  ${generateSvgMarkup().replace(/class=/g, 'className=')}
);`;
    navigator.clipboard.writeText(reactComponent);
    setCopiedType('REACT');
    confetti({ particleCount: 30, spread: 45 });
    setTimeout(() => setCopiedType(null), 2000);
  };

  const applyPreset = (preset: ChartPreset) => {
    setSelectedPresetId(preset.id);
    setChartType(preset.chartType);
    setDataPoints(preset.dataPoints);
    setLineColor(preset.lineColor);
    setFillColor(preset.fillColor);
    setStrokeWidth(preset.strokeWidth);
    setShowDots(preset.showDots);
    setShowGrid(preset.showGrid);
  };

  const saveCurrentAsPreset = () => {
    const name = prompt('Enter preset name:', `Chart Look #${customPresets.length + 1}`);
    if (!name) return;
    const newPreset: ChartPreset = {
      id: `custom-${Date.now()}`,
      name,
      chartType,
      dataPoints: [...dataPoints],
      lineColor,
      fillColor,
      strokeWidth,
      showDots,
      showGrid
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_chart_presets', JSON.stringify(updated));
    setSelectedPresetId(newPreset.id);
    confetti({ particleCount: 40, spread: 60 });
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_chart_presets', JSON.stringify(updated));
  };

  const allPresets = presetTab === 'curated' ? CURATED_CHART_PRESETS : customPresets;
  const filteredPresets = allPresets.filter((p) =>
    p.name.toLowerCase().includes(searchPreset.toLowerCase())
  );

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#0e0f14] text-[#f2f2f5] relative">
      {isLeftCollapsed ? (
        <div className="w-10 h-full shrink-0 border-r border-[#23242c] bg-[#16171d] flex flex-col items-center py-4 z-20">
          <button type="button" onClick={() => setIsLeftCollapsed(false)} className="p-1.5 rounded-lg text-[#8f94a8] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <aside className="w-80 h-full min-h-0 shrink-0 border-r border-[#23242c] bg-[#16171d] flex flex-col z-20 overflow-y-auto custom-scrollbar pb-12">
          <div className="p-3.5 border-b border-[#23242c] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#818cf8]" />
              <span className="text-xs font-bold text-[#f2f2f5] tracking-wide uppercase">SVG Chart Studio</span>
            </div>
            <button type="button" onClick={() => setIsLeftCollapsed(true)} className="p-1 rounded-lg text-[#686c82] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col w-full divide-y divide-[#23242c]">
            <div className="p-3.5 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">Chart Geometry</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'area', label: 'Area Wave' },
                  { id: 'line', label: 'Line Curve' },
                  { id: 'step', label: 'Step Wave' },
                  { id: 'bar', label: 'Bar Columns' }
                ].map((t) => (
                  <button key={t.id} type="button" onClick={() => setChartType(t.id as any)} className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${chartType === t.id ? 'border-[#818cf8] bg-[#818cf8]/15 text-[#818cf8]' : 'border-[#2e303b] bg-[#23242c] text-[#8f94a8]'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3.5 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">Colors & Stroke</span>
              <div className="flex items-center gap-3">
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[10px] text-[#8f94a8]">Line / Bar Color</span>
                  <div className="flex items-center gap-2">
                    <input type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border border-[#2e303b] bg-transparent" />
                    <span className="font-mono text-xs uppercase">{lineColor}</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[10px] text-[#8f94a8]">Gradient Fill</span>
                  <div className="flex items-center gap-2">
                    <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border border-[#2e303b] bg-transparent" />
                    <span className="font-mono text-xs uppercase">{fillColor}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#8f94a8]">Stroke Width</span>
                  <span className="font-mono font-bold">{strokeWidth}px</span>
                </div>
                <input type="range" min={1} max={8} step={0.5} value={strokeWidth} onChange={(e) => setStrokeWidth(parseFloat(e.target.value))} className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#818cf8]" />
              </div>
            </div>
          </div>
        </aside>
      )}

      <main className="relative flex-1 h-full flex flex-col items-center justify-between p-6 overflow-hidden">
        <div className="z-10 flex items-center gap-2">
          <button type="button" onClick={randomizeData} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2e303b] bg-[#16171d] hover:bg-[#23242c] text-xs font-medium transition-all">
            <Shuffle className="w-3.5 h-3.5 text-[#818cf8]" /> <span>Randomize</span>
          </button>
          <button type="button" onClick={copySvgCode} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2e303b] bg-[#16171d] hover:bg-[#23242c] text-xs font-medium transition-all">
            {copiedType === 'SVG' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />} 
            <span>{copiedType === 'SVG' ? 'Copied!' : 'Copy SVG'}</span>
          </button>
          <button type="button" onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#818cf8] hover:bg-[#6366f1] text-[#fff] text-xs font-semibold transition-all">
            <Download className="w-3.5 h-3.5" /> <span>Export</span>
          </button>
        </div>

        <div className="relative w-full flex-1 max-w-5xl flex items-center justify-center min-h-0 my-2">
          <div className="relative w-full max-w-4xl h-[420px] rounded-2xl border border-[#2e303b] shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden bg-[#16171d] flex items-center justify-center p-6">
            <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-full object-contain">
              <defs>
                <linearGradient id="studio-chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={fillColor} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={fillColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              {showGrid && (
                <g stroke="#23242c" strokeDasharray="4 4" strokeWidth={1}>
                  <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
                  <line x1={padding} y1={(height - padding * 2) * 0.5 + padding} x2={width - padding} y2={(height - padding * 2) * 0.5 + padding} />
                  <line x1={padding} y1={padding} x2={width - padding} y2={padding} />
                </g>
              )}
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
                    <path d={areaD} fill="url(#studio-chart-grad)" />
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
                        stroke="#16171d"
                        strokeWidth="3"
                      />
                    ))}
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Bottom Toolbar */}
        <div className="w-full shrink-0 flex items-center justify-between text-xs text-[#686c82] px-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8f94a8]">Clean vector resolution-independent SVG spline</span>
          </div>
          <div className="font-mono text-[10px] text-[#686c82]">
            {chartType.toUpperCase()} ({dataPoints.length} PTS)
          </div>
        </div>
      </main>

      {/* 3. Right Presets Sidebar */}
      {isRightCollapsed ? (
        <div className="w-10 h-full shrink-0 border-l border-[#23242c] bg-[#16171d] flex flex-col items-center py-4 z-20">
          <button
            type="button"
            onClick={() => setIsRightCollapsed(false)}
            className="p-1.5 rounded-lg text-[#8f94a8] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
            title="Expand presets"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <aside className="w-72 h-full min-h-0 shrink-0 border-l border-[#23242c] bg-[#16171d] flex flex-col z-20 overflow-hidden select-none">
          {/* Header */}
          <div className="p-3.5 shrink-0 border-b border-[#23242c] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#818cf8]" />
                <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">Presets</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={saveCurrentAsPreset}
                  title="Save current look"
                  className="p-1 rounded-lg hover:bg-[#23242c] text-[#8f94a8] hover:text-[#f2f2f5] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsRightCollapsed(true)}
                  title="Collapse presets"
                  className="p-1 rounded-lg hover:bg-[#23242c] text-[#686c82] hover:text-[#f2f2f5] transition-colors cursor-pointer ml-1"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tab switch */}
            <div className="grid grid-cols-2 p-0.5 rounded-full bg-[#23242c] border border-[#2e303b] text-xs">
              <button
                type="button"
                onClick={() => setPresetTab('curated')}
                className={`py-1 rounded-full transition-all cursor-pointer ${
                  presetTab === 'curated'
                    ? 'bg-[#16171d] text-[#f2f2f5] shadow-xs font-semibold'
                    : 'text-[#8f94a8] hover:text-[#f2f2f5]'
                }`}
              >
                Curated ({CURATED_CHART_PRESETS.length})
              </button>
              <button
                type="button"
                onClick={() => setPresetTab('saved')}
                className={`py-1 rounded-full transition-all cursor-pointer ${
                  presetTab === 'saved'
                    ? 'bg-[#16171d] text-[#f2f2f5] shadow-xs font-semibold'
                    : 'text-[#8f94a8] hover:text-[#f2f2f5]'
                }`}
              >
                Saved ({customPresets.length})
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search presets..."
              value={searchPreset}
              onChange={(e) => setSearchPreset(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] placeholder-[#686c82] outline-none focus:border-[#818cf8]"
            />
          </div>

          {/* Presets Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-2.5 custom-scrollbar overscroll-contain pb-10">
            {filteredPresets.map((preset) => {
              const isSelected = selectedPresetId === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'border-[#818cf8] bg-[#818cf8]/15 ring-2 ring-[#818cf8]/40 shadow-[0_0_12px_rgba(129,140,248,0.25)]'
                      : 'border-[#2e303b] hover:border-[#484b5c] bg-[#1a1b24] hover:bg-[#20222d]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#f2f2f5] truncate">
                      {preset.name}
                    </span>
                    <span className="font-mono text-[10px] text-[#818cf8] uppercase">
                      {preset.chartType}
                    </span>
                  </div>

                  <div className="w-full h-8 rounded-lg bg-[#16171d] border border-black/30 flex items-center px-2">
                    <div
                      className="w-full h-1 rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${preset.lineColor}, ${preset.fillColor})`
                      }}
                    />
                  </div>

                  {presetTab === 'saved' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomPreset(preset.id);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-white bg-black/70 hover:bg-red-500 transition-all rounded-md"
                      title="Delete preset"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#16171d] rounded-2xl shadow-2xl border border-[#2e303b] overflow-hidden flex flex-col text-[#f2f2f5]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#23242c]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#818cf8]/15 text-[#818cf8] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#f2f2f5]">Export SVG Chart</h3>
                  <p className="text-xs text-[#8f94a8]">Copy Raw SVG or React Component</p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 rounded-lg text-[#686c82] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  copySvgCode();
                  setIsExportModalOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#818cf8] text-xs font-semibold text-[#f2f2f5] flex items-center justify-between transition-all cursor-pointer"
              >
                <span>Raw SVG XML Code</span>
                <Copy className="w-3.5 h-3.5 text-[#818cf8]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  copyReactCode();
                  setIsExportModalOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#818cf8] text-xs font-semibold text-[#f2f2f5] flex items-center justify-between transition-all cursor-pointer"
              >
                <span>React Component (JSX)</span>
                <Copy className="w-3.5 h-3.5 text-[#818cf8]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

