import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Check,
  Dot,
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

interface PolkaPreset {
  id: string;
  name: string;
  layoutMode: 'square' | 'staggered';
  radius: number;
  spacing: number;
  dotColor: string;
  bgColor: string;
  opacity: number;
}

const CURATED_POLKA_PRESETS: PolkaPreset[] = [
  {
    id: 'classic-red',
    name: 'Classic Cherry Pop',
    layoutMode: 'staggered',
    radius: 7,
    spacing: 36,
    dotColor: '#f43f5e',
    bgColor: '#1c1015',
    opacity: 1.0
  },
  {
    id: 'cyber-cyan',
    name: 'Cyberpunk Neon Dots',
    layoutMode: 'staggered',
    radius: 5,
    spacing: 28,
    dotColor: '#00f2fe',
    bgColor: '#080814',
    opacity: 0.9
  },
  {
    id: 'emerald-matrix',
    name: 'Emerald Hex Matrix',
    layoutMode: 'staggered',
    radius: 6,
    spacing: 32,
    dotColor: '#10b981',
    bgColor: '#022c22',
    opacity: 0.85
  },
  {
    id: 'dark-minimal',
    name: 'Dark Minimal Matrix',
    layoutMode: 'square',
    radius: 3,
    spacing: 24,
    dotColor: '#ffffff',
    bgColor: '#0e0f14',
    opacity: 0.25
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Staggered',
    layoutMode: 'staggered',
    radius: 8,
    spacing: 40,
    dotColor: '#c084fc',
    bgColor: '#180a29',
    opacity: 0.95
  }
];

const ASPECT_PRESETS = [
  { id: '16:9', label: '16:9', width: 1920, height: 1080 },
  { id: '1:1', label: '1:1 Square', width: 1400, height: 1400 },
  { id: '9:16', label: '9:16 Story', width: 1080, height: 1920 },
  { id: '4:3', label: '4:3 Standard', width: 1600, height: 1200 },
  { id: 'banner', label: 'Banner', width: 1500, height: 500 }
];

