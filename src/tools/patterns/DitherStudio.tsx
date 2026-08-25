import React, { useState, useRef, useEffect } from 'react';
import { Download, Cpu, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SliderControl } from '../../components/controls/SliderControl';
import { SegmentedPicker } from '../../components/controls/SegmentedPicker';

type DitherAlgorithm = 'bayer4' | 'bayer8' | 'floyd' | 'atkinson';

export const DitherStudio: React.FC = () => {
  const [algo, setAlgo] = useState<DitherAlgorithm>('bayer4');
  const [colorLevels, setColorLevels] = useState<number>(4);
  const [scale, setScale] = useState<number>(2);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);

  const applyDither = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const sw = Math.floor(width / scale);
    const sh = Math.floor(height / scale);

    const offCanvas = document.createElement('canvas');
    offCanvas.width = sw;
    offCanvas.height = sh;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    if (sourceImg) {
      offCtx.drawImage(sourceImg, 0, 0, sw, sh);
    } else {
      const grad = offCtx.createLinearGradient(0, 0, sw, sh);
      grad.addColorStop(0, '#111827');
      grad.addColorStop(0.5, '#6366F1');
      grad.addColorStop(1, '#EC4899');
      offCtx.fillStyle = grad;
      offCtx.fillRect(0, 0, sw, sh);

      offCtx.fillStyle = '#FFFFFF';
      offCtx.beginPath();
      offCtx.arc(sw / 2, sh / 2, sw * 0.25, 0, Math.PI * 2);
      offCtx.fill();
    }

    const imgData = offCtx.getImageData(0, 0, sw, sh);
    const data = imgData.data;

    const bayer4 = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5]
    ];

    if (algo === 'bayer4' || algo === 'bayer8') {
      for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
          const idx = (y * sw + x) * 4;
          const bVal = (bayer4[y % 4][x % 4] / 16 - 0.5) * (255 / colorLevels);

          for (let c = 0; c < 3; c++) {
            const val = data[idx + c] + bVal;
            const step = 255 / (colorLevels - 1);
            data[idx + c] = Math.round(val / step) * step;
          }
        }
      }
    } else if (algo === 'floyd' || algo === 'atkinson') {
      // Error diffusion
      for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
          const idx = (y * sw + x) * 4;
          for (let c = 0; c < 3; c++) {
            const oldVal = data[idx + c];
            const step = 255 / (colorLevels - 1);
            const newVal = Math.round(oldVal / step) * step;
            data[idx + c] = newVal;
            const err = oldVal - newVal;

            if (algo === 'floyd') {
              if (x + 1 < sw) data[(y * sw + x + 1) * 4 + c] += (err * 7) / 16;
              if (x - 1 >= 0 && y + 1 < sh) data[((y + 1) * sw + x - 1) * 4 + c] += (err * 3) / 16;
              if (y + 1 < sh) data[((y + 1) * sw + x) * 4 + c] += (err * 5) / 16;
              if (x + 1 < sw && y + 1 < sh) data[((y + 1) * sw + x + 1) * 4 + c] += (err * 1) / 16;
            } else {
              // Atkinson
              const e8 = err / 8;
              if (x + 1 < sw) data[(y * sw + x + 1) * 4 + c] += e8;
              if (x + 2 < sw) data[(y * sw + x + 2) * 4 + c] += e8;
              if (x - 1 >= 0 && y + 1 < sh) data[((y + 1) * sw + x - 1) * 4 + c] += e8;
              if (y + 1 < sh) data[((y + 1) * sw + x) * 4 + c] += e8;
              if (x + 1 < sw && y + 1 < sh) data[((y + 1) * sw + x + 1) * 4 + c] += e8;
              if (y + 2 < sh) data[((y + 2) * sw + x) * 4 + c] += e8;
            }
          }
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    // Scale back up crisp pixelated
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offCanvas, 0, 0, width, height);
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    applyDither(ctx, canvasRef.current.width, canvasRef.current.height);
  }, [algo, colorLevels, scale, sourceImg]);

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
    out.width = 1800;
    out.height = 1200;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    applyDither(ctx, out.width, out.height);

    const a = document.createElement('a');
    a.download = `dither-${algo}-${Date.now()}.png`;
    a.href = out.toDataURL('image/png');
    a.click();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none">
      {/* Sidebar Controls */}
      <aside className="w-80 h-full min-h-0 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <Cpu className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Dithering Studio
          </span>
        </div>

        {/* Upload source photo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Source Image
          </label>
          <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>{sourceImg ? 'Change Image' : 'Upload Image to Dither'}</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        {/* Algorithm selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Algorithm
          </label>
          <SegmentedPicker<DitherAlgorithm>
            value={algo}
            onChange={setAlgo}
            options={[
              { value: 'bayer4', label: 'Bayer 4x4' },
              { value: 'floyd', label: 'Floyd-St.' },
              { value: 'atkinson', label: 'Atkinson' }
            ]}
          />
        </div>

        <SliderControl
          label="Color Quantization Levels"
          value={colorLevels}
          min={2}
          max={16}
          step={1}
          onChange={setColorLevels}
        />

        <SliderControl
          label="Pixel Block Scale"
          value={scale}
          min={1}
          max={6}
          step={1}
          unit="x"
          onChange={setScale}
        />

        <button
          type="button"
          onClick={handleDownload}
          className="w-full mt-auto py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Dithered PNG</span>
        </button>
      </aside>

      {/* Preview */}
      <main className="flex-1 canvas-grid-bg flex items-center justify-center p-8 overflow-hidden">
        <div className="w-full max-w-4xl h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
          <canvas ref={canvasRef} width={1200} height={800} className="w-full h-full object-contain" />
        </div>
      </main>
    </div>
  );
};
