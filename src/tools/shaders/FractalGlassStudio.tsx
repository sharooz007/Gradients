import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download,
  Upload,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Plus,
  Trash2,
  FileCode,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GlassPreset {
  id: string;
  name: string;
  styleMode: 'fluted' | 'horizontal' | 'frosted' | 'prism' | 'fractal';
  ribCount: number;
  refraction: number;
  frostedNoise: number;
  specular: number;
  chromatic: number;
  backdropTheme: string;
}

const CURATED_GLASS_PRESETS: GlassPreset[] = [
  {
    id: 'bauhaus-fluted',
    name: 'Bauhaus Fluted Ribs',
    styleMode: 'fluted',
    ribCount: 32,
    refraction: 1.0,
    frostedNoise: 0.1,
    specular: 0.7,
    chromatic: 0.15,
    backdropTheme: 'sunset'
  },
  {
    id: 'architectural-reeded',
    name: 'Architectural Reeded Glass',
    styleMode: 'fluted',
    ribCount: 48,
    refraction: 0.7,
    frostedNoise: 0.05,
    specular: 0.85,
    chromatic: 0.08,
    backdropTheme: 'aurora'
  },
  {
    id: 'acid-prism',
    name: 'Acid Prism Refraction',
    styleMode: 'prism',
    ribCount: 24,
    refraction: 1.6,
    frostedNoise: 0.2,
    specular: 0.6,
    chromatic: 0.35,
    backdropTheme: 'cyber'
  },
  {
    id: 'cyber-frosted',
    name: 'Cyber Frosted Blur',
    styleMode: 'frosted',
    ribCount: 20,
    refraction: 0.5,
    frostedNoise: 0.65,
    specular: 0.3,
    chromatic: 0.1,
    backdropTheme: 'cyber'
  },
  {
    id: 'vintage-cathedral',
    name: 'Vintage Cathedral Rib',
    styleMode: 'horizontal',
    ribCount: 28,
    refraction: 1.2,
    frostedNoise: 0.15,
    specular: 0.75,
    chromatic: 0.2,
    backdropTheme: 'sunset'
  },
  {
    id: 'fractal-ripple',
    name: 'Fractal Water Ripple',
    styleMode: 'fractal',
    ribCount: 30,
    refraction: 1.4,
    frostedNoise: 0.25,
    specular: 0.5,
    chromatic: 0.25,
    backdropTheme: 'aurora'
  }
];

const ASPECT_PRESETS = [
  { id: '16:9', label: '16:9', width: 1920, height: 1080 },
  { id: '1:1', label: '1:1 Square', width: 1400, height: 1400 },
  { id: '9:16', label: '9:16 Story', width: 1080, height: 1920 },
  { id: '4:3', label: '4:3 Standard', width: 1600, height: 1200 },
  { id: 'banner', label: 'Banner', width: 1500, height: 500 }
];