export const PolkaDotStudio: React.FC = () => {
  const [layoutMode, setLayoutMode] = useState<'square' | 'staggered'>(CURATED_POLKA_PRESETS[0].layoutMode);
  const [radius, setRadius] = useState<number>(CURATED_POLKA_PRESETS[0].radius);
  const [spacing, setSpacing] = useState<number>(CURATED_POLKA_PRESETS[0].spacing);
  const [dotColor, setDotColor] = useState<string>(CURATED_POLKA_PRESETS[0].dotColor);
  const [bgColor, setBgColor] = useState<string>(CURATED_POLKA_PRESETS[0].bgColor);
  const [opacity, setOpacity] = useState<number>(CURATED_POLKA_PRESETS[0].opacity);

  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080, label: '16:9' });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('classic-red');
  const [searchPreset, setSearchPreset] = useState('');
  const [presetTab, setPresetTab] = useState<'curated' | 'saved'>('curated');
  const [customPresets, setCustomPresets] = useState<PolkaPreset[]>([]);
  const [copiedCss, setCopiedCss] = useState(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    layout: true,
    geometry: true,
    colors: true,
    canvas: false
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('magic_custom_polka_presets');
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

    ctx.fillStyle = dotColor;
    ctx.globalAlpha = opacity;

    if (layoutMode === 'square') {
      for (let y = 0; y <= h + spacing; y += spacing) {
        for (let x = 0; x <= w + spacing; x += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      const half = spacing / 2;
      for (let y = 0; y <= h + spacing; y += spacing) {
        for (let x = 0; x <= w + spacing; x += spacing) {
          // Primary grid
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Staggered offset grid
          ctx.beginPath();
          ctx.arc(x + half, y + half, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.globalAlpha = 1.0;
  };

  useEffect(() => {
    renderCanvas();
  });

  const randomize = () => {
    setLayoutMode(Math.random() > 0.5 ? 'square' : 'staggered');
    setRadius(Math.floor(3 + Math.random() * 12));
    setSpacing(Math.floor(20 + Math.random() * 40));
    setOpacity(0.4 + Math.random() * 0.6);

    const palettes = [
      ['#f43f5e', '#1c1015'],
      ['#00f2fe', '#080814'],
      ['#10b981', '#022c22'],
      ['#fbbf24', '#1f1501'],
      ['#c084fc', '#180a29'],
      ['#38bdf8', '#0c1a29']
    ];
    const p = palettes[Math.floor(Math.random() * palettes.length)];
    setDotColor(p[0]);
    setBgColor(p[1]);
  };

  const applyPreset = (preset: PolkaPreset) => {
    setSelectedPresetId(preset.id);
    setLayoutMode(preset.layoutMode);
    setRadius(preset.radius);
    setSpacing(preset.spacing);
    setDotColor(preset.dotColor);
    setBgColor(preset.bgColor);
    setOpacity(preset.opacity);
  };

  const saveCurrentAsPreset = () => {
    const name = prompt('Enter preset name:', `Polka Look #${customPresets.length + 1}`);
    if (!name) return;
    const newPreset: PolkaPreset = {
      id: `custom-${Date.now()}`,
      name,
      layoutMode,
      radius,
      spacing,
      dotColor,
      bgColor,
      opacity
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_polka_presets', JSON.stringify(updated));
    setSelectedPresetId(newPreset.id);
    confetti({ particleCount: 40, spread: 60 });
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_polka_presets', JSON.stringify(updated));
  };

  const getCssCode = () => {
    if (layoutMode === 'square') {
      return `/* Polka Dot Background CSS */
.polka-bg {
  background-color: ${bgColor};
  background-image: radial-gradient(${dotColor} ${radius}px, transparent ${radius}px);
  background-size: ${spacing}px ${spacing}px;
}`;
    } else {
      const half = spacing / 2;
      return `/* Staggered Polka Dot Background CSS */
.polka-bg {
  background-color: ${bgColor};
  background-image:
    radial-gradient(${dotColor} ${radius}px, transparent ${radius}px),
    radial-gradient(${dotColor} ${radius}px, transparent ${radius}px);
  background-position: 0 0, ${half}px ${half}px;
  background-size: ${spacing}px ${spacing}px;
}`;
    }
  };

  const copyCss = () => {
    navigator.clipboard.writeText(getCssCode());
    setCopiedCss(true);
    confetti({ particleCount: 30, spread: 45 });
    setTimeout(() => setCopiedCss(false), 2500);
  };

  const exportPngHighRes = (scale: number = 2) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `polka-dot-matrix-${dimensions.width * scale}x${dimensions.height * scale}-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    confetti({ particleCount: 50, spread: 60 });
    setIsExportModalOpen(false);
  };

  const allPresets = presetTab === 'curated' ? CURATED_POLKA_PRESETS : customPresets;
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
              <Dot className="w-5 h-5 text-[#f43f5e]" />
              <span className="text-xs font-bold text-[#f2f2f5] tracking-wide uppercase">
                Polka Dot Studio
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
                Matrix Arrangement
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'staggered', label: 'Staggered Hex' },
                  { id: 'square', label: 'Square Matrix' }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setLayoutMode(st.id as any)}
                    className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      layoutMode === st.id
                        ? 'border-[#f43f5e] bg-[#f43f5e]/15 text-[#f43f5e] shadow-xs'
                        : 'border-[#2e303b] bg-[#23242c] text-[#8f94a8] hover:text-[#f2f2f5]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Radius & Pitch */}
            <div className="p-3.5 flex flex-col gap-3.5">
              <button
                type="button"
                onClick={() => toggleSection('geometry')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:text-[#f2f2f5] cursor-pointer"
              >
                <span>Dot Parameters</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.geometry ? 'rotate-180' : ''}`} />
              </button>

              {openSections.geometry && (
                <div className="flex flex-col gap-3.5 pt-1">
                  {/* Dot Radius */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Dot Radius</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{radius}px</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={28}
                      step={1}
                      value={radius}
                      onChange={(e) => setRadius(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#f43f5e]"
                    />
                  </div>

                  {/* Pitch Spacing */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Grid Pitch</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{spacing}px</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={84}
                      step={2}
                      value={spacing}
                      onChange={(e) => setSpacing(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#f43f5e]"
                    />
                  </div>

                  {/* Dot Opacity */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Dot Opacity</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{Math.round(opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={opacity}
                      onChange={(e) => setOpacity(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#f43f5e]"
                    />
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
                <span>Dot & Canvas Colors</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.colors ? 'rotate-180' : ''}`} />
              </button>

              {openSections.colors && (
                <div className="flex flex-col gap-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#8f94a8]">Dot Ink Color</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={dotColor}
                        onChange={(e) => setDotColor(e.target.value)}
                        className="w-7 h-7 rounded-lg border border-[#2e303b] bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-xs text-[#f2f2f5] uppercase">{dotColor}</span>
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
                          ? 'border-[#f43f5e] bg-[#f43f5e]/15 text-[#f43f5e] shadow-xs'
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
            title="Randomize dot matrix"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#f43f5e]" />
            <span>Randomize</span>
          </button>
          <button
            type="button"
            onClick={copyCss}
            className="studio-btn studio-btn-secondary"
            title="Copy CSS Radial Gradient Code"
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
            <span className="text-[11px] text-[#8f94a8]">Pure CSS radial-gradient polka dot matrices</span>
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
                <Sparkles className="w-3.5 h-3.5 text-[#f43f5e]" />
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
                Curated ({CURATED_POLKA_PRESETS.length})
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
              placeholder="Search polka dots..."
              value={searchPreset}
              onChange={(e) => setSearchPreset(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] placeholder-[#686c82] outline-none focus:border-[#f43f5e]"
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
                      ? 'border-[#f43f5e] bg-[#f43f5e]/15 ring-2 ring-[#f43f5e]/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                      : 'border-[#2e303b] hover:border-[#484b5c] bg-[#1a1b24] hover:bg-[#20222d]'
                  }`}
                >
                  {/* Thumbnail Swatch */}
                  <div
                    className="w-full aspect-[4/3] rounded-lg shadow-inner shrink-0 border border-black/30 group-hover:scale-102 transition-transform overflow-hidden relative flex items-center justify-center"
                    style={{
                      backgroundColor: preset.bgColor,
                      backgroundImage: `radial-gradient(${preset.dotColor} 4px, transparent 4px)`,
                      backgroundSize: '14px 14px'
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
                <div className="w-8 h-8 rounded-lg bg-[#f43f5e]/15 text-[#f43f5e] flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#f2f2f5]">Export Polka Dot Matrix</h3>
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
                      className="py-2.5 px-3 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#f43f5e] text-xs font-semibold text-[#f2f2f5] flex flex-col items-center gap-0.5 transition-all cursor-pointer"
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
                <FileCode className="w-4 h-4 text-[#f43f5e]" />
                <span>Copy CSS Background Code</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
