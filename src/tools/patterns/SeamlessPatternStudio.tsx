import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Check,
  Repeat,
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

interface SeamlessPreset {
  id: string;
  name: string;
  theme: 'memphis' | 'confetti' | 'botanical' | 'cyber' | 'minimal' | 'doodles';
  motifSize: number;
  spacing: number;
  rotationJitter: number;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  bgColor: string;
}

const CURATED_SEAMLESS_PRESETS: SeamlessPreset[] = [
  {
    id: 'memphis-pop',
    name: 'Memphis 90s Pop',
    theme: 'memphis',
    motifSize: 36,
    spacing: 72,
    rotationJitter: 45,
    color1: '#f97316',
    color2: '#3b82f6',
    color3: '#10b981',
    color4: '#ec4899',
    bgColor: '#0f172a'
  },
  {
    id: 'cyber-sparkles',
    name: 'Cyberpunk Sparks',
    theme: 'cyber',
    motifSize: 42,
    spacing: 80,
    rotationJitter: 30,
    color1: '#00f2fe',
    color2: '#ff007f',
    color3: '#ffe600',
    color4: '#a855f7',
    bgColor: '#080812'
  },
  {
    id: 'botanical-flora',
    name: 'Botanical Flora',
    theme: 'botanical',
    motifSize: 38,
    spacing: 68,
    rotationJitter: 60,
    color1: '#10b981',
    color2: '#34d399',
    color3: '#059669',
    color4: '#6ee7b7',
    bgColor: '#031c15'
  },
  {
    id: 'midnight-confetti',
    name: 'Midnight Confetti',
    theme: 'confetti',
    motifSize: 28,
    spacing: 56,
    rotationJitter: 75,
    color1: '#fbbf24',
    color2: '#f43f5e',
    color3: '#8b5cf6',
    color4: '#06b6d4',
    bgColor: '#18181b'
  },
  {
    id: 'minimal-geometry',
    name: 'Minimal Modernist',
    theme: 'minimal',
    motifSize: 32,
    spacing: 64,
    rotationJitter: 0,
    color1: '#818cf8',
    color2: '#c084fc',
    color3: '#f472b6',
    color4: '#38bdf8',
    bgColor: '#0f1016'
  }
];

const ASPECT_PRESETS = [
  { id: '16:9', label: '16:9', width: 1920, height: 1080 },
  { id: '1:1', label: '1:1 Square', width: 1400, height: 1400 },
  { id: '9:16', label: '9:16 Story', width: 1080, height: 1920 },
  { id: '4:3', label: '4:3 Standard', width: 1600, height: 1200 },
  { id: 'banner', label: 'Banner', width: 1500, height: 500 }
];

