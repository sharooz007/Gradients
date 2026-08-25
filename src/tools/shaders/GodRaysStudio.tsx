import React, { useState, useRef, useEffect } from 'react';
import { Download, Sun } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SliderControl } from '../../components/controls/SliderControl';

export const GodRaysStudio: React.FC = () => {
  const [rayCount, setRayCount] = useState<number>(36);
  const [decay, setDecay] = useState<number>(0.92);
  const [exposure, setExposure] = useState<number>(1.2);
  const [originX, setOriginX] = useState<number>(0.5);
  const [originY, setOriginY] = useState<number>(0.2);
  const [rayColor, setRayColor] = useState<string>('#FFD166');
  const [bgColor, setBgColor] = useState<string>('#0B091A');
  const [particles, setParticles] = useState<number>(80);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGodRays = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const ox = width * originX;
    const oy = height * originY;

    // Draw central light sun flare
    const flareGrad = ctx.createRadialGradient(ox, oy, 10, ox, oy, width * 0.4);
    flareGrad.addColorStop(0, '#FFFFFF');
    flareGrad.addColorStop(0.3, rayColor);
    flareGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = flareGrad;
    ctx.beginPath();
    ctx.arc(ox, oy, width * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Draw volumetric rays
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const maxDist = Math.max(width, height) * 1.5;

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const spread = (Math.PI * 2) / rayCount;

      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + Math.cos(angle - spread * 0.3) * maxDist, oy + Math.sin(angle - spread * 0.3) * maxDist);
      ctx.lineTo(ox + Math.cos(angle + spread * 0.3) * maxDist, oy + Math.sin(angle + spread * 0.3) * maxDist);
      ctx.closePath();

      const rayGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, maxDist);
      rayGrad.addColorStop(0, `${rayColor}EE`);
      rayGrad.addColorStop(decay, `${rayColor}44`);
      rayGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = rayGrad;
      ctx.globalAlpha = (0.3 + (i % 3) * 0.2) * exposure;
      ctx.fill();
    }

    // Draw dust motes
    ctx.fillStyle = '#FFFFFF';
    for (let p = 0; p < particles; p++) {
      const px = (Math.sin(p * 99) * 0.5 + 0.5) * width;
      const py = (Math.cos(p * 33) * 0.5 + 0.5) * height;
      const size = (p % 4) + 1;
      ctx.globalAlpha = Math.sin(p) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawGodRays(ctx, canvas.width, canvas.height);
  }, [rayCount, decay, exposure, originX, originY, rayColor, bgColor, particles]);

  const handleDownload = () => {
    const out = document.createElement('canvas');
    out.width = 3840;
    out.height = 2160;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    drawGodRays(ctx, out.width, out.height);

    const a = document.createElement('a');
    a.download = `god-rays-volumetric-${Date.now()}.png`;
    a.href = out.toDataURL('image/png');
    a.click();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden select-none">
      {/* Sidebar Controls */}
      <aside className="w-80 h-full border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <Sun className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            God Rays Settings
          </span>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Ray Color</span>
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <input
                type="color"
                value={rayColor}
                onChange={(e) => setRayColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <span className="text-xs font-mono">{rayColor.toUpperCase()}</span>
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
          label="Ray Count"
          value={rayCount}
          min={12}
          max={96}
          step={2}
          onChange={setRayCount}
        />

        <SliderControl
          label="Light Exposure"
          value={exposure}
          min={0.2}
          max={3.0}
          step={0.1}
          onChange={setExposure}
        />

        <SliderControl
          label="Ray Decay Falloff"
          value={decay}
          min={0.5}
          max={0.99}
          step={0.01}
          onChange={setDecay}
        />

        <div className="grid grid-cols-2 gap-2">
          <SliderControl
            label="Origin X"
            value={originX}
            min={0.0}
            max={1.0}
            step={0.05}
            onChange={setOriginX}
          />
          <SliderControl
            label="Origin Y"
            value={originY}
            min={0.0}
            max={1.0}
            step={0.05}
            onChange={setOriginY}
          />
        </div>

        <SliderControl
          label="Dust Particles"
          value={particles}
          min={0}
          max={200}
          step={10}
          onChange={setParticles}
        />

        <button
          type="button"
          onClick={handleDownload}
          className="w-full mt-auto py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export 4K God Rays</span>
        </button>
      </aside>

      {/* Preview */}
      <main className="flex-1 canvas-grid-bg flex items-center justify-center p-8 overflow-hidden">
        <div className="w-full max-w-4xl h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
          <canvas ref={canvasRef} width={1920} height={1080} className="w-full h-full object-cover" />
        </div>
      </main>
    </div>
  );
};
