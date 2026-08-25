import React, { useState, useRef, useEffect } from 'react';
import { Download, CircleDot, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SliderControl } from '../../components/controls/SliderControl';
import { SegmentedPicker } from '../../components/controls/SegmentedPicker';

export const HalftoneStudio: React.FC = () => {
  const [dotSize, setDotSize] = useState<number>(14);
  const [spacing, setSpacing] = useState<number>(20);
  const [angle, setAngle] = useState<number>(45);
  const [shape, setShape] = useState<'circle' | 'square' | 'diamond'>('circle');
  const [dotColor, setDotColor] = useState<string>('#111827');
  const [bgColor, setBgColor] = useState<string>('#F3F4F6');
  const [contrast, setContrast] = useState<number>(1.2);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);

  const drawHalftone = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Create temporary offscreen sampling canvas
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = width;
    sampleCanvas.height = height;
    const sCtx = sampleCanvas.getContext('2d');
    if (!sCtx) return;

    if (sourceImg) {
      sCtx.drawImage(sourceImg, 0, 0, width, height);
    } else {
      // Default radial procedural gradient
      const grad = sCtx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.45);
      grad.addColorStop(0, '#000000');
      grad.addColorStop(1, '#FFFFFF');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, width, height);
    }

    const imgData = sCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    ctx.fillStyle = dotColor;

    for (let y = 0; y < height; y += spacing) {
      for (let x = 0; x < width; x += spacing) {
        // Sample luminance at x, y
        const idx = (Math.min(height - 1, Math.floor(y)) * width + Math.min(width - 1, Math.floor(x))) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const darkness = Math.pow(1.0 - luma, contrast);

        const currentRadius = (dotSize / 2) * darkness;

        if (currentRadius > 0.5) {
          ctx.beginPath();
          if (shape === 'circle') {
            ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
          } else if (shape === 'square') {
            ctx.rect(x - currentRadius, y - currentRadius, currentRadius * 2, currentRadius * 2);
          } else {
            // Diamond
            ctx.moveTo(x, y - currentRadius * 1.2);
            ctx.lineTo(x + currentRadius * 1.2, y);
            ctx.lineTo(x, y + currentRadius * 1.2);
            ctx.lineTo(x - currentRadius * 1.2, y);
            ctx.closePath();
          }
          ctx.fill();
        }
      }
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    drawHalftone(ctx, canvasRef.current.width, canvasRef.current.height);
  }, [dotSize, spacing, angle, shape, dotColor, bgColor, contrast, sourceImg]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => setSourceImg(img);
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    const out = document.createElement('canvas');
    out.width = 2400;
    out.height = 1600;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    drawHalftone(ctx, out.width, out.height);

    const a = document.createElement('a');
    a.download = `halftone-matrix-${Date.now()}.png`;
    a.href = out.toDataURL('image/png');
    a.click();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none">
      {/* Sidebar Controls */}
      <aside className="w-80 h-full min-h-0 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <CircleDot className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Halftone Matrix Settings
          </span>
        </div>

        {/* Upload source photo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Source Photo (Optional)
          </label>
          <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>{sourceImg ? 'Change Photo' : 'Upload Image for Halftone'}</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        {/* Dot Shape */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Dot Shape
          </label>
          <SegmentedPicker<'circle' | 'square' | 'diamond'>
            value={shape}
            onChange={setShape}
            options={[
              { value: 'circle', label: 'Circle' },
              { value: 'square', label: 'Square' },
              { value: 'diamond', label: 'Diamond' }
            ]}
          />
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Dot Color</span>
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <input
                type="color"
                value={dotColor}
                onChange={(e) => setDotColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <span className="text-xs font-mono">{dotColor.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Background</span>
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <span className="text-xs font-mono">{bgColor.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <SliderControl
          label="Dot Diameter"
          value={dotSize}
          min={4}
          max={40}
          step={1}
          unit="px"
          onChange={setDotSize}
        />

        <SliderControl
          label="Grid Spacing"
          value={spacing}
          min={8}
          max={50}
          step={1}
          unit="px"
          onChange={setSpacing}
        />

        <SliderControl
          label="Screen Angle"
          value={angle}
          min={0}
          max={90}
          step={5}
          isAngle={true}
          onChange={setAngle}
        />

        <SliderControl
          label="Dot Contrast"
          value={contrast}
          min={0.5}
          max={2.5}
          step={0.1}
          onChange={setContrast}
        />

        <button
          type="button"
          onClick={handleDownload}
          className="w-full mt-auto py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Halftone PNG</span>
        </button>
      </aside>

      {/* Preview */}
      <main className="flex-1 canvas-grid-bg flex items-center justify-center p-8 overflow-hidden">
        <div className="w-full max-w-4xl h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
          <canvas ref={canvasRef} width={1200} height={800} className="w-full h-full object-cover" />
        </div>
      </main>
    </div>
  );
};
