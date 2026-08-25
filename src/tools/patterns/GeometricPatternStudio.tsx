import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Check,
  Boxes,
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

interface GeometricPreset {
  id: string;
  name: string;
  patternType: 'isometric-cubes' | 'triangles' | 'hexagons' | 'scales' | 'octagons' | 'zigzag';
  scale: number;
  strokeWidth: number;
  color1: string;
  color2: string;
  color3: string;
  bgColor: string;
}

const CURATED_GEOMETRIC_PRESETS: GeometricPreset[] = [
  {
    id: 'bauhaus-iso',
    name: 'Bauhaus 3D Cubes',
    patternType: 'isometric-cubes',
    scale: 64,
    strokeWidth: 1.5,
    color1: '#6366f1',
    color2: '#4f46e5',
    color3: '#818cf8',
    bgColor: '#0f172a'
  },
  {
    id: 'cyber-hex',
    name: 'Cyberpunk Hex Matrix',
    patternType: 'hexagons',
    scale: 48,
    strokeWidth: 2,
    color1: '#00f2fe',
    color2: '#ff007f',
    color3: '#7928ca',
    bgColor: '#0a0a14'
  },
  {
    id: 'emerald-scales',
    name: 'Emerald Scales',
    patternType: 'scales',
    scale: 72,
    strokeWidth: 1.5,
    color1: '#10b981',
    color2: '#059669',
    color3: '#34d399',
    bgColor: '#022c22'
  },
  {
    id: 'sunset-triangles',
    name: 'Sunset Prisms',
    patternType: 'triangles',
    scale: 54,
    strokeWidth: 1.2,
    color1: '#ff4b72',
    color2: '#fbbf24',
    color3: '#f97316',
    bgColor: '#1c1018'
  },
  {
    id: 'obsidian-lattice',
    name: 'Obsidian Octagons',
    patternType: 'octagons',
    scale: 50,
    strokeWidth: 2,
    color1: '#38bdf8',
    color2: '#1e293b',
    color3: '#64748b',
    bgColor: '#0b0f19'
  }
];

const ASPECT_PRESETS = [
  { id: '16:9', label: '16:9', width: 1920, height: 1080 },
  { id: '1:1', label: '1:1 Square', width: 1400, height: 1400 },
  { id: '9:16', label: '9:16 Story', width: 1080, height: 1920 },
  { id: '4:3', label: '4:3 Standard', width: 1600, height: 1200 },
  { id: 'banner', label: 'Banner', width: 1500, height: 500 }
];

