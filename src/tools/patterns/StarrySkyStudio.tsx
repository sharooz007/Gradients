import React, { useState, useRef, useEffect } from 'react';
import { Download, Stars, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SliderControl } from '../../components/controls/SliderControl';
import { ToggleSwitch } from '../../components/controls/ToggleSwitch';

export const StarrySkyStudio: React.FC = () => {
  const [starCount, setStarCount] = useState<number>(350);
  const [nebulaIntensity, setNebulaIntensity] = useState<number>(0.6);
  const [nebulaColor1, setNebulaColor1] = useState<string>('#6366F1');
  const [nebulaColor2, setNebulaColor2] = useState<string>('#EC4899');
  const [constellations, setConstellations] = useState<boolean>(true);
  const [twinkle, setTwinkle] = useState<boolean>(true);
  const [seed, setSeed] = useState<number>(42);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawSpace = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number = 0) => {
    // Deep black/navy space
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    // Glowing Nebula clouds
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const neb1 = ctx.createRadialGradient(width * 0.35, height * 0.45, 20, width * 0.35, height * 0.45, width * 0.4);
    neb1.addColorStop(0, `${nebulaColor1}99`);
    neb1.addColorStop(0.6, `${nebulaColor1}33`);
    neb1.addColorStop(1, 'transparent');
    ctx.fillStyle = neb1;
    ctx.globalAlpha = nebulaIntensity;
    ctx.fillRect(0, 0, width, height);

    const neb2 = ctx.createRadialGradient(width * 0.7, height * 0.6, 20, width * 0.7, height * 0.6, width * 0.45);
    neb2.addColorStop(0, `${nebulaColor2}99`);
    neb2.addColorStop(0.6, `${nebulaColor2}33`);
    neb2.addColorStop(1, 'transparent');
    ctx.fillStyle = neb2;
    ctx.globalAlpha = nebulaIntensity;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();

    // Stars generation with pseudorandom seed
    const starsList: { x: number; y: number; r: number; alpha: number }[] = [];

    let s = seed;
    const random = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    for (let i = 0; i < starCount; i++) {
      const x = random() * width;
      const y = random() * height;
      const r = random() * 1.8 + 0.3;
      const baseAlpha = random() * 0.7 + 0.3;
      const alpha = twinkle ? baseAlpha * (0.6 + 0.4 * Math.sin(time * 2 + i)) : baseAlpha;

      starsList.push({ x, y, r, alpha });

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = Math.max(0.1, Math.min(1.0, alpha));
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = r > 1.5 ? 8 : 0;
      ctx.fill();
      ctx.restore();
    }

    // Constellations (connect nearby bright stars)
    if (constellations) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 0.8;

      const majorStars = starsList.filter((st) => st.r > 1.4);
      for (let i = 0; i < majorStars.length; i++) {
        for (let j = i + 1; j < majorStars.length; j++) {
          const dx = majorStars[i].x - majorStars[j].x;
          const dy = majorStars[i].y - majorStars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(majorStars[i].x, majorStars[i].y);
            ctx.lineTo(majorStars[j].x, majorStars[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }
  };

  useEffect(() => {
    let animId: number;
    let startTime = performance.now();

    const loop = (now: number) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      const t = (now - startTime) / 1000;
      drawSpace(ctx, canvasRef.current.width, canvasRef.current.height, t);
      if (twinkle) {
        animId = requestAnimationFrame(loop);
      }
    };

    if (twinkle) {
      animId = requestAnimationFrame(loop);
    } else {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) drawSpace(ctx, canvasRef.current.width, canvasRef.current.height, 0);
      }
    }

    return () => cancelAnimationFrame(animId);
  }, [starCount, nebulaIntensity, nebulaColor1, nebulaColor2, constellations, twinkle, seed]);

  const handleDownload = () => {
    const out = document.createElement('canvas');
    out.width = 3840;
    out.height = 2160;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    drawSpace(ctx, out.width, out.height, 0);

    const a = document.createElement('a');
    a.download = `starry-sky-nebula-${Date.now()}.png`;
    a.href = out.toDataURL('image/png');
    a.click();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none">
      {/* Sidebar Controls */}
      <aside className="w-80 h-full min-h-0 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Stars className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Cosmic Sky Controls
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSeed(Math.random() * 10000)}
            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reseed</span>
          </button>
        </div>

        {/* Nebula Colors */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-slate-500">Nebula Primary</span>
            <input
              type="color"
              value={nebulaColor1}
              onChange={(e) => setNebulaColor1(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-slate-500">Nebula Secondary</span>
            <input
              type="color"
              value={nebulaColor2}
              onChange={(e) => setNebulaColor2(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer border-0 bg-transparent"
            />
          </div>
        </div>

        <SliderControl
          label="Star Count"
          value={starCount}
          min={50}
          max={1000}
          step={25}
          onChange={setStarCount}
        />

        <SliderControl
          label="Nebula Glow Intensity"
          value={nebulaIntensity}
          min={0.0}
          max={1.0}
          step={0.05}
          onChange={setNebulaIntensity}
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Constellation Lines</span>
          <ToggleSwitch size="sm" checked={constellations} onChange={setConstellations} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Live Star Twinkle</span>
          <ToggleSwitch size="sm" checked={twinkle} onChange={setTwinkle} />
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="w-full mt-auto py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export 4K Space PNG</span>
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
