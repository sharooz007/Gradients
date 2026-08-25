import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Upload,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Plus,
  Trash2,
  Image as ImageIcon,
  Film,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GrainPreset {
  id: string;
  name: string;
  stock: 'portra' | 'ilford' | 'cinestill' | 'fuji' | 'cyber';
  intensity: number;
  grainScale: number;
  isMonochrome: boolean;
  roughness: number;
}

const CURATED_GRAIN_PRESETS: GrainPreset[] = [
  {
    id: 'kodak-portra',
    name: 'Kodak Portra 400',
    stock: 'portra',
    intensity: 38,
    grainScale: 2,
    isMonochrome: true,
    roughness: 0.4
  },
  {
    id: 'ilford-hp5',
    name: 'Ilford HP5 Plus (B&W)',
    stock: 'ilford',
    intensity: 65,
    grainScale: 3,
    isMonochrome: true,
    roughness: 0.7
  },
  {
    id: 'cinestill-800t',
    name: 'CineStill 800T Tungsten',
    stock: 'cinestill',
    intensity: 45,
    grainScale: 2,
    isMonochrome: false,
    roughness: 0.5
  },
  {
    id: 'fuji-superia',
    name: 'Fujifilm Superia 800',
    stock: 'fuji',
    intensity: 52,
    grainScale: 2,
    isMonochrome: false,
    roughness: 0.6
  },
  {
    id: 'cyber-analog',
    name: 'Cyberpunk 35mm Raw',
    stock: 'cyber',
    intensity: 75,
    grainScale: 4,
    isMonochrome: false,
    roughness: 0.85
  }
];

const ASPECT_PRESETS = [
  { id: '16:9', label: '16:9', width: 1920, height: 1080 },
  { id: '1:1', label: '1:1 Square', width: 1400, height: 1400 },
  { id: '9:16', label: '9:16 Story', width: 1080, height: 1920 },
  { id: '4:3', label: '4:3 Standard', width: 1600, height: 1200 },
  { id: 'banner', label: 'Banner', width: 1500, height: 500 }
];

