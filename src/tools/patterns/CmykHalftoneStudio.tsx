import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download,
  Upload,
  Printer,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Plus,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CmykPreset {
  id: string;
  name: string;
  pitch: number;
  maxDotSize: number;
  cyanGain: number;
  magentaGain: number;
  yellowGain: number;
  blackGain: number;
  paperColor: string;
}

const CURATED_CMYK_PRESETS: CmykPreset[] = [
  {
    id: 'offset-press',
    name: 'Standard Offset Press',
    pitch: 14,
    maxDotSize: 6.5,
    cyanGain: 1.0,
    magentaGain: 1.0,
    yellowGain: 1.0,
    blackGain: 1.0,
    paperColor: '#ffffff'
  },
  {
    id: 'heavy-rosette',
    name: 'Heavy Rosette Grain',
    pitch: 18,
    maxDotSize: 9.0,
    cyanGain: 1.2,
    magentaGain: 1.2,
    yellowGain: 1.1,
    blackGain: 1.3,
    paperColor: '#fbf7ee'
  },
  {
    id: 'vintage-newsprint',
    name: 'Vintage Newspaper',
    pitch: 12,
    maxDotSize: 5.5,
    cyanGain: 0.8,
    magentaGain: 0.85,
    yellowGain: 0.9,
    blackGain: 1.4,
    paperColor: '#f5efe6'
  },
  {
    id: 'acid-cmyk',
    name: 'Acid Neon CMYK',
    pitch: 16,
    maxDotSize: 8.0,
    cyanGain: 1.5,
    magentaGain: 1.6,
    yellowGain: 1.4,
    blackGain: 0.6,
    paperColor: '#ffffff'
  },
  {
    id: 'fine-lithograph',
    name: 'Fine Lithography',
    pitch: 8,
    maxDotSize: 4.0,
    cyanGain: 1.0,
    magentaGain: 1.0,
    yellowGain: 1.0,
    blackGain: 1.1,
    paperColor: '#fafafa'
  }
];

const ASPECT_PRESETS = [
  { id: '16:9', label: '16:9', width: 1920, height: 1080 },
  { id: '1:1', label: '1:1 Square', width: 1400, height: 1400 },
  { id: '9:16', label: '9:16 Story', width: 1080, height: 1920 },
  { id: '4:3', label: '4:3 Standard', width: 1600, height: 1200 },
  { id: 'banner', label: 'Banner', width: 1500, height: 500 }
];

