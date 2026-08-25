import React, { useState } from 'react';
import { Upload, Pipette, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExtractedColor {
  hex: string;
  count: number;
}

export const ImagePaletteExtractorStudio: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [sampleCount, setSampleCount] = useState<number>(6);
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([
    { hex: '#f59e0b', count: 1 },
    { hex: '#10b981', count: 1 },
    { hex: '#0284c7', count: 1 },
    { hex: '#6366f1', count: 1 },
    { hex: '#ec4899', count: 1 },
    { hex: '#0f172a', count: 1 }
  ]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setImageSrc(src);
      extractColorsFromImage(src);
    };
    reader.readAsDataURL(file);
  };

  const extractColorsFromImage = (src: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 150;
      canvas.height = 150;
      ctx.drawImage(img, 0, 0, 150, 150);

      const imgData = ctx.getImageData(0, 0, 150, 150).data;
      const colorMap: Record<string, number> = {};

      // Sample every 4th pixel for speed & quantization
      for (let i = 0; i < imgData.length; i += 16) {
        const r = Math.round(imgData[i] / 24) * 24;
        const g = Math.round(imgData[i + 1] / 24) * 24;
        const b = Math.round(imgData[i + 2] / 24) * 24;

        const toHex = (n: number) => Math.min(255, n).toString(16).padStart(2, '0');
        const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

        colorMap[hex] = (colorMap[hex] || 0) + 1;
      }

      const sorted = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, sampleCount)
        .map(([hex, count]) => ({ hex, count }));

      setExtractedColors(sorted);
      confetti({ particleCount: 30, spread: 45 });
    };
    img.src = src;
  };

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(
      JSON.stringify(extractedColors.map((c) => c.hex), null, 2)
    );
    setCopiedHex('ALL_JSON');
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#f5f5f7]">
      {/* Left Control Sidebar */}
      <aside className="w-80 h-full min-h-0 shrink-0 border-r border-[#e5e5ea] bg-white overflow-y-auto overflow-x-hidden z-20 custom-scrollbar overscroll-contain pb-10">
        <div className="flex flex-col w-full min-h-max">
        <div className="flex items-center justify-between p-4 border-b border-[#e5e5ea]">
          <div className="flex items-center gap-2">
            <Pipette className="w-4 h-4 text-[#0071e3]" />
            <span className="text-xs font-semibold text-[#1d1d1f]">
              Image Palette Extractor
            </span>
          </div>
        </div>

        {/* Upload Photo Button */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-2.5">
          <span className="text-xs font-medium text-[#1d1d1f]">Image Source</span>
          <label className="apple-btn apple-btn-primary gap-1.5 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{imageSrc ? 'Replace Image' : 'Upload Image to Extract'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Sample Count Slider */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-[#86868b]">
            <span>Extracted Color Count</span>
            <span className="font-mono text-[#1d1d1f]">{sampleCount} swatches</span>
          </div>
          <input
            type="range"
            min="4"
            max="8"
            value={sampleCount}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setSampleCount(val);
              if (imageSrc) extractColorsFromImage(imageSrc);
            }}
            className="w-full"
          />
        </div>

        {/* Export Action */}
        <div className="mt-auto p-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={copyJson}
            className="apple-btn apple-btn-primary gap-1.5 shadow-2xs"
          >
            {copiedHex === 'ALL_JSON' ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copiedHex === 'ALL_JSON' ? 'JSON Copied!' : 'Copy Swatches JSON'}</span>
          </button>
        </div>
      </div>
      </aside>

      {/* Main Extractor Canvas Visualizer Area */}
      <main className="relative flex-1 h-full apple-grid-bg flex items-center justify-center p-8 overflow-y-auto custom-scrollbar select-none">
        <div className="w-full max-w-3xl flex flex-col gap-6 items-center">
          {/* Image Display Card */}
          <div className="relative w-full max-w-xl h-72 rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#000000]/10 bg-white flex items-center justify-center">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Source for extraction"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-[#86868b]">
                <div className="w-14 h-14 rounded-full bg-[#f2f2f7] flex items-center justify-center text-[#86868b]">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium">Upload any photo to extract dominant color ramps</p>
              </div>
            )}
          </div>

          {/* Extracted Swatches Card */}
          <div className="w-full max-w-xl p-4 bg-white rounded-2xl shadow-xl border border-[#e5e5ea] flex flex-col gap-3">
            <span className="text-xs font-semibold text-[#1d1d1f]">
              Extracted Swatches
            </span>
            <div className="flex h-16 rounded-xl overflow-hidden shadow-xs border border-[#e5e5ea]">
              {extractedColors.map((col, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => copyColor(col.hex)}
                  className="flex-1 h-full flex flex-col justify-end p-2 transition-transform hover:scale-105 cursor-pointer relative group"
                  style={{ backgroundColor: col.hex }}
                >
                  <span className="text-[10px] font-mono text-white/90 opacity-0 group-hover:opacity-100 bg-black/60 rounded px-1 text-center">
                    {copiedHex === col.hex ? 'Copied' : col.hex.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
