import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Check,
  Grid,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Plus,
  Trash2,
  FileCode,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GridPreset {
  id: string;
  name: string;
  gridType: 'blueprint' | 'millimeter' | 'dots' | 'isometric' | 'matrix' | 'minimal';
  majorSize: number;
  subdivisions: number;
  majorColor: string;
  minorColor: string;
  bgColor: string;
  showCoords: boolean;
}

const CURATED_GRID_PRESETS: GridPreset[] = [
  {
    id: 'blueprint-navy',
    name: 'Blueprint Architectural',
    gridType: 'blueprint',
    majorSize: 64,
    subdivisions: 4,
    majorColor: 'rgba(0, 180, 255, 0.45)',
    minorColor: 'rgba(0, 180, 255, 0.15)',
    bgColor: '#0a192f',
    showCoords: true
  },
  {
    id: 'cyber-matrix',
    name: 'Cyberpunk Matrix Neon',
    gridType: 'matrix',
    majorSize: 50,
    subdivisions: 5,
    majorColor: 'rgba(0, 242, 254, 0.5)',
    minorColor: 'rgba(0, 242, 254, 0.15)',
    bgColor: '#050b14',
    showCoords: true
  },
  {
    id: 'dark-studio',
    name: 'Dark Studio Grid',
    gridType: 'minimal',
    majorSize: 48,
    subdivisions: 4,
    majorColor: 'rgba(255, 255, 255, 0.18)',
    minorColor: 'rgba(255, 255, 255, 0.05)',
    bgColor: '#0e0f14',
    showCoords: false
  },
  {
    id: 'millimeter-graph',
    name: 'Engineering Graph Paper',
    gridType: 'millimeter',
    majorSize: 50,
    subdivisions: 5,
    majorColor: 'rgba(239, 68, 68, 0.5)',
    minorColor: 'rgba(239, 68, 68, 0.18)',
    bgColor: '#ffffff',
    showCoords: true
  },
  {
    id: 'dot-matrix-clean',
    name: 'Technical Dot Matrix',
    gridType: 'dots',
    majorSize: 32,
    subdivisions: 2,
    majorColor: 'rgba(99, 102, 241, 0.6)',
    minorColor: 'rgba(99, 102, 241, 0.2)',
    bgColor: '#0f172a',
    showCoords: false
  }
];

const ASPECT_PRESETS = [
  { id: '16:9', label: '16:9', width: 1920, height: 1080 },
  { id: '1:1', label: '1:1 Square', width: 1400, height: 1400 },
  { id: '9:16', label: '9:16 Story', width: 1080, height: 1920 },
  { id: '4:3', label: '4:3 Standard', width: 1600, height: 1200 },
  { id: 'banner', label: 'Banner', width: 1500, height: 500 }
];

