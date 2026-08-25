import React, { useState, useRef, useEffect } from 'react';
import { Download, Box } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SliderControl } from '../../components/controls/SliderControl';
import { ToggleSwitch } from '../../components/controls/ToggleSwitch';

export const PerspectiveGridStudio: React.FC = () => {
  const [gridColor, setGridColor] = useState<string>('#EC4899');
  const [horizonColor, setHorizonColor] = useState<string>('#6366F1');
  const [bgColor, setBgColor] = useState<string>('#09021F');
  const [horizonHeight, setHorizonHeight] = useState<number>(0.45);
  const [density, setDensity] = useState<number>(24);
  const [lineWidth, setLineWidth] = useState<number>(2);
  const [glow, setGlow] = useState<number>(0.8);
  const [animate, setAnimate] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.5);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offsetRef = useRef<number>(0);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Sky / Ground background
    const horizonY = height * horizonHeight;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, bgColor);
    skyGrad.addColorStop(1, '#1A0B2E');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);

    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    groundGrad.addColorStop(0, '#0F051D');
    groundGrad.addColorStop(1, bgColor);
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // Glowing horizon line
    ctx.save();
    ctx.strokeStyle = horizonColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = horizonColor;
    ctx.shadowBlur = glow * 30;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(width, horizonY);
    ctx.stroke();

    // Perspective lines (Vertical radiating from vanishing point)
    const vpX = width / 2;
    const vpY = horizonY;

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = lineWidth;
    ctx.shadowColor = gridColor;
    ctx.shadowBlur = glow * 20;

    for (let i = -density; i <= density; i++) {
      const bottomX = vpX + (i * (width / density)) * 3;
      ctx.beginPath();
      ctx.moveTo(vpX, vpY);
      ctx.lineTo(bottomX, height);
      ctx.stroke();
    }

    // Horizontal receding lines (Hyperbolic distance)
    const groundHeight = height - horizonY;
    const numHoriz = 18;

    for (let j = 0; j < numHoriz; j++) {
      const progress = ((j + (offsetRef.current % 1)) / numHoriz);
      const curve = Math.pow(progress, 2.8);
      const lineY = horizonY + curve * groundHeight;

      if (lineY > horizonY) {
        ctx.globalAlpha = Math.min(1.0, progress * 1.5);
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(width, lineY);
        ctx.stroke();
      }
    }

    ctx.restore();
  };

  useEffect(() => {
    let animId: number;
    const render = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      if (animate) {
        offsetRef.current += 0.015 * speed;
      }
      drawGrid(ctx, canvasRef.current.width, canvasRef.current.height);
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [gridColor, horizonColor, bgColor, horizonHeight, density, lineWidth, glow, animate, speed]);

  const handleDownload = () => {
    const out = document.createElement('canvas');
    out.width = 3840;
    out.height = 2160;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    drawGrid(ctx, out.width, out.height);

    const a = document.createElement('a');
    a.download = `perspective-3d-grid-${Date.now()}.png`;
    a.href = out.toDataURL('image/png');
    a.click();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none">
      {/* Sidebar Controls */}
      <aside className="w-80 h-full min-h-0 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <Box className="w-4 h-4 text-pink-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            3D Grid Controls
          </span>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-slate-500">Grid Line</span>
            <input
              type="color"
              value={gridColor}
              onChange={(e) => setGridColor(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-slate-500">Horizon</span>
            <input
              type="color"
              value={horizonColor}
              onChange={(e) => setHorizonColor(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-slate-500">Background</span>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer border-0 bg-transparent"
            />
          </div>
        </div>

        <SliderControl
          label="Horizon Position"
          value={horizonHeight}
          min={0.2}
          max={0.8}
          step={0.02}
          onChange={setHorizonHeight}
        />

        <SliderControl
          label="Grid Density"
          value={density}
          min={8}
          max={48}
          step={2}
          onChange={setDensity}
        />

        <SliderControl
          label="Line Thickness"
          value={lineWidth}
          min={1}
          max={6}
          step={0.5}
          unit="px"
          onChange={setLineWidth}
        />

        <SliderControl
          label="Neon Glow Blur"
          value={glow}
          min={0.0}
          max={1.5}
          step={0.05}
          onChange={setGlow}
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Animate Velocity</span>
          <ToggleSwitch size="sm" checked={animate} onChange={setAnimate} />
        </div>

        {animate && (
          <SliderControl
            label="Flight Speed"
            value={speed}
            min={0.2}
            max={5.0}
            step={0.1}
            onChange={setSpeed}
          />
        )}

        <button
          type="button"
          onClick={handleDownload}
          className="w-full mt-auto py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export 4K Synthwave Grid</span>
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
