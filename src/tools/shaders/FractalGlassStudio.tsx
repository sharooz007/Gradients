import React, { useState, useRef, useEffect } from 'react';
import { Download, Layers, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SliderControl } from '../../components/controls/SliderControl';
import { SegmentedPicker } from '../../components/controls/SegmentedPicker';

export const FractalGlassStudio: React.FC = () => {
  const [style, setStyle] = useState<'fluted' | 'frosted' | 'fractal'>('fluted');
  const [fluteCount, setFluteCount] = useState<number>(30);
  const [distortion, setDistortion] = useState<number>(0.5);
  const [specular, setSpecular] = useState<number>(0.7);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [customImg, setCustomImg] = useState<HTMLImageElement | null>(null);

  const drawGlass = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Background content (image or generative colorful gradient)
    if (customImg) {
      ctx.drawImage(customImg, 0, 0, width, height);
    } else {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#4338CA');
      grad.addColorStop(0.5, '#EC4899');
      grad.addColorStop(1, '#F59E0B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw some geometric shapes underneath to refract
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(width * 0.35, height * 0.4, 180, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#06B6D4';
      ctx.fillRect(width * 0.55, height * 0.25, 240, 240);
    }

    // Glass layer simulation
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const outputData = ctx.createImageData(width, height);
    const out = outputData.data;

    const fluteWidth = width / fluteCount;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        let offsetX = 0;
        let specularHighlight = 0;

        if (style === 'fluted' || style === 'fractal') {
          const normX = (x % fluteWidth) / fluteWidth;
          const normalX = Math.sin((normX - 0.5) * Math.PI);
          offsetX = Math.round(normalX * distortion * 40);
          specularHighlight = Math.pow(Math.max(0, 1 - Math.abs(normX - 0.5) * 2), 8) * specular * 100;
        } else {
          // Frosted noise
          offsetX = Math.round((Math.random() - 0.5) * distortion * 30);
        }

        const sampleX = Math.max(0, Math.min(width - 1, x + offsetX));
        const sampleIdx = (y * width + sampleX) * 4;

        out[idx] = Math.min(255, data[sampleIdx] + specularHighlight);
        out[idx + 1] = Math.min(255, data[sampleIdx + 1] + specularHighlight);
        out[idx + 2] = Math.min(255, data[sampleIdx + 2] + specularHighlight);
        out[idx + 3] = 255;
      }
    }

    ctx.putImageData(outputData, 0, 0);
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    drawGlass(ctx, canvasRef.current.width, canvasRef.current.height);
  }, [style, fluteCount, distortion, specular, customImg]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => setCustomImg(img);
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
    drawGlass(ctx, out.width, out.height);

    const a = document.createElement('a');
    a.download = `fluted-fractal-glass-${Date.now()}.png`;
    a.href = out.toDataURL('image/png');
    a.click();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none">
      {/* Sidebar Controls */}
      <aside className="w-80 h-full min-h-0 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <Layers className="w-4 h-4 text-cyan-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Glass Refraction Settings
          </span>
        </div>

        {/* Style Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Glass Texture Style
          </label>
          <SegmentedPicker<'fluted' | 'frosted' | 'fractal'>
            value={style}
            onChange={setStyle}
            options={[
              { value: 'fluted', label: 'Fluted' },
              { value: 'frosted', label: 'Frosted' },
              { value: 'fractal', label: 'Fractal' }
            ]}
          />
        </div>

        {/* Upload custom background */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Background Image
          </label>
          <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>{customImg ? 'Replace Image' : 'Upload Image to Refract'}</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        <SliderControl
          label="Flute Rib Count"
          value={fluteCount}
          min={8}
          max={80}
          step={2}
          onChange={setFluteCount}
        />

        <SliderControl
          label="Refraction Distortion"
          value={distortion}
          min={0.1}
          max={1.5}
          step={0.05}
          onChange={setDistortion}
        />

        <SliderControl
          label="Specular Rib Highlight"
          value={specular}
          min={0.0}
          max={1.0}
          step={0.05}
          onChange={setSpecular}
        />

        <button
          type="button"
          onClick={handleDownload}
          className="w-full mt-auto py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Glass Image (PNG)</span>
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
