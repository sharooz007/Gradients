import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Copy,
  Check,
  RotateCw,
  Plus,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MeshPoint {
  id: string;
  x: number; // 0 to 1
  y: number; // 0 to 1
  color: string;
  opacity: number;
}

const DEFAULT_POINTS: MeshPoint[] = [
  { id: 'p1', x: 0.15, y: 0.2, color: '#3b82f6', opacity: 1 },
  { id: 'p2', x: 0.85, y: 0.25, color: '#ec4899', opacity: 1 },
  { id: 'p3', x: 0.2, y: 0.8, color: '#8b5cf6', opacity: 1 },
  { id: 'p4', x: 0.8, y: 0.85, color: '#10b981', opacity: 1 },
  { id: 'p5', x: 0.5, y: 0.5, color: '#f59e0b', opacity: 0.9 }
];

const PRESET_PALETTES = [
  ['#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'],
  ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'],
  ['#00c6ff', '#0072ff', '#f857a6', '#ff5858', '#ffc3a0'],
  ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7', '#fa709a'],
  ['#a18cd1', '#fbc2eb', '#fad0c4', '#ffd1ff', '#a1c4fd']
];

export const MeshGradientStudio: React.FC = () => {
  const [points, setPoints] = useState<MeshPoint[]>(DEFAULT_POINTS);
  const [activePointId, setActivePointId] = useState<string>('p1');
  const [blurRadius, setBlurRadius] = useState<number>(80);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '1:1' | '9:16' | '4:3'>('16:9');
  const [isCopied, setIsCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);

  // Re-render mesh on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Save context for filter blur
    ctx.save();
    ctx.filter = `blur(${blurRadius}px)`;

    // Draw each point as a soft radial gradient
    points.forEach((p) => {
      const px = p.x * w;
      const py = p.y * h;
      const radius = Math.max(w, h) * 0.45;

      const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, 'transparent');

      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }, [points, blurRadius, aspectRatio]);

  // Pointer drag handler on canvas container
  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(id);
    setActivePointId(id);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    setPoints((prev) =>
      prev.map((p) => (p.id === isDragging ? { ...p, x, y } : p))
    );
  };

  const handlePointerUp = () => {
    setIsDragging(null);
  };

  const addPoint = () => {
    if (points.length >= 9) return;
    const newId = `p-${Date.now()}`;
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    const newPoint: MeshPoint = {
      id: newId,
      x: 0.3 + Math.random() * 0.4,
      y: 0.3 + Math.random() * 0.4,
      color: randomColor,
      opacity: 1
    };
    setPoints([...points, newPoint]);
    setActivePointId(newId);
  };

  const removePoint = (id: string) => {
    if (points.length <= 3) return;
    const remaining = points.filter((p) => p.id !== id);
    setPoints(remaining);
    setActivePointId(remaining[0].id);
  };

  const randomize = () => {
    const palette = PRESET_PALETTES[Math.floor(Math.random() * PRESET_PALETTES.length)];
    setPoints(
      points.map((p, i) => ({
        ...p,
        x: 0.1 + Math.random() * 0.8,
        y: 0.1 + Math.random() * 0.8,
        color: palette[i % palette.length]
      }))
    );
  };

  const activePoint = points.find((p) => p.id === activePointId) || points[0];

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `mesh-gradient-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    confetti({ particleCount: 35, spread: 50 });
  };

  const copyCss = () => {
    const bgStops = points
      .map(
        (p) =>
          `radial-gradient(at ${Math.round(p.x * 100)}% ${Math.round(p.y * 100)}%, ${p.color} 0px, transparent 50%)`
      )
      .join(',\n  ');

    const css = `background-color: #0f172a;\nbackground-image:\n  ${bgStops};`;
    navigator.clipboard.writeText(css);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#f5f5f7]">
      {/* Left Control Sidebar */}
      <aside className="w-80 h-full max-h-full shrink-0 border-r border-[#e5e5ea] bg-white overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4 z-20 custom-scrollbar overscroll-contain">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
            Mesh Points ({points.length}/9)
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={randomize}
              className="p-1.5 rounded-lg hover:bg-[#f2f2f7] text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer"
              title="Shuffle mesh positions"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={addPoint}
              disabled={points.length >= 9}
              className="p-1.5 rounded-lg hover:bg-[#f2f2f7] text-[#0071e3] disabled:opacity-30 transition-colors cursor-pointer"
              title="Add Point"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Points Swatches Grid */}
        <div className="p-3 bg-[#fafafc] rounded-2xl border border-[#e5e5ea] grid grid-cols-5 gap-2">
          {points.map((p, idx) => {
            const isSelected = p.id === activePointId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePointId(p.id)}
                className={`relative w-10 h-10 rounded-xl border transition-all flex items-center justify-center font-bold text-xs cursor-pointer ${
                  isSelected
                    ? 'border-[#0071e3] ring-2 ring-[#0071e3]/30 scale-105 shadow-xs text-white'
                    : 'border-[#e5e5ea] text-white/90 hover:scale-102'
                }`}
                style={{ backgroundColor: p.color }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Selected Point Editor Card */}
        {activePoint && (
          <div className="p-4 bg-[#fafafc] rounded-2xl border border-[#e5e5ea] flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1d1d1f]">
                Point #{points.findIndex((p) => p.id === activePoint.id) + 1} Settings
              </span>
              {points.length > 3 && (
                <button
                  type="button"
                  onClick={() => removePoint(activePoint.id)}
                  className="p-1 text-[#86868b] hover:text-red-600 transition-colors cursor-pointer"
                  title="Delete point"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={activePoint.color}
                onChange={(e) =>
                  setPoints((prev) =>
                    prev.map((p) =>
                      p.id === activePoint.id ? { ...p, color: e.target.value } : p
                    )
                  )
                }
                className="w-10 h-10 rounded-xl cursor-pointer border border-[#e5e5ea] p-0.5 bg-white"
              />
              <input
                type="text"
                value={activePoint.color.toUpperCase()}
                onChange={(e) =>
                  setPoints((prev) =>
                    prev.map((p) =>
                      p.id === activePoint.id ? { ...p, color: e.target.value } : p
                    )
                  )
                }
                className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-white border border-[#e5e5ea] text-[#1d1d1f]"
              />
            </div>

            {/* Opacity Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs text-[#86868b]">
                <span>Opacity</span>
                <span className="font-mono text-[#1d1d1f]">{Math.round(activePoint.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={activePoint.opacity}
                onChange={(e) =>
                  setPoints((prev) =>
                    prev.map((p) =>
                      p.id === activePoint.id
                        ? { ...p, opacity: parseFloat(e.target.value) }
                        : p
                    )
                  )
                }
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Global Blur Slider */}
        <div className="p-4 bg-[#fafafc] rounded-2xl border border-[#e5e5ea] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-[#86868b]">
            <span>Blur Softness</span>
            <span className="font-mono text-[#1d1d1f]">{blurRadius}px</span>
          </div>
          <input
            type="range"
            min="20"
            max="160"
            step="2"
            value={blurRadius}
            onChange={(e) => setBlurRadius(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Aspect Ratio Selector */}
        <div className="p-4 bg-[#fafafc] rounded-2xl border border-[#e5e5ea] flex flex-col gap-2">
          <span className="text-xs font-medium text-[#86868b]">Aspect Ratio</span>
          <div className="grid grid-cols-4 gap-1 p-0.5 rounded-full bg-[#f2f2f7] border border-[#e5e5ea] text-xs">
            {(['16:9', '1:1', '9:16', '4:3'] as const).map((ar) => (
              <button
                key={ar}
                type="button"
                onClick={() => setAspectRatio(ar)}
                className={`py-1 rounded-full font-medium transition-all cursor-pointer ${
                  aspectRatio === ar
                    ? 'bg-white text-[#1d1d1f] shadow-2xs font-semibold'
                    : 'text-[#86868b]'
                }`}
              >
                {ar}
              </button>
            ))}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <button
            type="button"
            onClick={exportPng}
            className="apple-pill-btn apple-pill-btn-primary gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Export 4K PNG</span>
          </button>
          <button
            type="button"
            onClick={copyCss}
            className="apple-pill-btn apple-pill-btn-secondary gap-1.5"
          >
            {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? 'CSS Copied!' : 'Copy CSS Gradient'}</span>
          </button>
        </div>
      </aside>

      {/* Main Interactive Canvas Area */}
      <main className="relative flex-1 h-full apple-grid-bg flex items-center justify-center p-8 overflow-hidden select-none">
        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={`relative rounded-2xl overflow-hidden shadow-2xl border border-[#e5e5ea] bg-slate-900 transition-all ${
            aspectRatio === '16:9'
              ? 'w-[720px] h-[405px]'
              : aspectRatio === '1:1'
              ? 'w-[480px] h-[480px]'
              : aspectRatio === '9:16'
              ? 'w-[320px] h-[568px]'
              : 'w-[640px] h-[480px]'
          }`}
        >
          <canvas
            ref={canvasRef}
            width={1200}
            height={
              aspectRatio === '16:9'
                ? 675
                : aspectRatio === '1:1'
                ? 1200
                : aspectRatio === '9:16'
                ? 2133
                : 900
            }
            className="w-full h-full object-cover"
          />

          {/* Interactive Drag Control Point Pins */}
          {points.map((p, idx) => {
            const isSelected = p.id === activePointId;
            return (
              <div
                key={p.id}
                onPointerDown={(e) => handlePointerDown(p.id, e)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-grab active:cursor-grabbing transition-transform hover:scale-125 flex items-center justify-center font-bold text-[10px] text-white ${
                  isSelected ? 'ring-4 ring-[#0071e3] scale-115' : 'ring-1 ring-black/20'
                }`}
                style={{
                  left: `${p.x * 100}%`,
                  top: `${p.y * 100}%`,
                  backgroundColor: p.color
                }}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
