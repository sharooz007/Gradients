import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download,
  Upload,
  CircleDot,
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

interface HalftonePreset {
  id: string;
  name: string;
  dotShape: 'circle' | 'square' | 'diamond' | 'line';
  spacing: number;
  maxRadius: number;
  angle: number;
  contrast: number;
  dotColor: string;
  bgColor: string;
  invert: boolean;
}

const CURATED_HALFTONE_PRESETS: HalftonePreset[] = [
  {
    id: 'retro-comic',
    name: 'Retro Comic Print',
    dotShape: 'circle',
    spacing: 14,
    maxRadius: 7.5,
    angle: 45,
    contrast: 1.3,
    dotColor: '#0f172a',
    bgColor: '#fdf6e2',
    invert: false
  },
  {
    id: 'newsprint-bw',
    name: 'Newsprint Monotone',
    dotShape: 'circle',
    spacing: 10,
    maxRadius: 5.5,
    angle: 15,
    contrast: 1.5,
    dotColor: '#1e293b',
    bgColor: '#f1f5f9',
    invert: false
  },
  {
    id: 'cyber-halftone',
    name: 'Cyberpunk Neon Matrix',
    dotShape: 'square',
    spacing: 16,
    maxRadius: 8,
    angle: 0,
    contrast: 1.4,
    dotColor: '#00f2fe',
    bgColor: '#080811',
    invert: true
  },
  {
    id: 'diamond-engraving',
    name: 'Diamond Engraving',
    dotShape: 'diamond',
    spacing: 18,
    maxRadius: 9,
    angle: 45,
    contrast: 1.2,
    dotColor: '#a855f7',
    bgColor: '#090514',
    invert: true
  },
  {
    id: 'linear-scanline',
    name: 'Scanline Frequency',
    dotShape: 'line',
    spacing: 12,
    maxRadius: 6,
    angle: 0,
    contrast: 1.6,
    dotColor: '#10b981',
    bgColor: '#03140d',
    invert: true
  },
  {
    id: 'sunset-pop',
    name: 'Sunset Pop Art',
    dotShape: 'circle',
    spacing: 15,
    maxRadius: 8,
    angle: 60,
    contrast: 1.2,
    dotColor: '#ff4b72',
    bgColor: '#fef08a',
    invert: false
  }
];

const ASPECT_PRESETS = [
  { id: '16:9', label: '16:9', width: 1920, height: 1080 },
  { id: '1:1', label: '1:1 Square', width: 1400, height: 1400 },
  { id: '9:16', label: '9:16 Story', width: 1080, height: 1920 },
  { id: '4:3', label: '4:3 Standard', width: 1600, height: 1200 },
  { id: 'banner', label: 'Banner', width: 1500, height: 500 }
];

