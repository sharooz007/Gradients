import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Copy,
  Check,
  Pipette,
  Upload,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  FileCode
} from 'lucide-react';
import confetti from 'canvas-confetti';


interface ExtractedColor {
  hex: string;
  count: number;
  percentage: number;
}

interface SampleImage {
  id: string;
  name: string;
  url: string;
}

const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon City',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'sunset',
    name: 'Golden Hour Coast',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'forest',
    name: 'Emerald Rainforest',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'architectural',
    name: 'Bauhaus Architecture',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
  }
];

export const ImagePaletteExtractorStudio: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string>(SAMPLE_IMAGES[0].url);
  const [sampleCount, setSampleCount] = useState<number>(6);
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('cyberpunk');
  const [searchPreset, setSearchPreset] = useState('');
  const [presetTab, setPresetTab] = useState<'curated' | 'saved'>('curated');
  const [customPresets, setCustomPresets] = useState<SampleImage[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('magic_custom_extracted_images');
      if (saved) setCustomPresets(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    extractColorsFromImage(imageSrc, sampleCount);
  }, [imageSrc, sampleCount]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setImageSrc(src);
      setSelectedSampleId('uploaded');
    };
    reader.readAsDataURL(file);
  };

  const extractColorsFromImage = (src: string, count: number) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 120;
      canvas.height = 120;
      ctx.drawImage(img, 0, 0, 120, 120);

      const imgData = ctx.getImageData(0, 0, 120, 120).data;
      const colorMap: Record<string, number> = {};
      let totalSamples = 0;

      // Sample every 4th pixel for speed & quantization
      for (let i = 0; i < imgData.length; i += 16) {
        const r = Math.round(imgData[i] / 32) * 32;
        const g = Math.round(imgData[i + 1] / 32) * 32;
        const b = Math.round(imgData[i + 2] / 32) * 32;

        const toHex = (n: number) => Math.min(255, n).toString(16).padStart(2, '0');
        const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

        colorMap[hex] = (colorMap[hex] || 0) + 1;
        totalSamples++;
      }

      const sorted = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([hex, cnt]) => ({
          hex,
          count: cnt,
          percentage: Math.round((cnt / totalSamples) * 100)
        }));

      setExtractedColors(sorted);
    };
    img.src = src;
  };

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    confetti({ particleCount: 20, spread: 35 });
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const copyCssVars = () => {
    const css = `:root {\n${extractedColors.map((c, i) => `  --extracted-color-${i + 1}: ${c.hex};`).join('\n')}\n}`;
    navigator.clipboard.writeText(css);
    setCopiedHex('CSS');
    confetti({ particleCount: 30, spread: 45 });
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(
      JSON.stringify(extractedColors.map((c) => c.hex), null, 2)
    );
    setCopiedHex('JSON');
    confetti({ particleCount: 30, spread: 45 });
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const saveCurrentAsPreset = () => {
    const name = prompt('Enter preset name:', `Image Palette #${customPresets.length + 1}`);
    if (!name) return;
    const newPreset: SampleImage = {
      id: `custom-${Date.now()}`,
      name,
      url: imageSrc
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_extracted_images', JSON.stringify(updated));
    setSelectedSampleId(newPreset.id);
    confetti({ particleCount: 40, spread: 60 });
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_extracted_images', JSON.stringify(updated));
  };

  const allPresets = presetTab === 'curated' ? SAMPLE_IMAGES : customPresets;
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
              <Pipette className="w-4 h-4 text-[#ec4899]" />
              <span className="text-xs font-bold text-[#f2f2f5] tracking-wide uppercase">
                Image Palette Extractor
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
            {/* Section 1: Upload Image */}
            <div className="p-3.5 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">
                Image Source
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
                className="w-full py-6 rounded-2xl border-2 border-dashed border-[#2e303b] hover:border-[#ec4899] bg-[#23242c]/50 hover:bg-[#ec4899]/10 transition-all flex flex-col items-center justify-center gap-2 text-[#8f94a8] hover:text-[#ec4899] cursor-pointer"
              >
                <Upload className="w-6 h-6" />
                <span className="text-xs font-medium">Upload custom photo</span>
              </button>
            </div>

            {/* Section 2: Colors Count Slider */}
            <div className="p-3.5 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#8f94a8]">Number of Colors</span>
                <span className="font-mono font-bold text-[#f2f2f5]">{sampleCount}</span>
              </div>
              <input
                type="range"
                min={4}
                max={10}
                value={sampleCount}
                onChange={(e) => setSampleCount(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#ec4899]"
              />
            </div>
          </div>
        </aside>
      )}

      {/* 2. Central Viewport */}
      <main className="relative flex-1 h-full studio-grid-bg flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none">
        {/* Top Floating Action Bar */}
        <div className="z-10 shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={copyCssVars}
            className="studio-btn studio-btn-secondary"
            title="Copy CSS Variables"
          >
            {copiedHex === 'CSS' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
            <span>{copiedHex === 'CSS' ? 'Copied CSS!' : 'CSS Variables'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="studio-btn studio-btn-primary"
            title="Export Palette"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>

        {/* Center Content Container */}
        <div className="relative w-full flex-1 max-w-5xl flex flex-col items-center justify-center gap-6 min-h-0 my-2">
          {/* Image Preview Box */}
          <div className="relative max-h-[300px] rounded-2xl border border-[#2e303b] shadow-2xl overflow-hidden bg-[#16171d] flex items-center justify-center">
            <img
              src={imageSrc}
              alt="Source palette target"
              className="max-h-[300px] w-auto object-contain rounded-2xl"
            />
          </div>

          {/* Extracted Swatches Cards */}
          <div className="w-full max-w-3xl h-24 rounded-2xl border border-[#2e303b] shadow-xl overflow-hidden flex divide-x divide-white/10 bg-[#16171d]">
            {extractedColors.map((color, i) => {
              const isDark = getLuminance(color.hex) < 0.5;
              const textColor = isDark ? '#ffffff' : '#000000';

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => copyColor(color.hex)}
                  className="flex-1 h-full flex flex-col justify-between p-3 group hover:flex-[1.4] transition-all cursor-pointer relative"
                  style={{ backgroundColor: color.hex }}
                >
                  <span
                    className="font-mono text-[10px] font-bold opacity-80"
                    style={{ color: textColor }}
                  >
                    #{i + 1}
                  </span>
                  <div className="flex flex-col items-center">
                    <span
                      className="font-mono text-xs font-bold tracking-wider px-1.5 py-0.5 rounded shadow-xs"
                      style={{
                        color: textColor,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
                      }}
                    >
                      {copiedHex === color.hex ? 'Copied!' : color.hex.toUpperCase()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Toolbar */}
        <div className="w-full shrink-0 flex items-center justify-between text-xs text-[#686c82] px-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8f94a8]">Click any swatch to copy HEX code</span>
          </div>
          <div className="font-mono text-[10px] text-[#686c82]">
            {extractedColors.length} COLORS EXTRACTED
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
                <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">Sample Photos</span>
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
                Curated ({SAMPLE_IMAGES.length})
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
              placeholder="Search sample photos..."
              value={searchPreset}
              onChange={(e) => setSearchPreset(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] placeholder-[#686c82] outline-none focus:border-[#ec4899]"
            />
          </div>

          {/* Presets Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-2.5 custom-scrollbar overscroll-contain pb-10">
            {filteredPresets.map((preset) => {
              const isSelected = selectedSampleId === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    setSelectedSampleId(preset.id);
                    setImageSrc(preset.url);
                  }}
                  className={`group relative p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'border-[#ec4899] bg-[#ec4899]/15 ring-2 ring-[#ec4899]/40 shadow-[0_0_12px_rgba(236,72,153,0.25)]'
                      : 'border-[#2e303b] hover:border-[#484b5c] bg-[#1a1b24] hover:bg-[#20222d]'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-12 h-12 rounded-lg object-cover border border-black/30 shadow-inner shrink-0"
                  />

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs font-semibold text-[#f2f2f5] truncate">
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
                      className="opacity-0 group-hover:opacity-100 p-1 text-white bg-black/70 hover:bg-red-500 transition-all rounded-md"
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
                  <Pipette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#f2f2f5]">Export Extracted Palette</h3>
                  <p className="text-xs text-[#8f94a8]">Copy CSS Variables or JSON</p>
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
                  copyCssVars();
                  setIsExportModalOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#ec4899] text-xs font-semibold text-[#f2f2f5] flex items-center justify-between transition-all cursor-pointer"
              >
                <span>CSS Variables (:root)</span>
                <Copy className="w-3.5 h-3.5 text-[#ec4899]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  copyJson();
                  setIsExportModalOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#ec4899] text-xs font-semibold text-[#f2f2f5] flex items-center justify-between transition-all cursor-pointer"
              >
                <span>JSON Array of Hex Codes</span>
                <Copy className="w-3.5 h-3.5 text-[#ec4899]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getLuminance(hex: string) {
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16) / 255;
    g = parseInt(hex.slice(3, 5), 16) / 255;
    b = parseInt(hex.slice(5, 7), 16) / 255;
  }
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