export const SeamlessPatternStudio: React.FC = () => {
  const [theme, setTheme] = useState<'memphis' | 'confetti' | 'botanical' | 'cyber' | 'minimal' | 'doodles'>(
    CURATED_SEAMLESS_PRESETS[0].theme
  );
  const [motifSize, setMotifSize] = useState<number>(CURATED_SEAMLESS_PRESETS[0].motifSize);
  const [spacing, setSpacing] = useState<number>(CURATED_SEAMLESS_PRESETS[0].spacing);
  const [rotationJitter, setRotationJitter] = useState<number>(CURATED_SEAMLESS_PRESETS[0].rotationJitter);
  const [color1, setColor1] = useState<string>(CURATED_SEAMLESS_PRESETS[0].color1);
  const [color2, setColor2] = useState<string>(CURATED_SEAMLESS_PRESETS[0].color2);
  const [color3, setColor3] = useState<string>(CURATED_SEAMLESS_PRESETS[0].color3);
  const [color4, setColor4] = useState<string>(CURATED_SEAMLESS_PRESETS[0].color4);
  const [bgColor, setBgColor] = useState<string>(CURATED_SEAMLESS_PRESETS[0].bgColor);

  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080, label: '16:9' });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('memphis-pop');
  const [searchPreset, setSearchPreset] = useState('');
  const [presetTab, setPresetTab] = useState<'curated' | 'saved'>('curated');
  const [customPresets, setCustomPresets] = useState<SeamlessPreset[]>([]);
  const [copiedSvg, setCopiedSvg] = useState(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    theme: true,
    geometry: true,
    palette: true,
    canvas: false
  });

  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('magic_custom_seamless_presets');
      if (saved) setCustomPresets(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getSvgPattern = () => {
    const s = spacing;
    const m = motifSize;

    if (theme === 'memphis') {
      return `
        <pattern id="seamless-tile" width="${s}" height="${s}" patternUnits="userSpaceOnUse">
          <circle cx="${s * 0.25}" cy="${s * 0.25}" r="${m * 0.2}" fill="${color1}" />
          <rect x="${s * 0.6}" y="${s * 0.15}" width="${m * 0.4}" height="${m * 0.4}" rx="${m * 0.08}" fill="${color2}" transform="rotate(${rotationJitter} ${s * 0.6 + m * 0.2} ${s * 0.15 + m * 0.2})" />
          <polygon points="${s * 0.5},${s * 0.6} ${s * 0.68},${s * 0.9} ${s * 0.32},${s * 0.9}" fill="${color3}" />
          <path d="M${s * 0.8} ${s * 0.65} Q${s * 0.95} ${s * 0.55} ${s} ${s * 0.7}" stroke="${color4}" stroke-width="3" fill="none" stroke-linecap="round" />
          <path d="M0 ${s * 0.65} Q${s * 0.15} ${s * 0.55} ${s * 0.2} ${s * 0.7}" stroke="${color4}" stroke-width="3" fill="none" stroke-linecap="round" />
        </pattern>`;
    } else if (theme === 'cyber') {
      return `
        <pattern id="seamless-tile" width="${s}" height="${s}" patternUnits="userSpaceOnUse">
          <polygon points="${s * 0.3},${s * 0.15} ${s * 0.35},${s * 0.3} ${s * 0.2},${s * 0.35} ${s * 0.35},${s * 0.4} ${s * 0.3},${s * 0.55} ${s * 0.45},${s * 0.4} ${s * 0.6},${s * 0.55} ${s * 0.55},${s * 0.4} ${s * 0.7},${s * 0.35} ${s * 0.55},${s * 0.3}" fill="${color1}" />
          <circle cx="${s * 0.8}" cy="${s * 0.3}" r="${m * 0.15}" fill="${color2}" />
          <rect x="${s * 0.15}" y="${s * 0.7}" width="${m * 0.3}" height="${m * 0.3}" fill="${color3}" transform="rotate(${rotationJitter} ${s * 0.15 + m * 0.15} ${s * 0.7 + m * 0.15})" />
          <path d="M${s * 0.6} ${s * 0.8} L${s * 0.9} ${s * 0.8}" stroke="${color4}" stroke-width="2.5" stroke-linecap="round" />
        </pattern>`;
    } else if (theme === 'botanical') {
      return `
        <pattern id="seamless-tile" width="${s}" height="${s}" patternUnits="userSpaceOnUse">
          <path d="M${s * 0.3} ${s * 0.2} Q${s * 0.5} ${s * 0.1} ${s * 0.5} ${s * 0.4} Q${s * 0.3} ${s * 0.5} ${s * 0.3} ${s * 0.2} Z" fill="${color1}" />
          <path d="M${s * 0.7} ${s * 0.6} Q${s * 0.9} ${s * 0.5} ${s * 0.9} ${s * 0.8} Q${s * 0.7} ${s * 0.9} ${s * 0.7} ${s * 0.6} Z" fill="${color2}" />
          <circle cx="${s * 0.8}" cy="${s * 0.25}" r="${m * 0.18}" fill="${color3}" />
          <circle cx="${s * 0.2}" cy="${s * 0.75}" r="${m * 0.14}" fill="${color4}" />
        </pattern>`;
    } else if (theme === 'confetti') {
      return `
        <pattern id="seamless-tile" width="${s}" height="${s}" patternUnits="userSpaceOnUse">
          <rect x="${s * 0.2}" y="${s * 0.2}" width="${m * 0.4}" height="${m * 0.15}" rx="2" fill="${color1}" transform="rotate(${rotationJitter} ${s * 0.2} ${s * 0.2})" />
          <circle cx="${s * 0.75}" cy="${s * 0.3}" r="${m * 0.15}" fill="${color2}" />
          <rect x="${s * 0.4}" y="${s * 0.7}" width="${m * 0.35}" height="${m * 0.12}" rx="2" fill="${color3}" transform="rotate(-${rotationJitter} ${s * 0.4} ${s * 0.7})" />
          <polygon points="${s * 0.85},${s * 0.75} ${s * 0.95},${s * 0.9} ${s * 0.75},${s * 0.9}" fill="${color4}" />
        </pattern>`;
    } else {
      return `
        <pattern id="seamless-tile" width="${s}" height="${s}" patternUnits="userSpaceOnUse">
          <circle cx="${s * 0.3}" cy="${s * 0.3}" r="${m * 0.25}" fill="none" stroke="${color1}" stroke-width="2.5" />
          <rect x="${s * 0.65}" y="${s * 0.2}" width="${m * 0.35}" height="${m * 0.35}" fill="${color2}" />
          <path d="M${s * 0.2} ${s * 0.8} L${s * 0.45} ${s * 0.8}" stroke="${color3}" stroke-width="3" stroke-linecap="round" />
          <polygon points="${s * 0.7},${s * 0.65} ${s * 0.85},${s * 0.9} ${s * 0.55},${s * 0.9}" fill="${color4}" />
        </pattern>`;
    }
  };

  const randomize = () => {
    const themes: ('memphis' | 'confetti' | 'botanical' | 'cyber' | 'minimal' | 'doodles')[] = [
      'memphis',
      'confetti',
      'botanical',
      'cyber',
      'minimal',
      'doodles'
    ];
    setTheme(themes[Math.floor(Math.random() * themes.length)]);
    setSpacing(Math.floor(48 + Math.random() * 48));
    setMotifSize(Math.floor(24 + Math.random() * 24));
    setRotationJitter(Math.floor(Math.random() * 90));

    const palettes = [
      ['#f97316', '#3b82f6', '#10b981', '#ec4899', '#0f172a'],
      ['#00f2fe', '#ff007f', '#ffe600', '#a855f7', '#080812'],
      ['#10b981', '#34d399', '#059669', '#6ee7b7', '#031c15'],
      ['#fbbf24', '#f43f5e', '#8b5cf6', '#06b6d4', '#18181b'],
      ['#818cf8', '#c084fc', '#f472b6', '#38bdf8', '#0f1016']
    ];
    const p = palettes[Math.floor(Math.random() * palettes.length)];
    setColor1(p[0]);
    setColor2(p[1]);
    setColor3(p[2]);
    setColor4(p[3]);
    setBgColor(p[4]);
  };

  const applyPreset = (preset: SeamlessPreset) => {
    setSelectedPresetId(preset.id);
    setTheme(preset.theme);
    setMotifSize(preset.motifSize);
    setSpacing(preset.spacing);
    setRotationJitter(preset.rotationJitter);
    setColor1(preset.color1);
    setColor2(preset.color2);
    setColor3(preset.color3);
    setColor4(preset.color4);
    setBgColor(preset.bgColor);
  };

  const saveCurrentAsPreset = () => {
    const name = prompt('Enter preset name:', `Seamless Look #${customPresets.length + 1}`);
    if (!name) return;
    const newPreset: SeamlessPreset = {
      id: `custom-${Date.now()}`,
      name,
      theme,
      motifSize,
      spacing,
      rotationJitter,
      color1,
      color2,
      color3,
      color4,
      bgColor
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_seamless_presets', JSON.stringify(updated));
    setSelectedPresetId(newPreset.id);
    confetti({ particleCount: 40, spread: 60 });
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_seamless_presets', JSON.stringify(updated));
  };

  const copySvg = () => {
    const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${dimensions.width} ${dimensions.height}">
  <defs>${getSvgPattern()}</defs>
  <rect width="100%" height="100%" fill="${bgColor}" />
  <rect width="100%" height="100%" fill="url(#seamless-tile)" />
</svg>`;
    navigator.clipboard.writeText(svgCode);
    setCopiedSvg(true);
    confetti({ particleCount: 30, spread: 45 });
    setTimeout(() => setCopiedSvg(false), 2500);
  };

  const exportPng = (resScale: number = 2) => {
    const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.width * resScale}" height="${dimensions.height * resScale}" viewBox="0 0 ${dimensions.width} ${dimensions.height}">
  <defs>${getSvgPattern()}</defs>
  <rect width="100%" height="100%" fill="${bgColor}" />
  <rect width="100%" height="100%" fill="url(#seamless-tile)" />
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
        a.download = `seamless-pattern-${dimensions.width * resScale}x${dimensions.height * resScale}-${Date.now()}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
        confetti({ particleCount: 50, spread: 60 });
        setIsExportModalOpen(false);
      }
    };
    image.src = blobURL;
  };

  const allPresets = presetTab === 'curated' ? CURATED_SEAMLESS_PRESETS : customPresets;
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
              <Repeat className="w-4 h-4 text-[#ec4899]" />
              <span className="text-xs font-bold text-[#f2f2f5] tracking-wide uppercase">
                Seamless Patterns
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
            {/* Section 1: Theme Mode */}
            <div className="p-3.5 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">
                Motif Category
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'memphis', label: 'Memphis 90s' },
                  { id: 'cyber', label: 'Cyber Sparks' },
                  { id: 'botanical', label: 'Botanical' },
                  { id: 'confetti', label: 'Confetti' },
                  { id: 'minimal', label: 'Minimalist' }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setTheme(st.id as any)}
                    className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      theme === st.id
                        ? 'border-[#ec4899] bg-[#ec4899]/15 text-[#ec4899] shadow-xs'
                        : 'border-[#2e303b] bg-[#23242c] text-[#8f94a8] hover:text-[#f2f2f5]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Scale & Spacing */}
            <div className="p-3.5 flex flex-col gap-3.5">
              <button
                type="button"
                onClick={() => toggleSection('geometry')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:text-[#f2f2f5] cursor-pointer"
              >
                <span>Grid & Motif Scale</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.geometry ? 'rotate-180' : ''}`} />
              </button>

              {openSections.geometry && (
                <div className="flex flex-col gap-3.5 pt-1">
                  {/* Grid Pitch */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Grid Pitch</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{spacing}px</span>
                    </div>
                    <input
                      type="range"
                      min={36}
                      max={140}
                      step={2}
                      value={spacing}
                      onChange={(e) => setSpacing(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#ec4899]"
                    />
                  </div>

                  {/* Motif Size */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Motif Scale</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{motifSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={16}
                      max={72}
                      step={2}
                      value={motifSize}
                      onChange={(e) => setMotifSize(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#ec4899]"
                    />
                  </div>

                  {/* Rotation Jitter */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Rotation Angle</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{rotationJitter}°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={180}
                      step={5}
                      value={rotationJitter}
                      onChange={(e) => setRotationJitter(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#ec4899]"
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
                <span>Motif Color Palette</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.palette ? 'rotate-180' : ''}`} />
              </button>

              {openSections.palette && (
                <div className="flex flex-col gap-3 pt-1">
                  {[
                    { label: 'Motif Accent 1', val: color1, set: setColor1 },
                    { label: 'Motif Accent 2', val: color2, set: setColor2 },
                    { label: 'Motif Accent 3', val: color3, set: setColor3 },
                    { label: 'Motif Accent 4', val: color4, set: setColor4 },
                    { label: 'Paper Canvas', val: bgColor, set: setBgColor }
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
                          ? 'border-[#ec4899] bg-[#ec4899]/15 text-[#ec4899] shadow-xs'
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
            title="Randomize motifs & colors"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#ec4899]" />
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
              <defs dangerouslySetInnerHTML={{ __html: getSvgPattern() }} />
              <rect width="100%" height="100%" fill={bgColor} />
              <rect width="100%" height="100%" fill="url(#seamless-tile)" />
            </svg>
          </div>
        </div>

        {/* Bottom Toolbar & Feedback */}
        <div className="w-full shrink-0 flex items-center justify-between text-xs text-[#686c82] px-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8f94a8]">Seamless vector repeat pattern tiles</span>
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
                <Sparkles className="w-3.5 h-3.5 text-[#ec4899]" />
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
                Curated ({CURATED_SEAMLESS_PRESETS.length})
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
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] placeholder-[#686c82] outline-none focus:border-[#ec4899]"
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
                      ? 'border-[#ec4899] bg-[#ec4899]/15 ring-2 ring-[#ec4899]/40 shadow-[0_0_12px_rgba(236,72,153,0.25)]'
                      : 'border-[#2e303b] hover:border-[#484b5c] bg-[#1a1b24] hover:bg-[#20222d]'
                  }`}
                >
                  {/* Thumbnail Swatch */}
                  <div
                    className="w-full aspect-[4/3] rounded-lg shadow-inner shrink-0 border border-black/30 group-hover:scale-102 transition-transform overflow-hidden relative flex items-center justify-center p-2"
                    style={{ backgroundColor: preset.bgColor }}
                  >
                    <div className="flex gap-1">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.color1 }} />
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.color2 }} />
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.color3 }} />
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
                <div className="w-8 h-8 rounded-lg bg-[#ec4899]/15 text-[#ec4899] flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#f2f2f5]">Export Seamless Pattern</h3>
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
                      className="py-2.5 px-3 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#ec4899] text-xs font-semibold text-[#f2f2f5] flex flex-col items-center gap-0.5 transition-all cursor-pointer"
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
                <FileCode className="w-4 h-4 text-[#ec4899]" />
                <span>Copy SVG Vector Code</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