export const HalftoneStudio: React.FC = () => {
  const [dotShape, setDotShape] = useState<'circle' | 'square' | 'diamond' | 'line'>(
    CURATED_HALFTONE_PRESETS[0].dotShape
  );
  const [spacing, setSpacing] = useState<number>(CURATED_HALFTONE_PRESETS[0].spacing);
  const [maxRadius, setMaxRadius] = useState<number>(CURATED_HALFTONE_PRESETS[0].maxRadius);
  const [angle, setAngle] = useState<number>(CURATED_HALFTONE_PRESETS[0].angle);
  const [contrast, setContrast] = useState<number>(CURATED_HALFTONE_PRESETS[0].contrast);
  const [dotColor, setDotColor] = useState<string>(CURATED_HALFTONE_PRESETS[0].dotColor);
  const [bgColor, setBgColor] = useState<string>(CURATED_HALFTONE_PRESETS[0].bgColor);
  const [invert, setInvert] = useState<boolean>(CURATED_HALFTONE_PRESETS[0].invert);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080, label: '16:9' });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('retro-comic');
  const [searchPreset, setSearchPreset] = useState('');
  const [presetTab, setPresetTab] = useState<'curated' | 'saved'>('curated');
  const [customPresets, setCustomPresets] = useState<HalftonePreset[]>([]);
  const [copiedSvg, setCopiedSvg] = useState(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    shape: true,
    raster: true,
    colors: true,
    backdrop: false
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('magic_custom_halftone_presets');
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

    const offCanvas = document.createElement('canvas');
    offCanvas.width = w;
    offCanvas.height = h;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    const executeHalftonePass = (sourceCtx: CanvasRenderingContext2D) => {
      const srcImgData = sourceCtx.getImageData(0, 0, w, h);
      const src = srcImgData.data;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.translate(-w / 2, -h / 2);

      const rad = Math.hypot(w, h);
      const startX = -rad / 2;
      const endX = w + rad / 2;
      const startY = -rad / 2;
      const endY = h + rad / 2;

      ctx.fillStyle = dotColor;

      const cos = Math.cos((-angle * Math.PI) / 180);
      const sin = Math.sin((-angle * Math.PI) / 180);

      for (let y = startY; y < endY; y += spacing) {
        for (let x = startX; x < endX; x += spacing) {
          const cx = x - w / 2;
          const cy = y - h / 2;
          const sampleX = Math.round(cx * cos - cy * sin + w / 2);
          const sampleY = Math.round(cx * sin + cy * cos + h / 2);

          if (sampleX >= 0 && sampleX < w && sampleY >= 0 && sampleY < h) {
            const idx = (sampleY * w + sampleX) * 4;
            const r = src[idx];
            const g = src[idx + 1];
            const b = src[idx + 2];
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            const adjustedLum = Math.pow(luminance, contrast);
            const factor = invert ? adjustedLum : (1 - adjustedLum);
            const size = factor * maxRadius;

            if (size > 0.5) {
              if (dotShape === 'circle') {
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
              } else if (dotShape === 'square') {
                ctx.fillRect(x - size, y - size, size * 2, size * 2);
              } else if (dotShape === 'diamond') {
                ctx.beginPath();
                ctx.moveTo(x, y - size * 1.2);
                ctx.lineTo(x + size * 1.2, y);
                ctx.lineTo(x, y - size * 1.2);
                ctx.lineTo(x - size * 1.2, y);
                ctx.closePath();
                ctx.fill();
              } else if (dotShape === 'line') {
                ctx.fillRect(x - spacing / 2, y - size * 0.5, spacing, size);
              }
            }
          }
        }
      }

      ctx.restore();
    };

    if (uploadedImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        offCtx.drawImage(img, 0, 0, w, h);
        executeHalftonePass(offCtx);
      };
      img.src = uploadedImage;
    } else {
      const grad = offCtx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, Math.max(w, h) * 0.6);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#888888');
      grad.addColorStop(1, '#000000');
      offCtx.fillStyle = grad;
      offCtx.fillRect(0, 0, w, h);

      offCtx.fillStyle = '#ffffff';
      offCtx.beginPath();
      offCtx.arc(w * 0.35, h * 0.35, Math.min(w, h) * 0.2, 0, Math.PI * 2);
      offCtx.fill();

      offCtx.fillStyle = '#000000';
      offCtx.fillRect(w * 0.5, h * 0.4, w * 0.3, h * 0.4);

      executeHalftonePass(offCtx);
    }
  }, [dotShape, spacing, maxRadius, angle, contrast, dotColor, bgColor, invert, uploadedImage]);

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

  const randomize = () => {
    const shapes: ('circle' | 'square' | 'diamond' | 'line')[] = ['circle', 'square', 'diamond', 'line'];
    setDotShape(shapes[Math.floor(Math.random() * shapes.length)]);
    setSpacing(Math.floor(8 + Math.random() * 16));
    setMaxRadius(Math.floor(4 + Math.random() * 8));
    setAngle(Math.floor(Math.random() * 90));
    setContrast(0.8 + Math.random() * 1.0);
  };

  const applyPreset = (preset: HalftonePreset) => {
    setSelectedPresetId(preset.id);
    setDotShape(preset.dotShape);
    setSpacing(preset.spacing);
    setMaxRadius(preset.maxRadius);
    setAngle(preset.angle);
    setContrast(preset.contrast);
    setDotColor(preset.dotColor);
    setBgColor(preset.bgColor);
    setInvert(preset.invert);
  };

  const saveCurrentAsPreset = () => {
    const name = prompt('Enter preset name:', `Halftone Look #${customPresets.length + 1}`);
    if (!name) return;
    const newPreset: HalftonePreset = {
      id: `custom-${Date.now()}`,
      name,
      dotShape,
      spacing,
      maxRadius,
      angle,
      contrast,
      dotColor,
      bgColor,
      invert
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_halftone_presets', JSON.stringify(updated));
    setSelectedPresetId(newPreset.id);
    confetti({ particleCount: 40, spread: 60 });
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_halftone_presets', JSON.stringify(updated));
  };

  const exportPngHighRes = (scale: number = 2) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `halftone-matrix-${dimensions.width * scale}x${dimensions.height * scale}-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    confetti({ particleCount: 50, spread: 60 });
    setIsExportModalOpen(false);
  };

  const copySvgSnippet = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dimensions.width} ${dimensions.height}" width="100%" height="100%">
  <rect width="100%" height="100%" fill="${bgColor}" />
  <g fill="${dotColor}">
    <!-- Halftone Screen Matrix (${dotShape}, spacing ${spacing}px, angle ${angle}deg) -->
  </g>
</svg>`;
    navigator.clipboard.writeText(svg);
    setCopiedSvg(true);
    confetti({ particleCount: 30, spread: 45 });
    setTimeout(() => setCopiedSvg(false), 2500);
  };

  const allPresets = presetTab === 'curated' ? CURATED_HALFTONE_PRESETS : customPresets;
  const filteredPresets = allPresets.filter((p) =>
    p.name.toLowerCase().includes(searchPreset.toLowerCase())
  );

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#0e0f14] text-[#f2f2f5] relative">
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
          <div className="p-3.5 border-b border-[#23242c] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CircleDot className="w-4 h-4 text-[#38bdf8]" />
              <span className="text-xs font-bold text-[#f2f2f5] tracking-wide uppercase">
                Halftone Dot Matrix
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
            <div className="p-3.5 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">
                Dot Geometry Shape
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'circle', label: 'Circle' },
                  { id: 'square', label: 'Square' },
                  { id: 'diamond', label: 'Diamond' },
                  { id: 'line', label: 'Line' }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setDotShape(st.id as any)}
                    className={`py-2 px-1 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      dotShape === st.id
                        ? 'border-[#38bdf8] bg-[#38bdf8]/15 text-[#38bdf8] shadow-xs'
                        : 'border-[#2e303b] bg-[#23242c] text-[#8f94a8] hover:text-[#f2f2f5]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 flex flex-col gap-3.5">
              <button
                type="button"
                onClick={() => toggleSection('raster')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:text-[#f2f2f5] cursor-pointer"
              >
                <span>Screen Raster Parameters</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.raster ? 'rotate-180' : ''}`} />
              </button>

              {openSections.raster && (
                <div className="flex flex-col gap-3.5 pt-1">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Grid Pitch / Spacing</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{spacing}px</span>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={32}
                      step={1}
                      value={spacing}
                      onChange={(e) => setSpacing(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#38bdf8]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Maximum Dot Scale</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{maxRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={18}
                      step={0.5}
                      value={maxRadius}
                      onChange={(e) => setMaxRadius(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#38bdf8]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Screen Angle</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{angle}°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={90}
                      step={5}
                      value={angle}
                      onChange={(e) => setAngle(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#38bdf8]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Contrast Curve</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{contrast.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={2.5}
                      step={0.1}
                      value={contrast}
                      onChange={(e) => setContrast(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#38bdf8]"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3.5 flex flex-col gap-3.5">
              <button
                type="button"
                onClick={() => toggleSection('colors')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:text-[#f2f2f5] cursor-pointer"
              >
                <span>Ink & Paper Colors</span>
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
                    <span className="text-xs font-semibold text-[#8f94a8]">Paper Background</span>
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

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#23242c] border border-[#2e303b]">
                    <span className="text-xs font-bold text-[#f2f2f5]">Invert Values (Dark Mode)</span>
                    <button
                      type="button"
                      onClick={() => setInvert(!invert)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        invert ? 'bg-[#38bdf8]' : 'bg-[#16171d]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          invert ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3.5 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">
                Source Image
              </span>
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
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#2e303b] hover:border-[#38bdf8] bg-[#1a1b24] text-xs font-semibold text-[#8f94a8] hover:text-[#f2f2f5] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadedImage ? 'Replace Image' : 'Upload Source Photo'}</span>
              </button>
              {uploadedImage && (
                <button
                  type="button"
                  onClick={() => setUploadedImage(null)}
                  className="text-[11px] text-red-400 hover:underline text-center cursor-pointer"
                >
                  Reset to Generative Gradient
                </button>
              )}
            </div>

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

      <main className="relative flex-1 h-full studio-grid-bg flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none">
        <div className="z-10 shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={randomize}
            className="studio-btn studio-btn-secondary"
            title="Randomize matrix parameters"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Randomize</span>
          </button>
          <button
            type="button"
            onClick={copySvgSnippet}
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

        <div className="w-full shrink-0 flex items-center justify-between text-xs text-[#686c82] px-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8f94a8]">Continuous tone screen raster halftone matrix</span>
          </div>
          <div className="font-mono text-[10px] text-[#686c82]">
            {dimensions.width} × {dimensions.height} ({dimensions.label})
          </div>
        </div>
      </main>

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
                Curated ({CURATED_HALFTONE_PRESETS.length})
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

            <input
              type="text"
              placeholder="Search halftone looks..."
              value={searchPreset}
              onChange={(e) => setSearchPreset(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] placeholder-[#686c82] outline-none focus:border-[#38bdf8]"
            />
          </div>

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
                  <div
                    className="w-full aspect-[4/3] rounded-lg shadow-inner shrink-0 border border-black/30 group-hover:scale-102 transition-transform overflow-hidden relative flex items-center justify-center"
                    style={{ backgroundColor: preset.bgColor }}
                  >
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: preset.dotColor }}
                    />
                  </div>

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

      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#16171d] rounded-2xl shadow-2xl border border-[#2e303b] overflow-hidden flex flex-col text-[#f2f2f5]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#23242c]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/15 text-[#38bdf8] flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#f2f2f5]">Export Halftone Matrix</h3>
                  <p className="text-xs text-[#8f94a8]">Download Ultra-HD PNG or SVG vector</p>
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
                  copySvgSnippet();
                  setIsExportModalOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#2e303b] bg-[#1a1b24] hover:bg-[#23242c] text-xs font-semibold text-[#f2f2f5] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-[#38bdf8]" />
                <span>Copy SVG Vector Code</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
