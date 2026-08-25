import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, Sliders } from 'lucide-react';
import confetti from 'canvas-confetti';

export const FilmGrainStudio: React.FC = () => {
  const [intensity, setIntensity] = useState<number>(40);
  const [grainScale, setGrainScale] = useState<number>(2);
  const [isMonochrome, setIsMonochrome] = useState<boolean>(true);
  const [blendMode] = useState<'overlay' | 'soft-light' | 'screen' | 'multiply'>('overlay');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render Film Grain Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    const applyGrain = () => {
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;
      const amount = (intensity / 100) * 128;

      for (let y = 0; y < h; y += grainScale) {
        for (let x = 0; x < w; x += grainScale) {
          const noiseR = (Math.random() - 0.5) * amount;
          const noiseG = isMonochrome ? noiseR : (Math.random() - 0.5) * amount;
          const noiseB = isMonochrome ? noiseR : (Math.random() - 0.5) * amount;

          for (let dy = 0; dy < grainScale && y + dy < h; dy++) {
            for (let dx = 0; dx < grainScale && x + dx < w; dx++) {
              const idx = ((y + dy) * w + (x + dx)) * 4;

              // Apply grain modification with blend calculations
              d[idx] = Math.min(255, Math.max(0, d[idx] + noiseR));
              d[idx + 1] = Math.min(255, Math.max(0, d[idx + 1] + noiseG));
              d[idx + 2] = Math.min(255, Math.max(0, d[idx + 2] + noiseB));
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
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
      // Default dramatic cinematic gradient photo
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.5, '#db2777');
      grad.addColorStop(1, '#4f46e5');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      applyGrain();
    }
  }, [intensity, grainScale, isMonochrome, blendMode, uploadedImage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `film-grain-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    confetti({ particleCount: 30, spread: 45 });
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#f5f5f7]">
      {/* Left Control Sidebar */}
      <aside className="w-80 h-full max-h-full shrink-0 border-r border-[#e5e5ea] bg-white overflow-y-auto overflow-x-hidden flex flex-col z-20 custom-scrollbar overscroll-contain">
        <div className="flex items-center justify-between p-4 border-b border-[#e5e5ea]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#0071e3]" />
            <span className="text-xs font-semibold text-[#1d1d1f]">
              Film Grain Studio
            </span>
          </div>
        </div>

        {/* Grain Intensity & Scale Controls */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Grain Intensity</span>
              <span className="font-mono text-[#1d1d1f]">{intensity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Grain Roughness (Pixel Size)</span>
              <span className="font-mono text-[#1d1d1f]">{grainScale}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={grainScale}
              onChange={(e) => setGrainScale(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#1d1d1f]">Monochrome Grain</span>
            <input
              type="checkbox"
              checked={isMonochrome}
              onChange={(e) => setIsMonochrome(e.target.checked)}
              className="w-4 h-4 text-[#0071e3]"
            />
          </div>
        </div>

        {/* Photo Upload */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-2.5">
          <span className="text-xs font-medium text-[#1d1d1f]">Source Image</span>
          <label className="apple-btn apple-btn-secondary gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploadedImage ? 'Replace Photo' : 'Upload Image for Grain'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Export Action */}
        <div className="mt-auto p-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={exportPng}
            className="apple-btn apple-btn-primary gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Grain Image</span>
          </button>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="relative flex-1 h-full apple-grid-bg flex items-center justify-center p-8 overflow-hidden select-none">
        <div className="relative w-[720px] h-[480px] rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#000000]/10 bg-slate-950">
          <canvas
            ref={canvasRef}
            width={1440}
            height={960}
            className="w-full h-full object-cover"
          />
        </div>
      </main>
    </div>
  );
};
