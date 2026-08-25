import React, { useState, useRef, useEffect } from 'react';
import { Download, Pencil, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SliderControl } from '../../components/controls/SliderControl';

export const DoodleStudio: React.FC = () => {
  const [doodleCount, setDoodleCount] = useState<number>(60);
  const [size, setSize] = useState<number>(30);
  const [strokeWidth, setStrokeWidth] = useState<number>(2.5);
  const [doodleColor, setDoodleColor] = useState<string>('#4F46E5');
  const [bgColor, setBgColor] = useState<string>('#FAF5FF');
  const [seed, setSeed] = useState<number>(123);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawDoodles = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = doodleColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let s = seed;
    const random = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    for (let i = 0; i < doodleCount; i++) {
      const x = random() * (width - size * 2) + size;
      const y = random() * (height - size * 2) + size;
      const rot = random() * Math.PI * 2;
      const type = Math.floor(random() * 5);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);

      ctx.beginPath();
      if (type === 0) {
        // 4-point Sparkle star
        ctx.moveTo(0, -size);
        ctx.quadraticCurveTo(0, 0, size, 0);
        ctx.quadraticCurveTo(0, 0, 0, size);
        ctx.quadraticCurveTo(0, 0, -size, 0);
        ctx.quadraticCurveTo(0, 0, 0, -size);
      } else if (type === 1) {
        // Squiggle wave
        ctx.moveTo(-size, 0);
        ctx.bezierCurveTo(-size * 0.5, -size * 0.6, 0, size * 0.6, size * 0.5, -size * 0.6);
        ctx.lineTo(size, 0);
      } else if (type === 2) {
        // Cross / Plus
        ctx.moveTo(-size * 0.7, 0);
        ctx.lineTo(size * 0.7, 0);
        ctx.moveTo(0, -size * 0.7);
        ctx.lineTo(0, size * 0.7);
      } else if (type === 3) {
        // Geometric triangle
        ctx.moveTo(0, -size * 0.8);
        ctx.lineTo(size * 0.8, size * 0.8);
        ctx.lineTo(-size * 0.8, size * 0.8);
        ctx.closePath();
      } else {
        // Circle / Dot ring
        ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
      }

      ctx.stroke();
      ctx.restore();
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    drawDoodles(ctx, canvasRef.current.width, canvasRef.current.height);
  }, [doodleCount, size, strokeWidth, doodleColor, bgColor, seed]);

  const handleDownload = () => {
    const out = document.createElement('canvas');
    out.width = 2400;
    out.height = 1600;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    drawDoodles(ctx, out.width, out.height);

    const a = document.createElement('a');
    a.download = `doodle-scatter-${Date.now()}.png`;
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
            <Pencil className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Doodle Scatter Settings
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

        {/* Colors */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Doodle Color</span>
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <input
                type="color"
                value={doodleColor}
                onChange={(e) => setDoodleColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <span className="text-xs font-mono">{doodleColor.toUpperCase()}</span>
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
          label="Doodle Count"
          value={doodleCount}
          min={10}
          max={150}
          step={5}
          onChange={setDoodleCount}
        />

        <SliderControl
          label="Doodle Size"
          value={size}
          min={12}
          max={60}
          step={2}
          unit="px"
          onChange={setSize}
        />

        <SliderControl
          label="Stroke Weight"
          value={strokeWidth}
          min={1.0}
          max={8.0}
          step={0.5}
          unit="px"
          onChange={setStrokeWidth}
        />

        <button
          type="button"
          onClick={handleDownload}
          className="w-full mt-auto py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Doodle PNG</span>
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
