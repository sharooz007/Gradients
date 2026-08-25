import React, { useState, useRef, useEffect } from 'react';
import { Download, RotateCw, Sun } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GodRaysStudio: React.FC = () => {
  const [originX, setOriginX] = useState<number>(0.5);
  const [originY, setOriginY] = useState<number>(0.15);
  const [rayCount, setRayCount] = useState<number>(36);
  const [exposure, setExposure] = useState<number>(1.2);
  const [decay, setDecay] = useState<number>(0.92);
  const [rayColor, setRayColor] = useState<string>('#ffd280');
  const [bgColor, setBgColor] = useState<string>('#0b0e14');
  const [particles, setParticles] = useState<boolean>(true);
  const [particleCount, setParticleCount] = useState<number>(60);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Render Volumetric Light Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Fill dark atmospheric background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    const ox = originX * w;
    const oy = originY * h;
    const maxRadius = Math.hypot(w, h) * 1.2;

    // Draw central light source glow
    const coreGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, maxRadius * 0.4);
    coreGrad.addColorStop(0, rayColor);
    coreGrad.addColorStop(0.3, 'rgba(255, 200, 100, 0.4)');
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(ox, oy, maxRadius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Draw Volumetric Rays
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const rayWidth = (0.04 + Math.sin(i * 3.7) * 0.02) * exposure;

      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, maxRadius);
      grad.addColorStop(0, rayColor);
      grad.addColorStop(decay * 0.6, 'rgba(255, 220, 150, 0.2)');
      grad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.globalAlpha = Math.min(1, 0.3 * exposure);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.arc(ox, oy, maxRadius, angle - rayWidth, angle + rayWidth);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Draw Floating Dust Motes
    if (particles) {
      ctx.save();
      for (let i = 0; i < particleCount; i++) {
        const px = ((Math.sin(i * 99 + 1) * 0.5 + 0.5) * w);
        const py = ((Math.cos(i * 33 + 2) * 0.5 + 0.5) * h);
        const dist = Math.hypot(px - ox, py - oy);
        const alpha = Math.max(0.1, (1 - dist / maxRadius) * 0.8);
        const size = 1 + (i % 3);

        ctx.fillStyle = rayColor;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }, [originX, originY, rayCount, exposure, decay, rayColor, bgColor, particles, particleCount]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setOriginX(x);
    setOriginY(y);
  };

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `god-rays-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    confetti({ particleCount: 30, spread: 45 });
  };

  const randomize = () => {
    setOriginX(0.2 + Math.random() * 0.6);
    setOriginY(0.05 + Math.random() * 0.3);
    setExposure(0.8 + Math.random() * 1.0);
    setRayCount(Math.floor(20 + Math.random() * 40));
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#f5f5f7]">
      {/* Left Control Sidebar */}
      <aside className="w-80 h-full max-h-full shrink-0 border-r border-[#e5e5ea] bg-white overflow-y-auto overflow-x-hidden flex flex-col z-20 custom-scrollbar overscroll-contain">
        <div className="flex items-center justify-between p-4 border-b border-[#e5e5ea]">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-[#0071e3]" />
            <span className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
              God Rays Parameters
            </span>
          </div>
          <button
            type="button"
            onClick={randomize}
            className="p-1.5 rounded-lg hover:bg-[#f2f2f7] text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer"
            title="Randomize"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Colors Panel */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-3">
          <span className="text-xs font-medium text-[#1d1d1f]">Atmospheric Colors</span>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-[#86868b]">Ray Light</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={rayColor}
                  onChange={(e) => setRayColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-[#e5e5ea] p-0.5 bg-white"
                />
                <span className="text-xs font-mono text-[#1d1d1f]">{rayColor}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-[#86868b]">Backdrop</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-[#e5e5ea] p-0.5 bg-white"
                />
                <span className="text-xs font-mono text-[#1d1d1f]">{bgColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ray Density & Exposure */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Ray Count / Density</span>
              <span className="font-mono text-[#1d1d1f]">{rayCount}</span>
            </div>
            <input
              type="range"
              min="12"
              max="72"
              value={rayCount}
              onChange={(e) => setRayCount(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Exposure / Intensity</span>
              <span className="font-mono text-[#1d1d1f]">{exposure.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="2.5"
              step="0.05"
              value={exposure}
              onChange={(e) => setExposure(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Decay Falloff</span>
              <span className="font-mono text-[#1d1d1f]">{(decay * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="0.99"
              step="0.01"
              value={decay}
              onChange={(e) => setDecay(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Floating Particles */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#1d1d1f]">Atmospheric Dust Motes</span>
            <input
              type="checkbox"
              checked={particles}
              onChange={(e) => setParticles(e.target.checked)}
              className="w-4 h-4 rounded text-[#0071e3]"
            />
          </div>
          {particles && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs text-[#86868b]">
                <span>Dust Density</span>
                <span className="font-mono text-[#1d1d1f]">{particleCount}</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                value={particleCount}
                onChange={(e) => setParticleCount(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Export Action */}
        <div className="mt-auto p-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={exportPng}
            className="apple-btn apple-btn-primary gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Export 4K PNG</span>
          </button>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="relative flex-1 h-full apple-grid-bg flex items-center justify-center p-8 overflow-hidden select-none">
        <div
          ref={containerRef}
          onClick={handleCanvasClick}
          className="relative w-[720px] h-[450px] rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#000000]/10 bg-slate-950 cursor-crosshair group"
        >
          <canvas
            ref={canvasRef}
            width={1440}
            height={900}
            className="w-full h-full object-cover"
          />

          {/* Interactive Light Origin Indicator Pin */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white bg-amber-400/80 ring-4 ring-amber-400/30 flex items-center justify-center shadow-lg pointer-events-none transition-all group-hover:scale-125"
            style={{
              left: `${originX * 100}%`,
              top: `${originY * 100}%`
            }}
          >
            <Sun className="w-3.5 h-3.5 text-white" />
          </div>

          <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[11px] font-mono text-white/80 border border-white/10">
            Click anywhere on canvas to reposition light origin
          </div>
        </div>
      </main>
    </div>
  );
};
