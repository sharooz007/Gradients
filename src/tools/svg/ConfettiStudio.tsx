import React, { useState, useRef, useEffect } from 'react';
import { Download, PartyPopper, RefreshCw, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SliderControl } from '../../components/controls/SliderControl';
import { ToggleSwitch } from '../../components/controls/ToggleSwitch';

export const ConfettiStudio: React.FC = () => {
  const [particleCount, setParticleCount] = useState<number>(120);
  const [colors, setColors] = useState<string[]>(['#FF5964', '#FFE74C', '#6BF178', '#35A7FF', '#9B5DE5']);
  const [spread, setSpread] = useState<number>(70);
  const gravity = 1.0;
  const [hasRibbons, setHasRibbons] = useState<boolean>(true);
  const [seed, setSeed] = useState<number>(77);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const triggerConfettiBlast = () => {
    confetti({
      particleCount: particleCount,
      spread: spread,
      origin: { y: 0.6 },
      colors: colors,
      gravity: gravity
    });
  };

  const drawConfettiStatic = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    let s = seed;
    const random = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    for (let i = 0; i < particleCount; i++) {
      const x = random() * width;
      const y = random() * height;
      const col = colors[Math.floor(random() * colors.length)];
      const rot = random() * Math.PI * 2;
      const size = random() * 12 + 6;
      const isRibbon = hasRibbons && random() > 0.6;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.fillStyle = col;

      if (isRibbon) {
        // Curved ribbon ribbon
        ctx.beginPath();
        ctx.moveTo(-size, 0);
        ctx.quadraticCurveTo(0, -size * 0.8, size, 0);
        ctx.quadraticCurveTo(0, size * 0.8, -size, 0);
        ctx.fill();
      } else {
        // Rectangle confetti flake
        ctx.fillRect(-size / 2, -size / 4, size, size / 2);
      }

      ctx.restore();
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    drawConfettiStatic(ctx, canvasRef.current.width, canvasRef.current.height);
  }, [particleCount, colors, spread, gravity, hasRibbons, seed]);

  const handleDownload = () => {
    const out = document.createElement('canvas');
    out.width = 2400;
    out.height = 1600;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    drawConfettiStatic(ctx, out.width, out.height);

    const a = document.createElement('a');
    a.download = `confetti-blast-${Date.now()}.png`;
    a.href = out.toDataURL('image/png');
    a.click();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden select-none">
      {/* Sidebar Controls */}
      <aside className="w-80 h-full border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <PartyPopper className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Confetti Settings
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSeed(Math.random() * 10000)}
            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Shuffle</span>
          </button>
        </div>

        {/* Confetti Palette */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Confetti Palette
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {colors.map((col, i) => (
              <input
                key={i}
                type="color"
                value={col}
                onChange={(e) => {
                  const next = [...colors];
                  next[i] = e.target.value;
                  setColors(next);
                }}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
              />
            ))}
          </div>
        </div>

        <SliderControl
          label="Particle Count"
          value={particleCount}
          min={30}
          max={300}
          step={10}
          onChange={setParticleCount}
        />

        <SliderControl
          label="Explosion Spread"
          value={spread}
          min={30}
          max={120}
          step={5}
          isAngle={true}
          onChange={setSpread}
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Curved Ribbons</span>
          <ToggleSwitch size="sm" checked={hasRibbons} onChange={setHasRibbons} />
        </div>

        {/* Live Blast Trigger */}
        <button
          type="button"
          onClick={triggerConfettiBlast}
          className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Fire Confetti Cannon!</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="w-full mt-auto py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Confetti PNG</span>
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
