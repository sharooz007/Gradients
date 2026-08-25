import React, { useState, useRef, useEffect } from 'react';
import { Download, Disc } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SliderControl } from '../../components/controls/SliderControl';
import { ToggleSwitch } from '../../components/controls/ToggleSwitch';

export const DieterDotsStudio: React.FC = () => {
  const [holeRadius, setHoleRadius] = useState<number>(4);
  const [pitch, setPitch] = useState<number>(14);
  const [staggered, setStaggered] = useState<boolean>(true);
  const [metallicBevel, setMetallicBevel] = useState<boolean>(true);
  const [surfaceColor, setSurfaceColor] = useState<string>('#E5E5E5');
  const [holeColor, setHoleColor] = useState<string>('#1C1917');
  const [depth, setDepth] = useState<number>(0.7);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGrille = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Brushed / Matte surface
    ctx.fillStyle = surfaceColor;
    ctx.fillRect(0, 0, width, height);

    const rowHeight = staggered ? pitch * 0.866 : pitch;

    for (let y = pitch; y < height; y += rowHeight) {
      const rowIndex = Math.floor(y / rowHeight);
      const rowOffset = staggered && rowIndex % 2 === 1 ? pitch / 2 : 0;

      for (let x = pitch; x < width; x += pitch) {
        const posX = x + rowOffset;
        const posY = y;

        if (posX >= width - pitch) continue;

        if (metallicBevel) {
          // Inner shadow / bottom highlight (gives real drilled hole 3D effect)
          ctx.save();
          // Bevel highlight bottom-right
          ctx.beginPath();
          ctx.arc(posX, posY + 0.8, holeRadius + 0.6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fill();

          // Bevel shadow top-left
          ctx.beginPath();
          ctx.arc(posX, posY - 0.8, holeRadius + 0.6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.fill();

          // Deep hole center
          ctx.beginPath();
          ctx.arc(posX, posY, holeRadius, 0, Math.PI * 2);
          ctx.fillStyle = holeColor;
          ctx.fill();

          // Hole depth inner gradient
          const depthGrad = ctx.createLinearGradient(posX, posY - holeRadius, posX, posY + holeRadius);
          depthGrad.addColorStop(0, `rgba(0,0,0,${depth})`);
          depthGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = depthGrad;
          ctx.fill();

          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(posX, posY, holeRadius, 0, Math.PI * 2);
          ctx.fillStyle = holeColor;
          ctx.fill();
        }
      }
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    drawGrille(ctx, canvasRef.current.width, canvasRef.current.height);
  }, [holeRadius, pitch, staggered, metallicBevel, surfaceColor, holeColor, depth]);

  const handleDownload = () => {
    const out = document.createElement('canvas');
    out.width = 2400;
    out.height = 1600;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    drawGrille(ctx, out.width, out.height);

    const a = document.createElement('a');
    a.download = `dieter-rams-perforated-grille-${Date.now()}.png`;
    a.href = out.toDataURL('image/png');
    a.click();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none">
      {/* Sidebar Controls */}
      <aside className="w-80 h-full min-h-0 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 gap-4 overflow-y-auto custom-scrollbar pb-10">
        <div className="flex flex-col w-full min-h-max">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <Disc className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Braun Perforated Grille
          </span>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Surface Metal</span>
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <input
                type="color"
                value={surfaceColor}
                onChange={(e) => setSurfaceColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <span className="text-xs font-mono">{surfaceColor.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Hole Interior</span>
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <input
                type="color"
                value={holeColor}
                onChange={(e) => setHoleColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <span className="text-xs font-mono">{holeColor.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <SliderControl
          label="Hole Radius"
          value={holeRadius}
          min={1}
          max={16}
          step={0.5}
          unit="px"
          onChange={setHoleRadius}
        />

        <SliderControl
          label="Grid Pitch / Spacing"
          value={pitch}
          min={6}
          max={40}
          step={1}
          unit="px"
          onChange={setPitch}
        />

        <SliderControl
          label="Shadow Depth"
          value={depth}
          min={0.0}
          max={1.0}
          step={0.05}
          onChange={setDepth}
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Staggered Hex Grid</span>
          <ToggleSwitch size="sm" checked={staggered} onChange={setStaggered} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">3D Metallic Bevel</span>
          <ToggleSwitch size="sm" checked={metallicBevel} onChange={setMetallicBevel} />
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="w-full mt-auto py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Perforated PNG</span>
        </button>
      </div>
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
