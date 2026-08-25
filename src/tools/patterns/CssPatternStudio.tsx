import React, { useState } from 'react';
import {
  Download,
  Check,
  Code,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  FileCode,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';


interface CssPatternDef {
  id: string;
  name: string;
  category: 'stripes' | 'dots' | 'grid' | 'geometric' | 'waves';
  getCss: (c1: string, c2: string, size: number) => string;
}

const CSS_PATTERNS_CATALOG: CssPatternDef[] = [
  {
    id: 'stripes-diagonal',
    name: 'Diagonal Stripes 45°',
    category: 'stripes',
    getCss: (c1, c2, size) =>
      `background: repeating-linear-gradient(45deg, ${c1}, ${c1} ${size}px, ${c2} ${size}px, ${c2} ${size * 2}px);`
  },
  {
    id: 'polka-dots-matrix',
    name: 'Polka Dots Matrix',
    category: 'dots',
    getCss: (c1, c2, size) =>
      `background-color: ${c2};\nbackground-image: radial-gradient(${c1} 2.5px, transparent 2.5px);\nbackground-size: ${size}px ${size}px;`
  },
  {
    id: 'grid-blueprint',
    name: 'Architectural Blueprint',
    category: 'grid',
    getCss: (c1, c2, size) =>
      `background-color: ${c2};\nbackground-image: linear-gradient(${c1} 1px, transparent 1px), linear-gradient(90deg, ${c1} 1px, transparent 1px);\nbackground-size: ${size}px ${size}px;`
  },
  {
    id: 'carbon-fiber',
    name: 'Dark Carbon Fiber',
    category: 'geometric',
    getCss: (c1, c2, size) =>
      `background: linear-gradient(27deg, ${c2} 5px, transparent 5px) 0 5px, linear-gradient(207deg, ${c2} 5px, transparent 5px) 10px 0px, linear-gradient(27deg, ${c1} 5px, transparent 5px) 0px 10px, linear-gradient(207deg, ${c1} 5px, transparent 5px) 10px 5px, linear-gradient(90deg, ${c2} 10px, transparent 10px), linear-gradient(${c1} 25%, ${c2} 25%, ${c2} 50%, transparent 50%, transparent 75%, ${c2} 75%, ${c2} 100%);\nbackground-size: ${size}px ${size}px;`
  },
  {
    id: 'checkerboard',
    name: 'Retro Checkerboard',
    category: 'geometric',
    getCss: (c1, c2, size) =>
      `background-color: ${c2};\nbackground-image: linear-gradient(45deg, ${c1} 25%, transparent 25%), linear-gradient(-45deg, ${c1} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${c1} 75%), linear-gradient(-45deg, transparent 75%, ${c1} 75%);\nbackground-size: ${size}px ${size}px;\nbackground-position: 0 0, 0 ${size / 2}px, ${size / 2}px -${size / 2}px, -${size / 2}px 0px;`
  },
  {
    id: 'zigzag-chevron',
    name: 'Zig-Zag Chevron',
    category: 'waves',
    getCss: (c1, c2, size) =>
      `background-color: ${c2};\nbackground-image: linear-gradient(135deg, ${c1} 25%, transparent 25%), linear-gradient(225deg, ${c1} 25%, transparent 25%), linear-gradient(315deg, ${c1} 25%, transparent 25%), linear-gradient(45deg, ${c1} 25%, transparent 25%);\nbackground-position: -${size / 2}px 0, -${size / 2}px 0, 0 0, 0 0;\nbackground-size: ${size}px ${size}px;`
  },
  {
    id: 'crosshatch-weave',
    name: 'Crosshatch Weave',
    category: 'geometric',
    getCss: (c1, c2, size) =>
      `background: repeating-linear-gradient(45deg, ${c1} 0, ${c1} 1px, transparent 0, transparent 50%), repeating-linear-gradient(-45deg, ${c1} 0, ${c1} 1px, ${c2} 0, ${c2} 50%);\nbackground-size: ${size}px ${size}px;`
  },
  {
    id: 'vertical-pinstripes',
    name: 'Minimal Pinstripes',
    category: 'stripes',
    getCss: (c1, c2, size) =>
      `background: repeating-linear-gradient(90deg, ${c1}, ${c1} 2px, ${c2} 2px, ${c2} ${size}px);`
  }
];

const ASPECT_PRESETS = [
  { id: '16:9', label: '16:9', width: 1920, height: 1080 },
  { id: '1:1', label: '1:1 Square', width: 1400, height: 1400 },
  { id: '9:16', label: '9:16 Story', width: 1080, height: 1920 },
  { id: '4:3', label: '4:3 Standard', width: 1600, height: 1200 },
  { id: 'banner', label: 'Banner', width: 1500, height: 500 }
];

export const CssPatternStudio: React.FC = () => {
  const [selectedPatternId, setSelectedPatternId] = useState<string>(CSS_PATTERNS_CATALOG[0].id);
  const [size, setSize] = useState<number>(32);
  const [color1, setColor1] = useState<string>('#6268f8');
  const [color2, setColor2] = useState<string>('#0e0f14');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080, label: '16:9' });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [searchPreset, setSearchPreset] = useState('');
  const [copiedCss, setCopiedCss] = useState(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    catalog: true,
    scale: true,
    colors: true,
    code: true
  });

  const activePattern =
    CSS_PATTERNS_CATALOG.find((p) => p.id === selectedPatternId) || CSS_PATTERNS_CATALOG[0];

  const generatedCss = activePattern.getCss(color1, color2, size);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyCss = () => {
    const snippet = `/* ${activePattern.name} */\n.bg-pattern {\n  ${generatedCss.replace(/\n/g, '\n  ')}\n}`;
    navigator.clipboard.writeText(snippet);
    setCopiedCss(true);
    confetti({ particleCount: 30, spread: 45 });
    setTimeout(() => setCopiedCss(false), 2500);
  };

  const randomize = () => {
    const p = CSS_PATTERNS_CATALOG[Math.floor(Math.random() * CSS_PATTERNS_CATALOG.length)];
    setSelectedPatternId(p.id);
    setSize(Math.floor(16 + Math.random() * 48));

    const palettes = [
      ['#6268f8', '#0e0f14'],
      ['#00f2fe', '#050b14'],
      ['#f43f5e', '#1c1015'],
      ['#10b981', '#022c22'],
      ['#fbbf24', '#1f1501'],
      ['#c084fc', '#180a29']
    ];
    const pal = palettes[Math.floor(Math.random() * palettes.length)];
    setColor1(pal[0]);
    setColor2(pal[1]);
  };

  const filteredCatalog = CSS_PATTERNS_CATALOG.filter((p) => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchPreset.toLowerCase());
    return matchesCat && matchesSearch;
  });

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
              <Code className="w-4 h-4 text-[#818cf8]" />
              <span className="text-xs font-bold text-[#f2f2f5] tracking-wide uppercase">
                CSS Pattern Studio
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
            {/* Section 1: Categories & Patterns */}
            <div className="p-3.5 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">
                Categories
              </span>
              <div className="flex flex-wrap gap-1">
                {['all', 'stripes', 'dots', 'grid', 'geometric', 'waves'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`py-1 px-2.5 rounded-lg border text-xs font-semibold capitalize transition-all cursor-pointer ${
                      categoryFilter === cat
                        ? 'border-[#818cf8] bg-[#818cf8]/15 text-[#818cf8] shadow-xs'
                        : 'border-[#2e303b] bg-[#23242c] text-[#8f94a8] hover:text-[#f2f2f5]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Scale & Parameters */}
            <div className="p-3.5 flex flex-col gap-3.5">
              <button
                type="button"
                onClick={() => toggleSection('scale')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:text-[#f2f2f5] cursor-pointer"
              >
                <span>Pattern Dimensions</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.scale ? 'rotate-180' : ''}`} />
              </button>

              {openSections.scale && (
                <div className="flex flex-col gap-3.5 pt-1">
                  {/* Pattern Scale */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Tile Scale</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{size}px</span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={96}
                      step={2}
                      value={size}
                      onChange={(e) => setSize(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#818cf8]"
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
                <span>Pattern Colors</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.colors ? 'rotate-180' : ''}`} />
              </button>

              {openSections.colors && (
                <div className="flex flex-col gap-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#8f94a8]">Foreground Color</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color1}
                        onChange={(e) => setColor1(e.target.value)}
                        className="w-7 h-7 rounded-lg border border-[#2e303b] bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-xs text-[#f2f2f5] uppercase">{color1}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#8f94a8]">Background Color</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color2}
                        onChange={(e) => setColor2(e.target.value)}
                        className="w-7 h-7 rounded-lg border border-[#2e303b] bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-xs text-[#f2f2f5] uppercase">{color2}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Live CSS Snippet */}
            <div className="p-3.5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => toggleSection('code')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:text-[#f2f2f5] cursor-pointer"
              >
                <span>Live CSS Snippet</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.code ? 'rotate-180' : ''}`} />
              </button>

              {openSections.code && (
                <div className="relative rounded-xl bg-[#0e0f14] border border-[#2e303b] p-3 text-[11px] font-mono text-[#8f94a8] overflow-x-auto custom-scrollbar">
                  <pre className="whitespace-pre-wrap">{generatedCss}</pre>
                </div>
              )}
            </div>

            {/* Section 5: Canvas Dimensions */}
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
            title="Randomize style & colors"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#818cf8]" />
            <span>Randomize</span>
          </button>
          <button
            type="button"
            onClick={copyCss}
            className="studio-btn studio-btn-secondary"
            title="Copy CSS Background Snippet"
          >
            {copiedCss ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
            <span>{copiedCss ? 'Copied CSS!' : 'Copy CSS'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="studio-btn studio-btn-primary"
            title="Export CSS snippet"
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
            <div
              className="w-full h-full"
              style={Object.fromEntries(
                generatedCss
                  .split(';')
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line) => {
                    const [prop, ...rest] = line.split(':');
                    return [
                      prop.trim().replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
                      rest.join(':').trim()
                    ];
                  })
              )}
            />
          </div>
        </div>

        {/* Bottom Toolbar & Feedback */}
        <div className="w-full shrink-0 flex items-center justify-between text-xs text-[#686c82] px-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8f94a8]">{activePattern.name}</span>
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
            title="Expand pattern library"
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
                <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">Pattern Library</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRightCollapsed(true)}
                title="Collapse presets"
                className="p-1 rounded-lg hover:bg-[#23242c] text-[#686c82] hover:text-[#f2f2f5] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search library..."
              value={searchPreset}
              onChange={(e) => setSearchPreset(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] placeholder-[#686c82] outline-none focus:border-[#818cf8]"
            />
          </div>

          {/* Patterns Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 grid grid-cols-2 auto-rows-max gap-2.5 custom-scrollbar overscroll-contain pb-10">
            {filteredCatalog.map((pattern) => {
              const isSelected = selectedPatternId === pattern.id;

              return (
                <div
                  key={pattern.id}
                  onClick={() => setSelectedPatternId(pattern.id)}
                  className={`group relative p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'border-[#818cf8] bg-[#818cf8]/15 ring-2 ring-[#818cf8]/40 shadow-[0_0_12px_rgba(129,140,248,0.25)]'
                      : 'border-[#2e303b] hover:border-[#484b5c] bg-[#1a1b24] hover:bg-[#20222d]'
                  }`}
                >
                  {/* Thumbnail Swatch */}
                  <div
                    className="w-full aspect-[4/3] rounded-lg shadow-inner shrink-0 border border-black/30 group-hover:scale-102 transition-transform overflow-hidden relative"
                    style={Object.fromEntries(
                      pattern
                        .getCss('#818cf8', '#16171d', 16)
                        .split(';')
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line) => {
                          const [prop, ...rest] = line.split(':');
                          return [
                            prop.trim().replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
                            rest.join(':').trim()
                          ];
                        })
                    )}
                  />

                  {/* Info */}
                  <div className="w-full flex flex-col items-center px-0.5 pb-0.5">
                    <span className="text-[10px] font-semibold text-[#8f94a8] group-hover:text-[#f2f2f5] truncate leading-tight text-center w-full">
                      {pattern.name}
                    </span>
                  </div>
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
                  <h3 className="text-sm font-semibold text-[#f2f2f5]">Export CSS Background</h3>
                  <p className="text-xs text-[#8f94a8]">Copy pure CSS snippet</p>
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
              <button
                type="button"
                onClick={() => {
                  copyCss();
                  setIsExportModalOpen(false);
                }}
                className="w-full py-3 px-4 rounded-xl border border-[#818cf8] bg-[#818cf8]/20 hover:bg-[#818cf8]/30 text-xs font-semibold text-[#818cf8] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileCode className="w-4 h-4" />
                <span>Copy 1-Click CSS Background Snippet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
