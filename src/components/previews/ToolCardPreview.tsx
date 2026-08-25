import React, { useEffect, useRef } from 'react';

interface ToolCardPreviewProps {
  slug: string;
}

export const ToolCardPreview: React.FC<ToolCardPreviewProps> = ({ slug }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas-based procedural preview renderers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Shader Background Generator Preview
    if (slug === 'shader-background-generator') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#6366f1');
      grad.addColorStop(0.5, '#ec4899');
      grad.addColorStop(1, '#3b82f6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Add soft sine wave ripples
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      for (let x = 0; x <= w; x += 5) {
        const y = h * 0.5 + Math.sin(x * 0.04) * 20 + Math.cos(x * 0.02) * 15;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
    }

    // 2. God Rays Generator Preview
    else if (slug === 'god-rays-generator') {
      ctx.fillStyle = '#0a0d1a';
      ctx.fillRect(0, 0, w, h);

      const ox = w * 0.5;
      const oy = h * 0.2;
      const rayCount = 24;

      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI + Math.PI * 0.05;
        const length = Math.max(w, h) * 1.5;
        const width = 0.08 + (i % 3) * 0.04;

        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, length);
        grad.addColorStop(0, 'rgba(255, 220, 150, 0.45)');
        grad.addColorStop(0.5, 'rgba(255, 170, 70, 0.15)');
        grad.addColorStop(1, 'rgba(255, 120, 50, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.arc(ox, oy, length, angle - width, angle + width);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 3. Halftone Dot Matrix Preview
    else if (slug === 'halftone-generator') {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, w, h);

      const spacing = 12;
      for (let x = spacing / 2; x < w; x += spacing) {
        for (let y = spacing / 2; y < h; y += spacing) {
          const dist = Math.hypot(x - w / 2, y - h / 2) / (w * 0.5);
          const r = Math.max(1, (1 - dist) * 5.5);
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 4. CMYK Halftone Preview
    else if (slug === 'cmyk-halftone') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      const spacing = 10;
      // Cyan layer
      ctx.fillStyle = 'rgba(0, 180, 255, 0.6)';
      for (let x = 4; x < w; x += spacing) {
        for (let y = 4; y < h; y += spacing) {
          const r = 2.5 + Math.sin(x * 0.05) * 1.5;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Magenta layer
      ctx.fillStyle = 'rgba(255, 0, 128, 0.6)';
      for (let x = 6; x < w; x += spacing) {
        for (let y = 6; y < h; y += spacing) {
          const r = 2.5 + Math.cos(y * 0.05) * 1.5;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Yellow layer
      ctx.fillStyle = 'rgba(255, 220, 0, 0.7)';
      for (let x = 5; x < w; x += spacing) {
        for (let y = 5; y < h; y += spacing) {
          ctx.beginPath();
          ctx.arc(x + 2, y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 5. Add Grain to Images Preview
    else if (slug === 'add-grain-to-images') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(1, '#7c3aed');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Noise pass
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const noise = (Math.random() - 0.5) * 60;
        d[i] = Math.min(255, Math.max(0, d[i] + noise));
        d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + noise));
        d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + noise));
      }
      ctx.putImageData(imgData, 0, 0);
    }
  }, [slug]);

  // Mesh Gradients Preview (SVG Radial Blurs)
  if (slug === 'mesh-gradients') {
    return (
      <div className="relative w-full h-full overflow-hidden bg-slate-900 rounded-t-xl">
        <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-blue-500 blur-2xl opacity-80 animate-pulse" />
        <div className="absolute top-10 right-0 w-36 h-36 rounded-full bg-purple-500 blur-2xl opacity-80" />
        <div className="absolute -bottom-6 left-10 w-40 h-40 rounded-full bg-pink-500 blur-2xl opacity-80" />
        <div className="absolute bottom-0 right-8 w-28 h-28 rounded-full bg-emerald-400 blur-2xl opacity-70" />
        {/* Visual Mesh Control Points */}
        <div className="absolute top-6 left-8 w-3 h-3 rounded-full bg-white/90 ring-2 ring-white/40 shadow-sm" />
        <div className="absolute top-12 right-12 w-3 h-3 rounded-full bg-white/90 ring-2 ring-white/40 shadow-sm" />
        <div className="absolute bottom-8 left-16 w-3 h-3 rounded-full bg-white/90 ring-2 ring-white/40 shadow-sm" />
        <div className="absolute bottom-10 right-14 w-3 h-3 rounded-full bg-white/90 ring-2 ring-white/40 shadow-sm" />
      </div>
    );
  }

  // Fractal & Fluted Glass Preview
  if (slug === 'fractal-glass-effect') {
    return (
      <div className="relative w-full h-full overflow-hidden bg-gradient-to-tr from-violet-600 via-pink-500 to-amber-400 rounded-t-xl flex items-center justify-center">
        {/* Fluted Vertical Glass Ribs */}
        <div
          className="absolute inset-0 opacity-45 backdrop-blur-[2px]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 4px, transparent 4px, transparent 14px, rgba(0,0,0,0.15) 14px, rgba(0,0,0,0.15) 16px)'
          }}
        />
        <div className="z-10 px-3 py-1 bg-white/40 backdrop-blur-md rounded-lg border border-white/60 text-[11px] font-semibold text-white tracking-wider uppercase">
          Fluted Glass
        </div>
      </div>
    );
  }

  // Geometric Patterns Preview
  if (slug === 'geometric-patterns') {
    return (
      <div className="relative w-full h-full overflow-hidden bg-slate-900 rounded-t-xl flex items-center justify-center">
        <svg className="w-full h-full opacity-80" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="iso-cubes" width="40" height="70" patternUnits="userSpaceOnUse">
              <path d="M20 0 L40 11.5 L40 34.5 L20 23 Z" fill="#6366f1" />
              <path d="M0 11.5 L20 0 L20 23 L0 34.5 Z" fill="#4f46e5" />
              <path d="M0 34.5 L20 23 L40 34.5 L20 46 Z" fill="#818cf8" />
              <path d="M20 35 L40 46.5 L40 69.5 L20 58 Z" fill="#6366f1" />
              <path d="M0 46.5 L20 35 L20 58 L0 69.5 Z" fill="#4f46e5" />
              <path d="M0 69.5 L20 58 L40 69.5 L20 81 Z" fill="#818cf8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#iso-cubes)" />
        </svg>
      </div>
    );
  }

  // Seamless Patterns Preview
  if (slug === 'seamless-patterns') {
    return (
      <div className="relative w-full h-full overflow-hidden bg-amber-50 rounded-t-xl">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="seamless-motifs" width="36" height="36" patternUnits="userSpaceOnUse">
              <circle cx="9" cy="9" r="4" fill="#f97316" />
              <rect x="22" y="5" width="8" height="8" rx="2" fill="#3b82f6" transform="rotate(25 26 9)" />
              <polygon points="18,22 22,30 14,30" fill="#10b981" />
              <path d="M28 24 Q32 20 34 26" stroke="#8b5cf6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#seamless-motifs)" />
        </svg>
      </div>
    );
  }

  // Grid Background Pattern Preview
  if (slug === 'grid-background-pattern-generator') {
    return (
      <div className="relative w-full h-full overflow-hidden bg-[#0a192f] rounded-t-xl">
        <div
          className="w-full h-full opacity-70"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 180, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 180, 255, 0.4) 1px, transparent 1px), linear-gradient(rgba(0, 180, 255, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 180, 255, 0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px, 40px 40px, 8px 8px, 8px 8px'
          }}
        />
        <div className="absolute top-2 left-2 text-[9px] font-mono text-cyan-400 opacity-80">
          X: 120.4 Y: 84.0
        </div>
      </div>
    );
  }

  // Polka Dot Pattern Preview
  if (slug === 'polka-dot-pattern-generator') {
    return (
      <div className="relative w-full h-full overflow-hidden bg-rose-50 rounded-t-xl">
        <div
          className="w-full h-full"
          style={{
            backgroundColor: '#fff1f2',
            backgroundImage: 'radial-gradient(#e11d48 20%, transparent 20%), radial-gradient(#e11d48 20%, transparent 20%)',
            backgroundPosition: '0 0, 12px 12px',
            backgroundSize: '24px 24px'
          }}
        />
      </div>
    );
  }

  // CSS Backgrounds Preview
  if (slug === 'css-backgrounds') {
    return (
      <div className="relative w-full h-full overflow-hidden rounded-t-xl">
        <div
          className="w-full h-full"
          style={{
            backgroundColor: '#3b82f6',
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 10px, transparent 10px, transparent 20px)'
          }}
        />
        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded text-[10px] font-mono text-white">
          CSS Pattern
        </div>
      </div>
    );
  }

  // SVG Chart Preview
  if (slug === 'svg-chart-generator') {
    return (
      <div className="relative w-full h-full overflow-hidden bg-slate-900 rounded-t-xl flex items-center justify-center p-3">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <defs>
            <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 10 70 Q 45 20, 80 50 T 150 30 T 190 20 L 190 90 L 10 90 Z"
            fill="url(#chart-grad)"
          />
          <path
            d="M 10 70 Q 45 20, 80 50 T 150 30 T 190 20"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="80" cy="50" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
          <circle cx="150" cy="30" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
          <circle cx="190" cy="20" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  // Harmonic Color Palette Preview
  if (slug === 'color-palette-generator') {
    return (
      <div className="w-full h-full flex rounded-t-xl overflow-hidden">
        <div className="flex-1 h-full bg-[#3B82F6] flex flex-col justify-end p-1.5">
          <span className="text-[8px] font-mono text-white/90">#3B82F6</span>
        </div>
        <div className="flex-1 h-full bg-[#10B981] flex flex-col justify-end p-1.5">
          <span className="text-[8px] font-mono text-white/90">#10B981</span>
        </div>
        <div className="flex-1 h-full bg-[#F59E0B] flex flex-col justify-end p-1.5">
          <span className="text-[8px] font-mono text-white/90">#F59E0B</span>
        </div>
        <div className="flex-1 h-full bg-[#EC4899] flex flex-col justify-end p-1.5">
          <span className="text-[8px] font-mono text-white/90">#EC4899</span>
        </div>
        <div className="flex-1 h-full bg-[#8B5CF6] flex flex-col justify-end p-1.5">
          <span className="text-[8px] font-mono text-white/90">#8B5CF6</span>
        </div>
      </div>
    );
  }

  // Color Tints & Shades Preview
  if (slug === 'color-tints-shades-generator') {
    return (
      <div className="w-full h-full flex flex-col rounded-t-xl overflow-hidden">
        <div className="flex-1 flex">
          <div className="flex-1 bg-indigo-100" />
          <div className="flex-1 bg-indigo-200" />
          <div className="flex-1 bg-indigo-300" />
          <div className="flex-1 bg-indigo-400" />
          <div className="flex-1 bg-indigo-500" />
        </div>
        <div className="flex-1 flex">
          <div className="flex-1 bg-indigo-500" />
          <div className="flex-1 bg-indigo-600" />
          <div className="flex-1 bg-indigo-700" />
          <div className="flex-1 bg-indigo-800" />
          <div className="flex-1 bg-indigo-900" />
        </div>
      </div>
    );
  }

  // Tailwind Color Palette Preview
  if (slug === 'tailwind-color-palette-generator') {
    return (
      <div className="w-full h-full grid grid-cols-5 grid-rows-2 gap-1 p-2 bg-slate-100 rounded-t-xl">
        <div className="rounded bg-sky-50 flex items-center justify-center text-[7px] font-bold text-sky-900">50</div>
        <div className="rounded bg-sky-200 flex items-center justify-center text-[7px] font-bold text-sky-900">200</div>
        <div className="rounded bg-sky-400 flex items-center justify-center text-[7px] font-bold text-white">400</div>
        <div className="rounded bg-sky-500 flex items-center justify-center text-[7px] font-bold text-white">500</div>
        <div className="rounded bg-sky-600 flex items-center justify-center text-[7px] font-bold text-white">600</div>
        <div className="rounded bg-sky-700 flex items-center justify-center text-[7px] font-bold text-white">700</div>
        <div className="rounded bg-sky-800 flex items-center justify-center text-[7px] font-bold text-white">800</div>
        <div className="rounded bg-sky-900 flex items-center justify-center text-[7px] font-bold text-white">900</div>
        <div className="rounded bg-sky-950 flex items-center justify-center text-[7px] font-bold text-white">950</div>
        <div className="rounded bg-emerald-500 flex items-center justify-center text-[7px] font-bold text-white">HEX</div>
      </div>
    );
  }

  // Extract Palette from Image Preview
  if (slug === 'extract-palette-from-image') {
    return (
      <div className="relative w-full h-full overflow-hidden bg-slate-800 rounded-t-xl flex flex-col justify-end">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-teal-600 to-indigo-900 opacity-90" />
        <div className="relative p-2 flex items-center gap-1 bg-white/90 backdrop-blur-md m-2 rounded-lg shadow-sm">
          <div className="w-5 h-5 rounded-full bg-amber-500 border border-white shadow-xs" />
          <div className="w-5 h-5 rounded-full bg-teal-600 border border-white shadow-xs" />
          <div className="w-5 h-5 rounded-full bg-indigo-900 border border-white shadow-xs" />
          <div className="w-5 h-5 rounded-full bg-emerald-400 border border-white shadow-xs" />
          <span className="ml-auto text-[8px] font-semibold text-slate-700 uppercase">Extracted</span>
        </div>
      </div>
    );
  }

  // Fallback Canvas
  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={140}
      className="w-full h-full object-cover rounded-t-xl"
    />
  );
};