export const FilmGrainStudio: React.FC = () => {
  const [intensity, setIntensity] = useState<number>(CURATED_GRAIN_PRESETS[0].intensity);
  const [grainScale, setGrainScale] = useState<number>(CURATED_GRAIN_PRESETS[0].grainScale);
  const [isMonochrome, setIsMonochrome] = useState<boolean>(CURATED_GRAIN_PRESETS[0].isMonochrome);
  const [roughness, setRoughness] = useState<number>(CURATED_GRAIN_PRESETS[0].roughness);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080, label: '16:9' });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('kodak-portra');
  const [searchPreset, setSearchPreset] = useState('');
  const [presetTab, setPresetTab] = useState<'curated' | 'saved'>('curated');
  const [customPresets, setCustomPresets] = useState<GrainPreset[]>([]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    stocks: true,
    grain: true,
    backdrop: true,
    canvas: false
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('magic_custom_grain_presets');
      if (saved) setCustomPresets(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderGrain = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    const applyGrain = () => {
      try {
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        const amount = (intensity / 100) * 110;

        for (let y = 0; y < h; y += grainScale) {
          for (let x = 0; x < w; x += grainScale) {
            const noiseR = (Math.random() - 0.5) * amount * (1 + roughness * 0.5);
            const noiseG = isMonochrome ? noiseR : (Math.random() - 0.5) * amount;
            const noiseB = isMonochrome ? noiseR : (Math.random() - 0.5) * amount;

            for (let dy = 0; dy < grainScale && y + dy < h; dy++) {
              for (let dx = 0; dx < grainScale && x + dx < w; dx++) {
                const idx = ((y + dy) * w + (x + dx)) * 4;
                d[idx] = Math.min(255, Math.max(0, d[idx] + noiseR));
                d[idx + 1] = Math.min(255, Math.max(0, d[idx + 1] + noiseG));
                d[idx + 2] = Math.min(255, Math.max(0, d[idx + 2] + noiseB));
              }
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } catch {
        // ignore cross-origin error if any
      }
    };

    if (uploadedImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, h);
        applyGrain();
      };
      img.src = uploadedImage;
    } else {
      // Default dramatic cinematic sunset gradient
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.35, '#ec4899');
      grad.addColorStop(0.7, '#6366f1');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      applyGrain();
    }
  };

  useEffect(() => {
    renderGrain();
  }, [intensity, grainScale, isMonochrome, roughness, uploadedImage, dimensions]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const randomize = () => {
    setIntensity(Math.floor(25 + Math.random() * 55));
    setGrainScale(Math.floor(1 + Math.random() * 3));
    setIsMonochrome(Math.random() > 0.4);
    setRoughness(0.2 + Math.random() * 0.7);
  };

  const applyPreset = (preset: GrainPreset) => {
    setSelectedPresetId(preset.id);
    setIntensity(preset.intensity);
    setGrainScale(preset.grainScale);
    setIsMonochrome(preset.isMonochrome);
    setRoughness(preset.roughness);
  };

  const saveCurrentAsPreset = () => {
    const name = prompt('Enter preset name:', `Film Look #${customPresets.length + 1}`);
    if (!name) return;
    const newPreset: GrainPreset = {
      id: `custom-${Date.now()}`,
      name,
      stock: 'portra',
      intensity,
      grainScale,
      isMonochrome,
      roughness
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_grain_presets', JSON.stringify(updated));
    setSelectedPresetId(newPreset.id);
    confetti({ particleCount: 40, spread: 60 });
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_grain_presets', JSON.stringify(updated));
  };

  const exportPngHighRes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `35mm-film-grain-${dimensions.width}x${dimensions.height}-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    confetti({ particleCount: 50, spread: 60 });
    setIsExportModalOpen(false);
  };

  const allPresets = presetTab === 'curated' ? CURATED_GRAIN_PRESETS : customPresets;
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
              <Film className="w-4 h-4 text-[#f59e0b]" />
              <span className="text-xs font-bold text-[#f2f2f5] tracking-wide uppercase">
                35mm Film Grain Studio
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
            {/* Section 1: Film Stock Presets */}
            <div className="p-3.5 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">
                Emulsion Stock
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'portra', label: 'Kodak Portra', int: 38, scale: 2, mono: true },
                  { id: 'ilford', label: 'Ilford B&W', int: 65, scale: 3, mono: true },
                  { id: 'cinestill', label: 'CineStill 800T', int: 45, scale: 2, mono: false },
                  { id: 'fuji', label: 'Fuji Superia', int: 52, scale: 2, mono: false }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setIntensity(st.int);
                      setGrainScale(st.scale);
                      setIsMonochrome(st.mono);
                    }}
                    className="py-2 px-2 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] text-xs font-semibold text-[#8f94a8] hover:text-[#f2f2f5] transition-all cursor-pointer"
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Grain Parameters */}
            <div className="p-3.5 flex flex-col gap-3.5">
              <button
                type="button"
                onClick={() => toggleSection('grain')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:text-[#f2f2f5] cursor-pointer"
              >
                <span>Grain Density & Optics</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.grain ? 'rotate-180' : ''}`} />
              </button>

              {openSections.grain && (
                <div className="flex flex-col gap-3.5 pt-1">
                  {/* Intensity */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Grain Intensity</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{intensity}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      value={intensity}
                      onChange={(e) => setIntensity(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#f59e0b]"
                    />
                  </div>

                  {/* Particle Scale */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Particle Scale</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{grainScale}px</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={grainScale}
                      onChange={(e) => setGrainScale(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#f59e0b]"
                    />
                  </div>

                  {/* Roughness */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Roughness Variance</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{Math.round(roughness * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={roughness}
                      onChange={(e) => setRoughness(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#f59e0b]"
                    />
                  </div>

                  {/* Monochrome Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#23242c] border border-[#2e303b]">
                    <span className="text-xs font-bold text-[#f2f2f5]">Monochrome Grain</span>
                    <button
                      type="button"
                      onClick={() => setIsMonochrome(!isMonochrome)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        isMonochrome ? 'bg-[#f59e0b]' : 'bg-[#16171d]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          isMonochrome ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Backdrop Image Upload */}
            <div className="p-3.5 flex flex-col gap-3.5">
              <button
                type="button"
                onClick={() => toggleSection('backdrop')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:text-[#f2f2f5] cursor-pointer"
              >
                <span>Backdrop Source</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.backdrop ? 'rotate-180' : ''}`} />
              </button>

              {openSections.backdrop && (
                <div className="flex flex-col gap-2.5 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#484b5c] hover:border-[#f59e0b] bg-[#23242c] hover:bg-[#282a36] text-xs font-semibold text-[#8f94a8] hover:text-[#f2f2f5] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadedImage ? 'Change Uploaded Photo' : 'Upload Custom Image'}</span>
                  </button>

                  {uploadedImage && (
                    <button
                      type="button"
                      onClick={() => setUploadedImage(null)}
                      className="text-xs text-red-400 hover:underline text-center cursor-pointer"
                    >
                      Reset to Default Sunset Gradient
                    </button>
                  )}
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
                          ? 'border-[#f59e0b] bg-[#f59e0b]/15 text-[#f59e0b] shadow-xs'
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
            title="Randomize grain noise"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Randomize</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="studio-btn studio-btn-secondary"
            title="Upload Photo"
          >
            <Camera className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Upload Photo</span>
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
            <span className="text-[11px] text-[#8f94a8]">Authentic 35mm analog emulsion noise & grain</span>
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
                <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
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
                Curated ({CURATED_GRAIN_PRESETS.length})
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
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] placeholder-[#686c82] outline-none focus:border-[#f59e0b]"
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
                      ? 'border-[#f59e0b] bg-[#f59e0b]/15 ring-2 ring-[#f59e0b]/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                      : 'border-[#2e303b] hover:border-[#484b5c] bg-[#1a1b24] hover:bg-[#20222d]'
                  }`}
                >
                  {/* Thumbnail Swatch */}
                  <div className="w-full aspect-[4/3] rounded-lg shadow-inner shrink-0 border border-black/30 group-hover:scale-102 transition-transform overflow-hidden relative bg-gradient-to-br from-amber-600 via-rose-600 to-indigo-950 flex items-center justify-center">
                    <span className="text-[10px] font-mono text-white/80 bg-black/50 px-1.5 py-0.5 rounded">
                      {preset.intensity}%
                    </span>
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
                <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/15 text-[#f59e0b] flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#f2f2f5]">Export Film Grain Asset</h3>
                  <p className="text-xs text-[#8f94a8]">Download Ultra-HD PNG</p>
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
                onClick={exportPngHighRes}
                className="w-full py-3 px-4 rounded-xl border border-[#f59e0b] bg-[#f59e0b]/20 hover:bg-[#f59e0b]/30 text-xs font-semibold text-[#f59e0b] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Ultra-HD {dimensions.width}×{dimensions.height} PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