export const CmykHalftoneStudio: React.FC = () => {
  const [pitch, setPitch] = useState<number>(CURATED_CMYK_PRESETS[0].pitch);
  const [maxDotSize, setMaxDotSize] = useState<number>(CURATED_CMYK_PRESETS[0].maxDotSize);
  const [cyanGain, setCyanGain] = useState<number>(CURATED_CMYK_PRESETS[0].cyanGain);
  const [magentaGain, setMagentaGain] = useState<number>(CURATED_CMYK_PRESETS[0].magentaGain);
  const [yellowGain, setYellowGain] = useState<number>(CURATED_CMYK_PRESETS[0].yellowGain);
  const [blackGain, setBlackGain] = useState<number>(CURATED_CMYK_PRESETS[0].blackGain);
  const [paperColor, setPaperColor] = useState<string>(CURATED_CMYK_PRESETS[0].paperColor);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080, label: '16:9' });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('offset-press');
  const [searchPreset, setSearchPreset] = useState('');
  const [presetTab, setPresetTab] = useState<'curated' | 'saved'>('curated');
  const [customPresets, setCustomPresets] = useState<CmykPreset[]>([]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    screen: true,
    channels: true,
    paper: true,
    backdrop: false
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('magic_custom_cmyk_presets');
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

    const executeCmykPass = (sourceCtx: CanvasRenderingContext2D) => {
      const srcImgData = sourceCtx.getImageData(0, 0, w, h);
      const src = srcImgData.data;

      ctx.fillStyle = paperColor;
      ctx.fillRect(0, 0, w, h);

      const layers = [
        { name: 'Cyan', color: 'rgba(0, 180, 255, 0.72)', angle: 15, gain: cyanGain, getVal: (r: number) => 1 - r / 255 },
        { name: 'Magenta', color: 'rgba(255, 0, 128, 0.72)', angle: 75, gain: magentaGain, getVal: (_r: number, g: number) => 1 - g / 255 },
        { name: 'Yellow', color: 'rgba(255, 230, 0, 0.85)', angle: 0, gain: yellowGain, getVal: (_r: number, _g: number, b: number) => 1 - b / 255 },
        { name: 'Black', color: 'rgba(15, 23, 42, 0.88)', angle: 45, gain: blackGain, getVal: (r: number, g: number, b: number) => Math.max(0, 1 - (r + g + b) / (255 * 3)) }
      ];

      layers.forEach((layer) => {
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate((layer.angle * Math.PI) / 180);
        ctx.translate(-w / 2, -h / 2);

        const rad = Math.hypot(w, h);
        const startX = -rad / 2;
        const endX = w + rad / 2;
        const startY = -rad / 2;
        const endY = h + rad / 2;

        ctx.fillStyle = layer.color;

        const cos = Math.cos((-layer.angle * Math.PI) / 180);
        const sin = Math.sin((-layer.angle * Math.PI) / 180);

        for (let y = startY; y < endY; y += pitch) {
          for (let x = startX; x < endX; x += pitch) {
            const cx = x - w / 2;
            const cy = y - h / 2;
            const sampleX = Math.round(cx * cos - cy * sin + w / 2);
            const sampleY = Math.round(cx * sin + cy * cos + h / 2);

            if (sampleX >= 0 && sampleX < w && sampleY >= 0 && sampleY < h) {
              const idx = (sampleY * w + sampleX) * 4;
              const inkDensity = Math.min(1, layer.getVal(src[idx], src[idx + 1], src[idx + 2]) * layer.gain);
              const dotR = inkDensity * maxDotSize;

              if (dotR > 0.4) {
                ctx.beginPath();
                ctx.arc(x, y, dotR, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }
        ctx.restore();
      });
    };

    if (uploadedImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        offCtx.drawImage(img, 0, 0, w, h);
        executeCmykPass(offCtx);
      };
      img.src = uploadedImage;
    } else {
      const grad = offCtx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#ff0055');
      grad.addColorStop(0.35, '#00ffff');
      grad.addColorStop(0.7, '#ffcc00');
      grad.addColorStop(1, '#001133');
      offCtx.fillStyle = grad;
      offCtx.fillRect(0, 0, w, h);

      offCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      offCtx.beginPath();
      offCtx.arc(w * 0.4, h * 0.4, Math.min(w, h) * 0.25, 0, Math.PI * 2);
      offCtx.fill();

      offCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      offCtx.fillRect(w * 0.5, h * 0.35, w * 0.3, h * 0.45);

      executeCmykPass(offCtx);
    }
  }, [pitch, maxDotSize, cyanGain, magentaGain, yellowGain, blackGain, paperColor, uploadedImage]);

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
    setPitch(Math.floor(10 + Math.random() * 12));
    setMaxDotSize(Math.floor(4 + Math.random() * 6));
    setCyanGain(0.7 + Math.random() * 0.8);
    setMagentaGain(0.7 + Math.random() * 0.8);
    setYellowGain(0.7 + Math.random() * 0.8);
    setBlackGain(0.7 + Math.random() * 0.8);
  };

  const applyPreset = (preset: CmykPreset) => {
    setSelectedPresetId(preset.id);
    setPitch(preset.pitch);
    setMaxDotSize(preset.maxDotSize);
    setCyanGain(preset.cyanGain);
    setMagentaGain(preset.magentaGain);
    setYellowGain(preset.yellowGain);
    setBlackGain(preset.blackGain);
    setPaperColor(preset.paperColor);
  };

  const saveCurrentAsPreset = () => {
    const name = prompt('Enter preset name:', `CMYK Look #${customPresets.length + 1}`);
    if (!name) return;
    const newPreset: CmykPreset = {
      id: `custom-${Date.now()}`,
      name,
      pitch,
      maxDotSize,
      cyanGain,
      magentaGain,
      yellowGain,
      blackGain,
      paperColor
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_cmyk_presets', JSON.stringify(updated));
    setSelectedPresetId(newPreset.id);
    confetti({ particleCount: 40, spread: 60 });
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_cmyk_presets', JSON.stringify(updated));
  };

  const exportPngHighRes = (scale: number = 2) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `cmyk-halftone-${dimensions.width * scale}x${dimensions.height * scale}-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    confetti({ particleCount: 50, spread: 60 });
    setIsExportModalOpen(false);
  };

  const allPresets = presetTab === 'curated' ? CURATED_CMYK_PRESETS : customPresets;
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
              <Printer className="w-4 h-4 text-[#06b6d4]" />
              <span className="text-xs font-bold text-[#f2f2f5] tracking-wide uppercase">
                CMYK Halftone Print
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
            <div className="p-3.5 flex flex-col gap-3.5">
              <button
                type="button"
                onClick={() => toggleSection('screen')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:text-[#f2f2f5] cursor-pointer"
              >
                <span>Screen Rosette Parameters</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.screen ? 'rotate-180' : ''}`} />
              </button>

              {openSections.screen && (
                <div className="flex flex-col gap-3.5 pt-1">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Grid Pitch</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{pitch}px</span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={28}
                      step={1}
                      value={pitch}
                      onChange={(e) => setPitch(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#06b6d4]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Max Dot Diameter</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{maxDotSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={14}
                      step={0.5}
                      value={maxDotSize}
                      onChange={(e) => setMaxDotSize(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#06b6d4]"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3.5 flex flex-col gap-3.5">
              <button
                type="button"
                onClick={() => toggleSection('channels')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:text-[#f2f2f5] cursor-pointer"
              >
                <span>4-Color Process Gains</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.channels ? 'rotate-180' : ''}`} />
              </button>

              {openSections.channels && (
                <div className="flex flex-col gap-3 pt-1">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#00b4ff] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#00b4ff]" />
                        Cyan (15°)
                      </span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{Math.round(cyanGain * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={2.0}
                      step={0.05}
                      value={cyanGain}
                      onChange={(e) => setCyanGain(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#00b4ff]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#ff0080] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#ff0080]" />
                        Magenta (75°)
                      </span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{Math.round(magentaGain * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={2.0}
                      step={0.05}
                      value={magentaGain}
                      onChange={(e) => setMagentaGain(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#ff0080]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#ffe600] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#ffe600]" />
                        Yellow (0°)
                      </span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{Math.round(yellowGain * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={2.0}
                      step={0.05}
                      value={yellowGain}
                      onChange={(e) => setYellowGain(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#ffe600]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white" />
                        Black / Key (45°)
                      </span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{Math.round(blackGain * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={2.0}
                      step={0.05}
                      value={blackGain}
                      onChange={(e) => setBlackGain(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3.5 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">
                Paper Stock Color
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#8f94a8]">Backdrop</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={paperColor}
                    onChange={(e) => setPaperColor(e.target.value)}
                    className="w-7 h-7 rounded-lg border border-[#2e303b] bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-xs text-[#f2f2f5] uppercase">{paperColor}</span>
                </div>
              </div>
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
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#2e303b] hover:border-[#06b6d4] bg-[#1a1b24] text-xs font-semibold text-[#8f94a8] hover:text-[#f2f2f5] flex items-center justify-center gap-2 transition-all cursor-pointer"
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
                          ? 'border-[#06b6d4] bg-[#06b6d4]/15 text-[#06b6d4] shadow-xs'
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#23242c] text-[11px] font-semibold text-[#f2f2f5] hover:bg-[#2e303b] transition-colors cursor-pointer"
            title="Randomize CMYK gains"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#06b6d4]" />
            <span>Randomize</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#06b6d4] text-[11px] font-semibold text-white hover:bg-[#0891b2] transition-colors cursor-pointer"
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
            <span className="text-[11px] text-[#8f94a8]">Authentic 4-color offset printing rosette simulation</span>
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
                <Sparkles className="w-3.5 h-3.5 text-[#06b6d4]" />
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
                Curated ({CURATED_CMYK_PRESETS.length})
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
              placeholder="Search CMYK looks..."
              value={searchPreset}
              onChange={(e) => setSearchPreset(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] placeholder-[#686c82] outline-none focus:border-[#06b6d4]"
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
                      ? 'border-[#06b6d4] bg-[#06b6d4]/15 ring-2 ring-[#06b6d4]/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'border-[#2e303b] hover:border-[#484b5c] bg-[#1a1b24] hover:bg-[#20222d]'
                  }`}
                >
                  <div
                    className="w-full aspect-[4/3] rounded-lg shadow-inner shrink-0 border border-black/30 group-hover:scale-102 transition-transform overflow-hidden relative flex items-center justify-center gap-1 p-2"
                    style={{ backgroundColor: preset.paperColor }}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#00b4ff] opacity-80" />
                    <span className="w-3 h-3 rounded-full bg-[#ff0080] opacity-80 -ml-1.5" />
                    <span className="w-3 h-3 rounded-full bg-[#ffe600] opacity-80 -ml-1.5" />
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
                <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/15 text-[#06b6d4] flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#f2f2f5]">Export CMYK Print</h3>
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
                      className="py-2.5 px-3 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#06b6d4] text-xs font-semibold text-[#f2f2f5] flex flex-col items-center gap-0.5 transition-all cursor-pointer"
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