export const FractalGlassStudio: React.FC = () => {
  const [styleMode, setStyleMode] = useState<'fluted' | 'horizontal' | 'frosted' | 'prism' | 'fractal'>(
    CURATED_GLASS_PRESETS[0].styleMode
  );
  const [ribCount, setRibCount] = useState<number>(CURATED_GLASS_PRESETS[0].ribCount);
  const [refraction, setRefraction] = useState<number>(CURATED_GLASS_PRESETS[0].refraction);
  const [frostedNoise, setFrostedNoise] = useState<number>(CURATED_GLASS_PRESETS[0].frostedNoise);
  const [specular, setSpecular] = useState<number>(CURATED_GLASS_PRESETS[0].specular);
  const [chromatic, setChromatic] = useState<number>(CURATED_GLASS_PRESETS[0].chromatic);
  const [backdropTheme, setBackdropTheme] = useState<string>(CURATED_GLASS_PRESETS[0].backdropTheme);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080, label: '16:9' });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('bauhaus-fluted');
  const [searchPreset, setSearchPreset] = useState('');
  const [presetTab, setPresetTab] = useState<'curated' | 'saved'>('curated');
  const [customPresets, setCustomPresets] = useState<GlassPreset[]>([]);
  const [copiedCss, setCopiedCss] = useState(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    style: true,
    glass: true,
    backdrop: true,
    canvas: false
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('magic_custom_fractal_presets');
      if (saved) setCustomPresets(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    const executeGlassPipeline = () => {
      const imgData = ctx.getImageData(0, 0, w, h);
      const srcData = new Uint8ClampedArray(imgData.data);
      const d = imgData.data;

      const ribWidth = w / Math.max(4, ribCount);
      const ribHeight = h / Math.max(4, ribCount);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;

          let dx = 0;
          let dy = 0;
          let specHighlight = 0;

          if (styleMode === 'fluted') {
            const localX = (x % ribWidth) / ribWidth;
            const normalX = (localX - 0.5) * 2;
            dx = normalX * Math.sqrt(Math.max(0, 1 - normalX * normalX)) * 26 * refraction;
            if (specular > 0) {
              const edgeDist = Math.abs(normalX);
              if (edgeDist > 0.75) specHighlight = (edgeDist - 0.75) * 4 * specular * 180;
            }
          } else if (styleMode === 'horizontal') {
            const localY = (y % ribHeight) / ribHeight;
            const normalY = (localY - 0.5) * 2;
            dy = normalY * Math.sqrt(Math.max(0, 1 - normalY * normalY)) * 26 * refraction;
            if (specular > 0) {
              const edgeDist = Math.abs(normalY);
              if (edgeDist > 0.75) specHighlight = (edgeDist - 0.75) * 4 * specular * 180;
            }
          } else if (styleMode === 'frosted') {
            dx = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1) * 28 * frostedNoise;
            dy = (Math.cos(x * 39.346 + y * 11.135) * 43758.5453 % 1) * 28 * frostedNoise;
          } else if (styleMode === 'prism') {
            const px = (x % ribWidth) / ribWidth - 0.5;
            const py = (y % ribHeight) / ribHeight - 0.5;
            dx = (px > 0 ? 1 : -1) * 18 * refraction;
            dy = (py > 0 ? 1 : -1) * 18 * refraction;
          } else {
            dx = Math.sin(x * 0.02 + y * 0.015) * 20 * refraction;
            dy = Math.cos(x * 0.015 - y * 0.02) * 20 * refraction;
          }

          const chrSplit = 1 + chromatic * 1.5;
          const rSampleX = Math.min(w - 1, Math.max(0, Math.round(x + dx * chrSplit)));
          const rSampleY = Math.min(h - 1, Math.max(0, Math.round(y + dy * chrSplit)));
          const rIdx = (rSampleY * w + rSampleX) * 4;

          const gSampleX = Math.min(w - 1, Math.max(0, Math.round(x + dx)));
          const gSampleY = Math.min(h - 1, Math.max(0, Math.round(y + dy)));
          const gIdx = (gSampleY * w + gSampleX) * 4;

          const bSampleX = Math.min(w - 1, Math.max(0, Math.round(x + dx * (2 - chrSplit))));
          const bSampleY = Math.min(h - 1, Math.max(0, Math.round(y + dy * (2 - chrSplit))));
          const bIdx = (bSampleY * w + bSampleX) * 4;

          d[idx] = Math.min(255, srcData[rIdx] + specHighlight);
          d[idx + 1] = Math.min(255, srcData[gIdx + 1] + specHighlight);
          d[idx + 2] = Math.min(255, srcData[bIdx + 2] + specHighlight);
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };

    if (uploadedImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, h);
        executeGlassPipeline();
      };
      img.src = uploadedImage;
    } else {
      // Draw background gradient & shapes
      ctx.clearRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, w, h);
      if (backdropTheme === 'sunset') {
        grad.addColorStop(0, '#ff4b72');
        grad.addColorStop(0.5, '#7928ca');
        grad.addColorStop(1, '#ff8f3d');
      } else if (backdropTheme === 'aurora') {
        grad.addColorStop(0, '#06b6d4');
        grad.addColorStop(0.5, '#10b981');
        grad.addColorStop(1, '#8b5cf6');
      } else {
        grad.addColorStop(0, '#00f2fe');
        grad.addColorStop(0.5, '#4facfe');
        grad.addColorStop(1, '#ff007f');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(w * 0.35, h * 0.4, Math.min(w, h) * 0.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.fillRect(w * 0.55, h * 0.25, w * 0.25, h * 0.5);

      executeGlassPipeline();
    }
  }, [styleMode, ribCount, refraction, frostedNoise, specular, chromatic, backdropTheme, uploadedImage]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setUploadedImage(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const applyPreset = (preset: GlassPreset) => {
    setSelectedPresetId(preset.id);
    setStyleMode(preset.styleMode);
    setRibCount(preset.ribCount);
    setRefraction(preset.refraction);
    setFrostedNoise(preset.frostedNoise);
    setSpecular(preset.specular);
    setChromatic(preset.chromatic);
    setBackdropTheme(preset.backdropTheme);
  };

  const saveCurrentAsPreset = () => {
    const name = prompt('Enter preset name:', `Glass Look #${customPresets.length + 1}`);
    if (!name) return;
    const newPreset: GlassPreset = {
      id: `custom-${Date.now()}`,
      name,
      styleMode,
      ribCount,
      refraction,
      frostedNoise,
      specular,
      chromatic,
      backdropTheme
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_fractal_presets', JSON.stringify(updated));
    setSelectedPresetId(newPreset.id);
    confetti({ particleCount: 40, spread: 60 });
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_fractal_presets', JSON.stringify(updated));
  };

  const randomize = () => {
    const modes: ('fluted' | 'horizontal' | 'frosted' | 'prism' | 'fractal')[] = ['fluted', 'horizontal', 'frosted', 'prism', 'fractal'];
    setStyleMode(modes[Math.floor(Math.random() * modes.length)]);
    setRibCount(Math.floor(16 + Math.random() * 40));
    setRefraction(0.5 + Math.random() * 1.5);
    setFrostedNoise(0.05 + Math.random() * 0.5);
    setSpecular(0.2 + Math.random() * 0.7);
    setChromatic(0.05 + Math.random() * 0.35);
  };

  const exportPngHighRes = (scale: number = 2) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `fractal-glass-${dimensions.width * scale}x${dimensions.height * scale}-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    confetti({ particleCount: 50, spread: 60 });
    setIsExportModalOpen(false);
  };

  const copyCssBackdrop = () => {
    const cssCode = `/* Glassmorphism Refraction CSS */
.glass-panel {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(${Math.round(frostedNoise * 20 + 10)}px) saturate(${Math.round(refraction * 100 + 80)}%);
  -webkit-backdrop-filter: blur(${Math.round(frostedNoise * 20 + 10)}px) saturate(${Math.round(refraction * 100 + 80)}%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}`;
    navigator.clipboard.writeText(cssCode);
    setCopiedCss(true);
    confetti({ particleCount: 30, spread: 45 });
    setTimeout(() => setCopiedCss(false), 2500);
  };

  const allPresets = presetTab === 'curated' ? CURATED_GLASS_PRESETS : customPresets;
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
              <Layers className="w-4 h-4 text-[#a855f7]" />
              <span className="text-xs font-bold text-[#f2f2f5] tracking-wide uppercase">
                Fractal Glass Effect
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
            {/* Section 1: Glass Style Mode */}
            <div className="p-3.5 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">
                Glass Geometry Style
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'fluted', label: 'Fluted Vertical' },
                  { id: 'horizontal', label: 'Fluted Horiz.' },
                  { id: 'prism', label: 'Prism Diamond' },
                  { id: 'frosted', label: 'Frosted Blur' },
                  { id: 'fractal', label: 'Fractal Ripple' }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStyleMode(st.id as any)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      styleMode === st.id
                        ? 'border-[#a855f7] bg-[#a855f7]/15 text-[#c084fc] shadow-xs'
                        : 'border-[#2e303b] bg-[#23242c] text-[#8f94a8] hover:text-[#f2f2f5]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Refraction & Optics */}
            <div className="p-3.5 flex flex-col gap-3.5">
              <button
                type="button"
                onClick={() => toggleSection('glass')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:text-[#f2f2f5] cursor-pointer"
              >
                <span>Optics & Refraction</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.glass ? 'rotate-180' : ''}`} />
              </button>

              {openSections.glass && (
                <div className="flex flex-col gap-3.5 pt-1">
                  {/* Rib Count */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Rib Density</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{ribCount}</span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={64}
                      step={2}
                      value={ribCount}
                      onChange={(e) => setRibCount(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#a855f7]"
                    />
                  </div>

                  {/* Refraction Index */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Distortion Scale</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{refraction.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={2.5}
                      step={0.05}
                      value={refraction}
                      onChange={(e) => setRefraction(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#a855f7]"
                    />
                  </div>

                  {/* Chromatic Aberration */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">RGB Chromatic Split</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{Math.round(chromatic * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={0.5}
                      step={0.02}
                      value={chromatic}
                      onChange={(e) => setChromatic(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#a855f7]"
                    />
                  </div>

                  {/* Specular Highlight */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Edge Specular Ridge</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{Math.round(specular * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={specular}
                      onChange={(e) => setSpecular(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#a855f7]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Backdrop Image / Gradient */}
            <div className="p-3.5 flex flex-col gap-3.5">
              <button
                type="button"
                onClick={() => toggleSection('backdrop')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:text-[#f2f2f5] cursor-pointer"
              >
                <span>Backdrop Layer</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.backdrop ? 'rotate-180' : ''}`} />
              </button>

              {openSections.backdrop && (
                <div className="flex flex-col gap-3 pt-1">
                  {/* Preset Gradients */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'sunset', label: 'Sunset' },
                      { id: 'aurora', label: 'Aurora' },
                      { id: 'cyber', label: 'Cyber' }
                    ].map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => {
                          setUploadedImage(null);
                          setBackdropTheme(bg.id);
                        }}
                        className={`py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                          !uploadedImage && backdropTheme === bg.id
                            ? 'border-[#a855f7] bg-[#a855f7]/15 text-[#c084fc]'
                            : 'border-[#2e303b] bg-[#23242c] text-[#8f94a8]'
                        }`}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>

                  {/* Upload Image Dropzone */}
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
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#2e303b] hover:border-[#a855f7] bg-[#1a1b24] text-xs font-semibold text-[#8f94a8] hover:text-[#f2f2f5] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadedImage ? 'Replace Image' : 'Upload Backdrop Photo'}</span>
                  </button>
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
                          ? 'border-[#a855f7] bg-[#a855f7]/15 text-[#c084fc] shadow-xs'
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
            title="Randomize glass optics (Space)"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>Randomize</span>
          </button>
          <button
            type="button"
            onClick={copyCssBackdrop}
            className="studio-btn studio-btn-secondary"
            title="Copy CSS Backdrop Filter"
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
            <span className="text-[11px] text-[#8f94a8]">Realistic fluted glass optical refraction simulation</span>
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
                <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" />
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
                Curated ({CURATED_GLASS_PRESETS.length})
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
              placeholder="Search glass looks..."
              value={searchPreset}
              onChange={(e) => setSearchPreset(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] placeholder-[#686c82] outline-none focus:border-[#a855f7]"
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
                      ? 'border-[#a855f7] bg-[#a855f7]/15 ring-2 ring-[#a855f7]/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                      : 'border-[#2e303b] hover:border-[#484b5c] bg-[#1a1b24] hover:bg-[#20222d]'
                  }`}
                >
                  {/* Thumbnail Swatch */}
                  <div
                    className="w-full aspect-[4/3] rounded-lg shadow-inner shrink-0 border border-black/30 group-hover:scale-102 transition-transform overflow-hidden relative"
                    style={{
                      background: preset.backdropTheme === 'sunset'
                        ? 'linear-gradient(135deg, #ff4b72, #7928ca)'
                        : preset.backdropTheme === 'aurora'
                        ? 'linear-gradient(135deg, #06b6d4, #10b981)'
                        : 'linear-gradient(135deg, #00f2fe, #ff007f)'
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
                <div className="w-8 h-8 rounded-lg bg-[#a855f7]/15 text-[#a855f7] flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#f2f2f5]">Export Fractal Glass</h3>
                  <p className="text-xs text-[#8f94a8]">Download Ultra-HD PNG resolution</p>
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
                      className="py-2.5 px-3 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#a855f7] text-xs font-semibold text-[#f2f2f5] flex flex-col items-center gap-0.5 transition-all cursor-pointer"
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-[#8f94a8] font-mono">
                        {dimensions.width * item.scale}×{dimensions.height * item.scale}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
