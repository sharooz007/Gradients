import React, { useState, useRef, useEffect } from 'react';
import { Download, LayoutGrid } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SliderControl } from '../../components/controls/SliderControl';
import { ToggleSwitch } from '../../components/controls/ToggleSwitch';
import { SegmentedPicker } from '../../components/controls/SegmentedPicker';

export const GridBackgroundStudio: React.FC = () => {
  const [style, setStyle] = useState<'blueprint' | 'graph' | 'dotgrid'>('blueprint');
  const [majorSize, setMajorSize] = useState<number>(100);
  const [subdivisions, setSubdivisions] = useState<number>(5);
  const [majorColor, setMajorColor] = useState<string>('#3B82F6');
  const [minorColor, setMinorColor] = useState<string>('#1E3A8A');
  const [bgColor, setBgColor] = useState<string>('#0A192F');
  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const minorSize = majorSize / subdivisions;

    // Draw minor grid lines
    if (style !== 'dotgrid') {
      ctx.strokeStyle = minorColor;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x < width; x += minorSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += minorSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Draw major grid lines
      ctx.strokeStyle = majorColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < width; x += majorSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += majorSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    } else {
      // Dot matrix grid
      ctx.fillStyle = majorColor;
      for (let x = 0; x < width; x += minorSize) {
        for (let y = 0; y < height; y += minorSize) {
          const isMajor = x % majorSize === 0 && y % majorSize === 0;
          ctx.beginPath();
          ctx.arc(x, y, isMajor ? 2.5 : 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Coordinate numbers
    if (showCoordinates && style !== 'dotgrid') {
      ctx.fillStyle = majorColor;
      ctx.font = '10px monospace';
      for (let x = majorSize; x < width; x += majorSize) {
        ctx.fillText(`${x}`, x + 4, 15);
      }
      for (let y = majorSize; y < height; y += majorSize) {
        ctx.fillText(`${y}`, 4, y - 4);
      }
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    drawGrid(ctx, canvasRef.current.width, canvasRef.current.height);
  }, [style, majorSize, subdivisions, majorColor, minorColor, bgColor, showCoordinates]);

  const handleDownload = () => {
    const out = document.createElement('canvas');
    out.width = 2400;
    out.height = 1600;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    drawGrid(ctx, out.width, out.height);

    const a = document.createElement('a');
    a.download = `technical-blueprint-grid-${Date.now()}.png`;
    a.href = out.toDataURL('image/png');
    a.click();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none">
      {/* Sidebar Controls */}
      <aside className="w-80 h-full min-h-0 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <LayoutGrid className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Technical Grid Settings
          </span>
        </div>

        {/* Style selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Grid Theme
          </label>
          <SegmentedPicker<'blueprint' | 'graph' | 'dotgrid'>
            value={style}
            onChange={(s) => {
              setStyle(s);
              if (s === 'graph') {
                setBgColor('#FFFFFF');
                setMajorColor('#94A3B8');
                setMinorColor('#E2E8F0');
              } else if (s === 'blueprint') {
                setBgColor('#0A192F');
                setMajorColor('#38BDF8');
                setMinorColor('#1E3A8A');
              } else {
                setBgColor('#0F172A');
                setMajorColor('#64748B');
                setMinorColor('#334155');
              }
            }}
            options={[
              { value: 'blueprint', label: 'Blueprint' },
              { value: 'graph', label: 'Millimeter' },
              { value: 'dotgrid', label: 'Dot Grid' }
            ]}
          />
        </div>

        {/* Colors */}
        <div className="grid grid-cols-3 gap-1.5">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-slate-500">Major</span>
            <input
              type="color"
              value={majorColor}
              onChange={(e) => setMajorColor(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-slate-500">Minor</span>
            <input
              type="color"
              value={minorColor}
              onChange={(e) => setMinorColor(e.target.value)}
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
          label="Major Grid Spacing"
          value={majorSize}
          min={40}
          max={200}
          step={10}
          unit="px"
          onChange={setMajorSize}
        />

        <SliderControl
          label="Subdivisions"
          value={subdivisions}
          min={2}
          max={10}
          step={1}
          onChange={setSubdivisions}
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Coordinate Ticks</span>
          <ToggleSwitch size="sm" checked={showCoordinates} onChange={setShowCoordinates} />
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="w-full mt-auto py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Blueprint PNG</span>
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
