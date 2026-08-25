import React, { useState, useRef, useEffect } from 'react';
import { Download, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SliderControl } from '../../components/controls/SliderControl';
import { ColorPickerGroup } from '../../components/controls/ColorPickerGroup';

interface WallpaperPreset {
  name: string;
  colors: string[];
  curvature: number;
  thickness: number;
  metalness: number;
  glow: number;
}

const APPLE_PRESETS: WallpaperPreset[] = [
  {
    name: 'Sonoma Gold',
    colors: ['#2A1810', '#854D0E', '#EAB308', '#FEF08A'],
    curvature: 1.8,
    thickness: 1.2,
    metalness: 0.85,
    glow: 0.4
  },
  {
    name: 'iOS 15 Iridescent',
    colors: ['#030712', '#4338CA', '#818CF8', '#F472B6'],
    curvature: 2.2,
    thickness: 1.5,
    metalness: 0.9,
    glow: 0.6
  },
  {
    name: 'Deep Purple Titanium',
    colors: ['#090514', '#3B0764', '#9333EA', '#E9D5FF'],
    curvature: 1.5,
    thickness: 1.0,
    metalness: 0.8,
    glow: 0.5
  },
  {
    name: 'Pacific Blue Chrome',
    colors: ['#02162E', '#0369A1', '#38BDF8', '#E0F2FE'],
    curvature: 2.0,
    thickness: 1.4,
    metalness: 0.92,
    glow: 0.55
  }
];

export const AppleWallpaperStudio: React.FC = () => {
  const [colors, setColors] = useState<string[]>(APPLE_PRESETS[1].colors);
  const [curvature, setCurvature] = useState<number>(2.2);
  const [thickness, setThickness] = useState<number>(1.5);
  const [metalness, setMetalness] = useState<number>(0.9);
  const [glow, setGlow] = useState<number>(0.6);
  const [aspect, setAspect] = useState<'iphone' | 'ipad' | 'mac'>('iphone');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawWallpaper = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, colors[0]);
    bgGrad.addColorStop(1, colors[1] || colors[0]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Draw multi-layered ribbon curves
    const cx = width / 2;
    const cy = height / 2;

    for (let r = 0; r < 5; r++) {
      ctx.save();
      ctx.beginPath();
      
      const waveOffset = (r - 2) * 120 * thickness;
      ctx.moveTo(0, cy + waveOffset);

      ctx.bezierCurveTo(
        cx * 0.4,
        cy - 300 * curvature + waveOffset,
        cx * 1.6,
        cy + 400 * curvature + waveOffset,
        width,
        cy - 200 + waveOffset
      );

      ctx.lineWidth = 140 * thickness * (1 - r * 0.15);
      
      const grad = ctx.createLinearGradient(0, cy - 200, width, cy + 200);
      colors.forEach((col, idx) => {
        grad.addColorStop(idx / (colors.length - 1), col);
      });

      ctx.strokeStyle = grad;
      ctx.globalAlpha = 0.85 - r * 0.12;
      ctx.shadowColor = colors[colors.length - 1];
      ctx.shadowBlur = glow * 80;
      ctx.stroke();
      ctx.restore();
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawWallpaper(ctx, canvas.width, canvas.height);
  }, [colors, curvature, thickness, metalness, glow, aspect]);

  const handleDownload = () => {
    const outCanvas = document.createElement('canvas');
    outCanvas.width = aspect === 'iphone' ? 1290 : aspect === 'ipad' ? 2048 : 3840;
    outCanvas.height = aspect === 'iphone' ? 2796 : aspect === 'ipad' ? 2732 : 2160;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) return;

    drawWallpaper(ctx, outCanvas.width, outCanvas.height);

    const a = document.createElement('a');
    a.download = `apple-iridescent-wallpaper-${aspect}-${Date.now()}.png`;
    a.href = outCanvas.toDataURL('image/png');
    a.click();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden select-none">
      {/* Sidebar Controls */}
      <aside className="w-80 h-full border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <Smartphone className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Apple Wallpaper Controls
          </span>
        </div>

        {/* Presets */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Curated Styles
          </label>
          <div className="grid grid-cols-2 gap-2">
            {APPLE_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setColors(p.colors);
                  setCurvature(p.curvature);
                  setThickness(p.thickness);
                  setMetalness(p.metalness);
                  setGlow(p.glow);
                }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-left hover:border-indigo-500 transition-all cursor-pointer"
              >
                <div className="h-6 rounded-md mb-1" style={{ background: `linear-gradient(45deg, ${p.colors.join(', ')})` }} />
                <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <ColorPickerGroup
          colors={colors}
          onChange={setColors}
          onShuffle={() => setColors(APPLE_PRESETS[Math.floor(Math.random() * APPLE_PRESETS.length)].colors)}
        />

        {/* Parameters */}
        <SliderControl
          label="Ribbon Curvature"
          value={curvature}
          min={0.5}
          max={4.0}
          step={0.1}
          onChange={setCurvature}
        />

        <SliderControl
          label="Ribbon Thickness"
          value={thickness}
          min={0.5}
          max={3.0}
          step={0.1}
          onChange={setThickness}
        />

        <SliderControl
          label="Specular Glow"
          value={glow}
          min={0.0}
          max={1.0}
          step={0.05}
          onChange={setGlow}
        />

        {/* Device Aspect */}
        <div className="flex flex-col gap-1.5 pt-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Target Device
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'iphone', label: 'iPhone' },
              { id: 'ipad', label: 'iPad' },
              { id: 'mac', label: 'MacBook' }
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setAspect(d.id as any)}
                className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all ${
                  aspect === d.id
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="w-full mt-auto py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export 4K Wallpaper</span>
        </button>
      </aside>

      {/* Preview */}
      <main className="flex-1 canvas-grid-bg flex items-center justify-center p-8 overflow-hidden">
        <div
          className={`relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 transition-all duration-300 ${
            aspect === 'iphone'
              ? 'w-72 h-[560px]'
              : aspect === 'ipad'
              ? 'w-96 h-[560px]'
              : 'w-[680px] h-[400px]'
          }`}
        >
          <canvas ref={canvasRef} width={800} height={1200} className="w-full h-full object-cover" />
        </div>
      </main>
    </div>
  );
};
