import React, { useState } from 'react';
import { Copy, Check, Image as ImageIcon, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';
import { rgbToHex } from '../../utils/colorUtils';

export const ImagePaletteExtractorStudio: React.FC = () => {
  const [colors, setColors] = useState<string[]>([
    '#0F172A',
    '#3B82F6',
    '#60A5FA',
    '#93C5FD',
    '#DBEAFE'
  ]);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const extractPaletteFromImg = (imgElement: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(imgElement, 0, 0, 120, 120);
    const imgData = ctx.getImageData(0, 0, 120, 120).data;

    // Simple color quantization / bucket sampling
    const sampled: string[] = [];
    const step = Math.floor(imgData.length / 24);

    for (let i = 0; i < imgData.length; i += step) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const hex = rgbToHex({ r, g, b });
      if (!sampled.includes(hex)) {
        sampled.push(hex);
      }
    }

    // Pick top 6 distinct colors
    setColors(sampled.slice(0, 6));
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setPreviewSrc(src);
      const img = new Image();
      img.onload = () => extractPaletteFromImg(img);
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleCopyPalette = () => {
    navigator.clipboard.writeText(JSON.stringify(colors, null, 2));
    setCopied(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden select-none">
      {/* Sidebar Controls */}
      <aside className="w-80 h-full border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <ImageIcon className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Palette Extractor
          </span>
        </div>

        {/* Upload Button */}
        <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 cursor-pointer transition-all bg-slate-50 dark:bg-slate-800/50">
          <Upload className="w-6 h-6 text-indigo-500" />
          <span className="font-semibold">Drop photo here or browse</span>
          <span className="text-[10px] text-slate-400">Supports PNG, JPG, WebP</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>

        {previewSrc && (
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-36">
            <img src={previewSrc} alt="Uploaded sample" className="w-full h-full object-cover" />
          </div>
        )}

        <button
          type="button"
          onClick={handleCopyPalette}
          className="w-full mt-auto py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied Hex Codes!' : 'Copy Palette JSON'}</span>
        </button>
      </aside>

      {/* Preview */}
      <main className="flex-1 canvas-grid-bg flex items-center justify-center p-8 overflow-hidden">
        <div className="w-full max-w-4xl h-[65vh] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row">
          {colors.map((hex, idx) => (
            <div
              key={idx}
              className="flex-1 h-full flex flex-col justify-end p-6 transition-all duration-300 relative group"
              style={{ backgroundColor: hex }}
            >
              <div className="bg-black/40 backdrop-blur-md p-3 rounded-xl text-white">
                <span className="text-sm font-mono font-bold">{hex.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