export const GeometricPatternStudio: React.FC = () => {
  const [patternType, setPatternType] = useState<'isometric-cubes' | 'triangles' | 'hexagons' | 'scales' | 'octagons' | 'zigzag'>(
    CURATED_GEOMETRIC_PRESETS[0].patternType
  );
  const [scale, setScale] = useState<number>(CURATED_GEOMETRIC_PRESETS[0].scale);
  const [strokeWidth, setStrokeWidth] = useState<number>(CURATED_GEOMETRIC_PRESETS[0].strokeWidth);
  const [color1, setColor1] = useState<string>(CURATED_GEOMETRIC_PRESETS[0].color1);
  const [color2, setColor2] = useState<string>(CURATED_GEOMETRIC_PRESETS[0].color2);
  const [color3, setColor3] = useState<string>(CURATED_GEOMETRIC_PRESETS[0].color3);
  const [bgColor, setBgColor] = useState<string>(CURATED_GEOMETRIC_PRESETS[0].bgColor);

  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080, label: '16:9' });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('bauhaus-iso');
  const [searchPreset, setSearchPreset] = useState('');
  const [presetTab, setPresetTab] = useState<'curated' | 'saved'>('curated');
  const [customPresets, setCustomPresets] = useState<GeometricPreset[]>([]);
  const [copiedSvg, setCopiedSvg] = useState(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    geometry: true,
    palette: true,
    canvas: false
  });

  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('magic_custom_geom_presets');
      if (saved) setCustomPresets(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getSvgPatternMarkup = () => {
    if (patternType === 'isometric-cubes') {
      return `
        <pattern id="iso-cubes" width="${scale}" height="${scale * 1.732}" patternUnits="userSpaceOnUse">
          <path d="M${scale / 2} 0 L${scale} ${scale * 0.288} L${scale} ${scale * 0.866} L${scale / 2} ${scale * 0.577} Z" fill="${color1}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <path d="M0 ${scale * 0.288} L${scale / 2} 0 L${scale / 2} ${scale * 0.577} L0 ${scale * 0.866} Z" fill="${color2}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <path d="M0 ${scale * 0.866} L${scale / 2} ${scale * 0.577} L${scale} ${scale * 0.866} L${scale / 2} ${scale * 1.155} Z" fill="${color3}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <path d="M${scale / 2} ${scale * 0.866} L${scale} ${scale * 1.155} L${scale} ${scale * 1.732} L${scale / 2} ${scale * 1.443} Z" fill="${color1}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <path d="M0 ${scale * 1.155} L${scale / 2} ${scale * 0.866} L${scale / 2} ${scale * 1.443} L0 ${scale * 1.732} Z" fill="${color2}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <path d="M0 ${scale * 1.732} L${scale / 2} ${scale * 1.443} L${scale} ${scale * 1.732} L${scale / 2} ${scale * 2.02} Z" fill="${color3}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
        </pattern>`;
    } else if (patternType === 'triangles') {
      return `
        <pattern id="triangles" width="${scale}" height="${scale}" patternUnits="userSpaceOnUse">
          <polygon points="0,0 ${scale},0 ${scale / 2},${scale}" fill="${color1}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <polygon points="0,0 0,${scale} ${scale / 2},${scale}" fill="${color2}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <polygon points="${scale},0 ${scale},${scale} ${scale / 2},${scale}" fill="${color3}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
        </pattern>`;
    } else if (patternType === 'hexagons') {
      return `
        <pattern id="hexagons" width="${scale * 1.732}" height="${scale * 3}" patternUnits="userSpaceOnUse">
          <polygon points="${scale * 0.866},0 ${scale * 1.732},${scale * 0.5} ${scale * 1.732},${scale * 1.5} ${scale * 0.866},${scale * 2} 0,${scale * 1.5} 0,${scale * 0.5}" fill="${color1}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <polygon points="${scale * 0.866},${scale * 2} ${scale * 1.732},${scale * 2.5} ${scale * 1.732},${scale * 3.5} ${scale * 0.866},${scale * 4} 0,${scale * 3.5} 0,${scale * 2.5}" fill="${color2}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
        </pattern>`;
    } else if (patternType === 'scales') {
      return `
        <pattern id="scales" width="${scale}" height="${scale * 0.75}" patternUnits="userSpaceOnUse">
          <path d="M0 ${scale * 0.75} A ${scale / 2} ${scale / 2} 0 0 1 ${scale} ${scale * 0.75} Z" fill="${color1}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <path d="M${-scale / 2} 0 A ${scale / 2} ${scale / 2} 0 0 1 ${scale / 2} 0 Z" fill="${color2}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <path d="M${scale / 2} 0 A ${scale / 2} ${scale / 2} 0 0 1 ${scale * 1.5} 0 Z" fill="${color3}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
        </pattern>`;
    } else if (patternType === 'zigzag') {
      return `
        <pattern id="zigzag" width="${scale}" height="${scale * 0.6}" patternUnits="userSpaceOnUse">
          <path d="M0 0 L${scale / 2} ${scale * 0.3} L${scale} 0 L${scale} ${scale * 0.3} L${scale / 2} ${scale * 0.6} L0 ${scale * 0.3} Z" fill="${color1}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <path d="M0 ${scale * 0.3} L${scale / 2} ${scale * 0.6} L${scale} ${scale * 0.3} L${scale} ${scale * 0.6} L${scale / 2} ${scale * 0.9} L0 ${scale * 0.6} Z" fill="${color2}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
        </pattern>`;
    } else {
      return `
        <pattern id="octagons" width="${scale}" height="${scale}" patternUnits="userSpaceOnUse">
          <polygon points="${scale * 0.3},0 ${scale * 0.7},0 ${scale},${scale * 0.3} ${scale},${scale * 0.7} ${scale * 0.7},${scale} ${scale * 0.3},${scale} 0,${scale * 0.7} 0,${scale * 0.3}" fill="${color1}" stroke="${bgColor}" stroke-width="${strokeWidth}" />
          <rect x="${scale * 0.4}" y="${scale * 0.4}" width="${scale * 0.2}" height="${scale * 0.2}" fill="${color2}" />
        </pattern>`;
    }
  };

  const randomize = () => {
    const types: ('isometric-cubes' | 'triangles' | 'hexagons' | 'scales' | 'octagons' | 'zigzag')[] = [
      'isometric-cubes',
      'triangles',
      'hexagons',
      'scales',
      'octagons',
      'zigzag'
    ];
    setPatternType(types[Math.floor(Math.random() * types.length)]);
    setScale(Math.floor(36 + Math.random() * 64));
    setStrokeWidth(1 + Math.random() * 2);

    const palettes = [
      ['#3b82f6', '#1d4ed8', '#60a5fa', '#0b132b'],
      ['#ec4899', '#be185d', '#f472b6', '#1e1b4b'],
      ['#10b981', '#047857', '#34d399', '#064e3b'],
      ['#f59e0b', '#b45309', '#fbbf24', '#451a03'],
      ['#a855f7', '#7e22ce', '#c084fc', '#130421'],
      ['#00f2fe', '#4facfe', '#ff0844', '#050b14']
    ];
    const p = palettes[Math.floor(Math.random() * palettes.length)];
    setColor1(p[0]);
    setColor2(p[1]);
    setColor3(p[2]);
    setBgColor(p[3]);
  };

  const applyPreset = (preset: GeometricPreset) => {
    setSelectedPresetId(preset.id);
    setPatternType(preset.patternType);
    setScale(preset.scale);
    setStrokeWidth(preset.strokeWidth);
    setColor1(preset.color1);
    setColor2(preset.color2);
    setColor3(preset.color3);
    setBgColor(preset.bgColor);
  };

  const saveCurrentAsPreset = () => {
    const name = prompt('Enter preset name:', `Geometric Look #${customPresets.length + 1}`);
    if (!name) return;
    const newPreset: GeometricPreset = {
      id: `custom-${Date.now()}`,
      name,
      patternType,
      scale,
      strokeWidth,
      color1,
      color2,
      color3,
      bgColor
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_geom_presets', JSON.stringify(updated));
    setSelectedPresetId(newPreset.id);
    confetti({ particleCount: 40, spread: 60 });
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_geom_presets', JSON.stringify(updated));
  };

  const copySvg = () => {
    const patternId = patternType === 'isometric-cubes' ? 'iso-cubes' : patternType;
    const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${dimensions.width} ${dimensions.height}">
  <defs>${getSvgPatternMarkup()}</defs>
  <rect width="100%" height="100%" fill="${bgColor}" />
  <rect width="100%" height="100%" fill="url(#${patternId})" />
</svg>`;
    navigator.clipboard.writeText(svgCode);
    setCopiedSvg(true);
    confetti({ particleCount: 30, spread: 45 });
    setTimeout(() => setCopiedSvg(false), 2500);
  };

  const exportPng = (resScale: number = 2) => {
    const patternId = patternType === 'isometric-cubes' ? 'iso-cubes' : patternType;
    const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.width * resScale}" height="${dimensions.height * resScale}" viewBox="0 0 ${dimensions.width} ${dimensions.height}">
  <defs>${getSvgPatternMarkup()}</defs>
  <rect width="100%" height="100%" fill="${bgColor}" />
  <rect width="100%" height="100%" fill="url(#${patternId})" />
</svg>`;

    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = dimensions.width * resScale;
      canvas.height = dimensions.height * resScale;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(image, 0, 0);
        const a = document.createElement('a');
        a.download = `geometric-pattern-${dimensions.width * resScale}x${dimensions.height * resScale}-${Date.now()}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
        confetti({ particleCount: 50, spread: 60 });
        setIsExportModalOpen(false);
      }
    };
    image.src = blobURL;
  };

  const allPresets = presetTab === 'curated' ? CURATED_GEOMETRIC_PRESETS : customPresets;
  const filteredPresets = allPresets.filter((p) =>
    p.name.toLowerCase().includes(searchPreset.toLowerCase())
  );

  const activePatternId = patternType === 'isometric-cubes' ? 'iso-cubes' : patternType;

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
              <Boxes className="w-4 h-4 text-[#818cf8]" />
              <span className="text-xs font-bold text-[#f2f2f5] tracking-wide uppercase">
                Geometric Patterns
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
            {/* Section 1: Geometry Mode */}
            <div className="p-3.5 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">
                Tessellation Pattern
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'isometric-cubes', label: '3D Cubes' },
                  { id: 'hexagons', label: 'Hexagons' },
                  { id: 'triangles', label: 'Triangles' },
                  { id: 'scales', label: 'Scales' },
                  { id: 'octagons', label: 'Octagons' },
                  { id: 'zigzag', label: 'ZigZag' }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setPatternType(st.id as any)}
                    className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      patternType === st.id
                        ? 'border-[#818cf8] bg-[#818cf8]/15 text-[#818cf8] shadow-xs'
                        : 'border-[#2e303b] bg-[#23242c] text-[#8f94a8] hover:text-[#f2f2f5]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Scale & Stroke */}
            <div className="p-3.5 flex flex-col gap-3.5">
              <button
                type="button"
                onClick={() => toggleSection('geometry')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:text-[#f2f2f5] cursor-pointer"
              >
                <span>Geometry Parameters</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.geometry ? 'rotate-180' : ''}`} />
              </button>

              {openSections.geometry && (
                <div className="flex flex-col gap-3.5 pt-1">
                  {/* Tile Scale */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Tile Scale</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{scale}px</span>
                    </div>
                    <input
                      type="range"
                      min={24}
                      max={120}
                      step={2}
                      value={scale}
                      onChange={(e) => setScale(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#818cf8]"
                    />
                  </div>

                  {/* Stroke Width */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Outline Stroke</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{strokeWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={6}
                      step={0.5}
                      value={strokeWidth}
                      onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#818cf8]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Palette */}
            <div className="p-3.5 flex flex-col gap-3.5">
              <button
                type="button"
                onClick={() => toggleSection('palette')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:text-[#f2f2f5] cursor-pointer"
              >
                <span>Facet Color Palette</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.palette ? 'rotate-180' : ''}`} />
              </button>

              {openSections.palette && (
                <div className="flex flex-col gap-3 pt-1">
                  {[
                    { label: 'Facet A / Primary', val: color1, set: setColor1 },
                    { label: 'Facet B / Shadow', val: color2, set: setColor2 },
                    { label: 'Facet C / Highlight', val: color3, set: setColor3 },
                    { label: 'Background / Canvas', val: bgColor, set: setBgColor }
                  ].map((c) => (
                    <div key={c.label} className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#8f94a8]">{c.label}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={c.val}
                          onChange={(e) => c.set(e.target.value)}
                          className="w-7 h-7 rounded-lg border border-[#2e303b] bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-xs text-[#f2f2f5] uppercase">{c.val}</span>
                      </div>
                    </div>
                  ))}
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
                          ? 'border-[#818cf8] bg-[#818cf8]/15 text-[#818cf8] shadow-xs'
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
            title="Randomize pattern geometry & colors"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#818cf8]" />
            <span>Randomize</span>
          </button>
          <button
            type="button"
            onClick={copySvg}
            className="studio-btn studio-btn-secondary"
            title="Copy SVG Vector Code"
          >
            {copiedSvg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
            <span>{copiedSvg ? 'Copied SVG!' : 'Copy SVG'}</span>
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

        {/* Center SVG Framing */}
        <div className="relative w-full flex-1 max-w-4xl flex items-center justify-center min-h-0 my-2">
          <div
            ref={svgContainerRef}
            className="relative max-w-full max-h-full rounded-2xl border border-[#2e303b] shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 bg-[#16171d] group select-none"
            style={{
              aspectRatio: `${dimensions.width} / ${dimensions.height}`
            }}
          >
            <svg
              className="w-full h-full block"
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
              preserveAspectRatio="xMidYMid slice"
            >
              <defs dangerouslySetInnerHTML={{ __html: getSvgPatternMarkup() }} />
              <rect width="100%" height="100%" fill={bgColor} />
              <rect width="100%" height="100%" fill={`url(#${activePatternId})`} />
            </svg>
          </div>
        </div>

        {/* Bottom Toolbar & Feedback */}
        <div className="w-full shrink-0 flex items-center justify-between text-xs text-[#686c82] px-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8f94a8]">Infinite resolution vector geometric tessellation</span>
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
                Curated ({CURATED_GEOMETRIC_PRESETS.length})
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
              placeholder="Search patterns..."
              value={searchPreset}
              onChange={(e) => setSearchPreset(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] placeholder-[#686c82] outline-none focus:border-[#818cf8]"
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
                      ? 'border-[#818cf8] bg-[#818cf8]/15 ring-2 ring-[#818cf8]/40 shadow-[0_0_12px_rgba(129,140,248,0.25)]'
                      : 'border-[#2e303b] hover:border-[#484b5c] bg-[#1a1b24] hover:bg-[#20222d]'
                  }`}
                >
                  {/* Thumbnail Swatch */}
                  <div
                    className="w-full aspect-[4/3] rounded-lg shadow-inner shrink-0 border border-black/30 group-hover:scale-102 transition-transform overflow-hidden relative flex items-center justify-center p-2"
                    style={{ backgroundColor: preset.bgColor }}
                  >
                    <div className="flex gap-1">
                      <span className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: preset.color1 }} />
                      <span className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: preset.color2 }} />
                      <span className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: preset.color3 }} />
                    </div>
                  </div>

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
                <div className="w-8 h-8 rounded-lg bg-[#818cf8]/15 text-[#818cf8] flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#f2f2f5]">Export Geometric Pattern</h3>
                  <p className="text-xs text-[#8f94a8]">Download Ultra-HD PNG or SVG code</p>
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
                      onClick={() => exportPng(item.scale)}
                      className="py-2.5 px-3 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#818cf8] text-xs font-semibold text-[#f2f2f5] flex flex-col items-center gap-0.5 transition-all cursor-pointer"
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
                  copySvg();
                  setIsExportModalOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#2e303b] bg-[#1a1b24] hover:bg-[#23242c] text-xs font-semibold text-[#f2f2f5] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-[#818cf8]" />
                <span>Copy SVG Vector Code</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