export const GridBackgroundStudio: React.FC = () => {
  const [gridType, setGridType] = useState<'blueprint' | 'millimeter' | 'dots' | 'isometric' | 'matrix' | 'minimal'>(
    CURATED_GRID_PRESETS[0].gridType
  );
  const [majorSize, setMajorSize] = useState<number>(CURATED_GRID_PRESETS[0].majorSize);
  const [subdivisions, setSubdivisions] = useState<number>(CURATED_GRID_PRESETS[0].subdivisions);
  const [majorColor, setMajorColor] = useState<string>(CURATED_GRID_PRESETS[0].majorColor);
  const [minorColor, setMinorColor] = useState<string>(CURATED_GRID_PRESETS[0].minorColor);
  const [bgColor, setBgColor] = useState<string>(CURATED_GRID_PRESETS[0].bgColor);
  const [showCoords, setShowCoords] = useState<boolean>(CURATED_GRID_PRESETS[0].showCoords);

  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080, label: '16:9' });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('blueprint-navy');
  const [searchPreset, setSearchPreset] = useState('');
  const [presetTab, setPresetTab] = useState<'curated' | 'saved'>('curated');
  const [customPresets, setCustomPresets] = useState<GridPreset[]>([]);
  const [copiedCss, setCopiedCss] = useState(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    style: true,
    sizing: true,
    colors: true,
    canvas: false
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('magic_custom_grid_presets');
      if (saved) setCustomPresets(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    const minorSize = majorSize / Math.max(1, subdivisions);

    // Draw minor grid lines
    ctx.strokeStyle = minorColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= w; x += minorSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += minorSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Draw major grid lines
    ctx.strokeStyle = majorColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x <= w; x += majorSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += majorSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Draw dot accents at major intersections
    if (gridType === 'dots' || gridType === 'matrix') {
      ctx.fillStyle = majorColor;
      for (let x = 0; x <= w; x += majorSize) {
        for (let y = 0; y <= h; y += majorSize) {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Draw coordinate markers
    if (showCoords) {
      ctx.fillStyle = majorColor;
      ctx.font = '10px monospace';
      for (let x = majorSize; x < w; x += majorSize * 2) {
        for (let y = majorSize; y < h; y += majorSize * 2) {
          ctx.fillText(`(${x},${y})`, x + 4, y - 4);
        }
      }
    }
  };

  useEffect(() => {
    renderCanvas();
  });

  const randomize = () => {
    const types: ('blueprint' | 'millimeter' | 'dots' | 'isometric' | 'matrix' | 'minimal')[] = [
      'blueprint',
      'millimeter',
      'dots',
      'isometric',
      'matrix',
      'minimal'
    ];
    setGridType(types[Math.floor(Math.random() * types.length)]);
    setMajorSize(Math.floor(32 + Math.random() * 48));
    setSubdivisions(Math.floor(2 + Math.random() * 6));
  };

  const applyPreset = (preset: GridPreset) => {
    setSelectedPresetId(preset.id);
    setGridType(preset.gridType);
    setMajorSize(preset.majorSize);
    setSubdivisions(preset.subdivisions);
    setMajorColor(preset.majorColor);
    setMinorColor(preset.minorColor);
    setBgColor(preset.bgColor);
    setShowCoords(preset.showCoords);
  };

  const saveCurrentAsPreset = () => {
    const name = prompt('Enter preset name:', `Grid Look #${customPresets.length + 1}`);
    if (!name) return;
    const newPreset: GridPreset = {
      id: `custom-${Date.now()}`,
      name,
      gridType,
      majorSize,
      subdivisions,
      majorColor,
      minorColor,
      bgColor,
      showCoords
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_grid_presets', JSON.stringify(updated));
    setSelectedPresetId(newPreset.id);
    confetti({ particleCount: 40, spread: 60 });
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_grid_presets', JSON.stringify(updated));
  };

  const copyCss = () => {
    const minorSize = majorSize / subdivisions;
    const css = `/* Technical Grid Background CSS */
.grid-bg {
  background-color: ${bgColor};
  background-image:
    linear-gradient(${majorColor} 1px, transparent 1px),
    linear-gradient(90deg, ${majorColor} 1px, transparent 1px),
    linear-gradient(${minorColor} 1px, transparent 1px),
    linear-gradient(90deg, ${minorColor} 1px, transparent 1px);
  background-size: ${majorSize}px ${majorSize}px, ${majorSize}px ${majorSize}px, ${minorSize}px ${minorSize}px, ${minorSize}px ${minorSize}px;
}`;
    navigator.clipboard.writeText(css);
    setCopiedCss(true);
    confetti({ particleCount: 30, spread: 45 });
    setTimeout(() => setCopiedCss(false), 2500);
  };

  const exportPngHighRes = (scale: number = 2) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `technical-grid-${dimensions.width * scale}x${dimensions.height * scale}-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    confetti({ particleCount: 50, spread: 60 });
    setIsExportModalOpen(false);
  };

  const allPresets = presetTab === 'curated' ? CURATED_GRID_PRESETS : customPresets;
  const filteredPresets = allPresets.filter((p) =>
    p.name.toLowerCase().includes(searchPreset.toLowerCase())
  );

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#0e0f14] text-[#f2f2f5] relative">
      {/* 1. Left Control Sidebar */}
      {isLeftCollapsed ? (
        <div className="w-10 h-full shrink-0 border-r border-[#23242c] bg-[#16171d] flex flex-col items-center py-4 z-20">
          <button
            type="button"
            onClick={() => setIsLeftCollapsed(false)}
            className="p-1.5 rounded-lg text-[#8f94a8] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
            title="Expand controls"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <aside className="w-80 h-full min-h-0 shrink-0 border-r border-[#23242c] bg-[#16171d] flex flex-col z-20 overflow-y-auto overflow-x-hidden custom-scrollbar overscroll-contain pb-12 relative">
          {/* Header */}
          <div className="p-3.5 border-b border-[#23242c] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid className="w-4 h-4 text-[#38bdf8]" />
              <span className="text-xs font-bold text-[#f2f2f5] tracking-wide uppercase">
                Technical Grid Studio
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsLeftCollapsed(true)}
              className="p-1 rounded-lg text-[#686c82] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col w-full min-h-max divide-y divide-[#23242c]">
            {/* Section 1: Grid Mode */}
            <div className="p-3.5 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">
                Grid System Style
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'blueprint', label: 'Blueprint' },
                  { id: 'matrix', label: 'Matrix Neon' },
                  { id: 'minimal', label: 'Dark Minimal' },
                  { id: 'millimeter', label: 'Millimeter' },
                  { id: 'dots', label: 'Dot Grid' }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setGridType(st.id as any)}
                    className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      gridType === st.id
                        ? 'border-[#38bdf8] bg-[#38bdf8]/15 text-[#38bdf8] shadow-xs'
                        : 'border-[#2e303b] bg-[#23242c] text-[#8f94a8] hover:text-[#f2f2f5]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Scale & Subdivisions */}
            <div className="p-3.5 flex flex-col gap-3.5">
              <button
                type="button"
                onClick={() => toggleSection('sizing')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:text-[#f2f2f5] cursor-pointer"
              >
                <span>Grid Dimensions</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.sizing ? 'rotate-180' : ''}`} />
              </button>

              {openSections.sizing && (
                <div className="flex flex-col gap-3.5 pt-1">
                  {/* Major Grid Size */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Major Pitch</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{majorSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={24}
                      max={128}
                      step={4}
                      value={majorSize}
                      onChange={(e) => setMajorSize(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#38bdf8]"
                    />
                  </div>

                  {/* Subdivisions */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Subdivisions per Cell</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{subdivisions}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      step={1}
                      value={subdivisions}
                      onChange={(e) => setSubdivisions(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#38bdf8]"
                    />
                  </div>

                  {/* Coordinates Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#23242c] border border-[#2e303b]">
                    <span className="text-xs font-bold text-[#f2f2f5]">Coordinate Numbers</span>
                    <button
                      type="button"
                      onClick={() => setShowCoords(!showCoords)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        showCoords ? 'bg-[#38bdf8]' : 'bg-[#16171d]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          showCoords ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Colors */}
            <div className="p-3.5 flex flex-col gap-3.5">
              <button
                type="button"
                onClick={() => toggleSection('colors')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:text-[#f2f2f5] cursor-pointer"
              >
                <span>Grid Colors</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.colors ? 'rotate-180' : ''}`} />
              </button>

              {openSections.colors && (
                <div className="flex flex-col gap-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#8f94a8]">Major Grid Line</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={majorColor.startsWith('#') ? majorColor : '#00b4ff'}
                        onChange={(e) => setMajorColor(e.target.value)}
                        className="w-7 h-7 rounded-lg border border-[#2e303b] bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#8f94a8]">Minor Grid Line</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={minorColor.startsWith('#') ? minorColor : '#00b4ff'}
                        onChange={(e) => setMinorColor(e.target.value)}
                        className="w-7 h-7 rounded-lg border border-[#2e303b] bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#8f94a8]">Canvas Background</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-7 h-7 rounded-lg border border-[#2e303b] bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-xs text-[#f2f2f5] uppercase">{bgColor}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Canvas Dimensions */}
            <div className="p-3.5 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">
                Aspect Ratio
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {ASPECT_PRESETS.map((ap) => {
                  const isActive = dimensions.label === ap.id;
                  return (
                    <button
                      key={ap.id}
                      type="button"
                      onClick={() => setDimensions({ width: ap.width, height: ap.height, label: ap.id })}
                      className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#38bdf8] bg-[#38bdf8]/15 text-[#38bdf8] shadow-xs'
                          : 'border-[#2e303b] bg-[#23242c] text-[#8f94a8] hover:text-[#f2f2f5]'
                      }`}
                    >
                      {ap.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Central Canvas Viewport */}
      <main className="relative flex-1 h-full studio-grid-bg flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none">
        {/* Top Floating Action Bar */}
        <div className="z-10 shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={randomize}
            className="studio-btn studio-btn-secondary"
            title="Randomize grid layout"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Randomize</span>
          </button>
          <button
            type="button"
            onClick={copyCss}
            className="studio-btn studio-btn-secondary"
            title="Copy CSS Background Gradient"
          >
            {copiedCss ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
            <span>{copiedCss ? 'Copied CSS!' : 'Copy CSS'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="studio-btn studio-btn-primary"
            title="Export 4K PNG"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>

        {/* Center Canvas Framing */}
        <div className="relative w-full flex-1 max-w-4xl flex items-center justify-center min-h-0 my-2">
          <div
            className="relative max-w-full max-h-full rounded-2xl border border-[#2e303b] shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 bg-[#16171d] group select-none"
            style={{
              aspectRatio: `${dimensions.width} / ${dimensions.height}`
            }}
          >
            <canvas
              ref={canvasRef}
              width={dimensions.width}
              height={dimensions.height}
              className="w-full h-full object-contain block pointer-events-none"
            />
          </div>
        </div>

        {/* Bottom Toolbar & Feedback */}
        <div className="w-full shrink-0 flex items-center justify-between text-xs text-[#686c82] px-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8f94a8]">Precision architectural and millimeter grid backgrounds</span>
          </div>
          <div className="font-mono text-[10px] text-[#686c82]">
            {dimensions.width} × {dimensions.height} ({dimensions.label})
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
                <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
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
                Curated ({CURATED_GRID_PRESETS.length})
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
              placeholder="Search grids..."
              value={searchPreset}
              onChange={(e) => setSearchPreset(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] placeholder-[#686c82] outline-none focus:border-[#38bdf8]"
            />
          </div>

          {/* Presets Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 grid grid-cols-2 auto-rows-max gap-2.5 custom-scrollbar overscroll-contain pb-10">
            {filteredPresets.map((preset) => {
              const isSelected = selectedPresetId === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`group relative p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'border-[#38bdf8] bg-[#38bdf8]/15 ring-2 ring-[#38bdf8]/40 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                      : 'border-[#2e303b] hover:border-[#484b5c] bg-[#1a1b24] hover:bg-[#20222d]'
                  }`}
                >
                  {/* Thumbnail Swatch */}
                  <div
                    className="w-full aspect-[4/3] rounded-lg shadow-inner shrink-0 border border-black/30 group-hover:scale-102 transition-transform overflow-hidden relative flex items-center justify-center"
                    style={{
                      backgroundColor: preset.bgColor,
                      backgroundImage: `linear-gradient(${preset.majorColor} 1px, transparent 1px), linear-gradient(90deg, ${preset.majorColor} 1px, transparent 1px)`,
                      backgroundSize: '16px 16px'
                    }}
                  />

                  {/* Info */}
                  <div className="w-full flex flex-col items-center px-0.5 pb-0.5">
                    <span className="text-[10px] font-semibold text-[#8f94a8] group-hover:text-[#f2f2f5] truncate leading-tight text-center w-full">
                      {preset.name}
                    </span>
                  </div>

                  {presetTab === 'saved' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomPreset(preset.id);
                      }}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-white bg-black/70 hover:bg-red-500 transition-all rounded-md"
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
                <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/15 text-[#38bdf8] flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#f2f2f5]">Export Grid Background</h3>
                  <p className="text-xs text-[#8f94a8]">Download Ultra-HD PNG or copy CSS</p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 rounded-lg text-[#686c82] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#8f94a8]">Resolution Scale</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { scale: 1, label: '1x (FHD)' },
                    { scale: 2, label: '2x (2K/Retina)' },
                    { scale: 4, label: '4x (4K Ultra)' }
                  ].map((item) => (
                    <button
                      key={item.scale}
                      type="button"
                      onClick={() => exportPngHighRes(item.scale)}
                      className="py-2.5 px-3 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#38bdf8] text-xs font-semibold text-[#f2f2f5] flex flex-col items-center gap-0.5 transition-all cursor-pointer"
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-[#8f94a8] font-mono">
                        {dimensions.width * item.scale}×{dimensions.height * item.scale}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  copyCss();
                  setIsExportModalOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#2e303b] bg-[#1a1b24] hover:bg-[#23242c] text-xs font-semibold text-[#f2f2f5] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-[#38bdf8]" />
                <span>Copy CSS Linear Gradient Code</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
