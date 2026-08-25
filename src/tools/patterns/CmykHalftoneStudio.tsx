import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CmykHalftoneStudio: React.FC = () => {
  const [pitch, setPitch] = useState<number>(14);
  const [maxDotSize, setMaxDotSize] = useState<number>(6);
  const [cyanGain, setCyanGain] = useState<number>(1.0);
  const [magentaGain, setMagentaGain] = useState<number>(1.0);
  const [yellowGain, setYellowGain] = useState<number>(1.0);
  const [blackGain, setBlackGain] = useState<number>(1.0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render 4-Color CMYK Offset Rosette Print
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    const renderCmyk = (sourceCtx: CanvasRenderingContext2D) => {
      const srcImgData = sourceCtx.getImageData(0, 0, w, h);
      const src = srcImgData.data;

      // Pure paper white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // CMYK Screen Angles (Standard 4-color offset printing)
      const layers = [
        { name: 'Cyan', color: 'rgba(0, 180, 255, 0.7)', angle: 15, gain: cyanGain, getVal: (r: number, _g: number, _b: number) => 1 - r / 255 },
        { name: 'Magenta', color: 'rgba(255, 0, 128, 0.7)', angle: 75, gain: magentaGain, getVal: (_r: number, g: number, _b: number) => 1 - g / 255 },
        { name: 'Yellow', color: 'rgba(255, 230, 0, 0.8)', angle: 0, gain: yellowGain, getVal: (_r: number, _g: number, b: number) => 1 - b / 255 },
        { name: 'Black', color: 'rgba(15, 23, 42, 0.85)', angle: 45, gain: blackGain, getVal: (r: number, g: number, b: number) => Math.max(0, 1 - (r + g + b) / (255 * 3)) }
      ];

      layers.forEach((layer) => {
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate((layer.angle * Math.PI) / 180);
        ctx.translate(-w / 2, -h / 2);

        const rad = Math.hypot(w, h);
        const startX = -rad / 2;
        const endX = w + rad / 2;
        const startY = -rad / 2;
        const endY = h + rad / 2;

        ctx.fillStyle = layer.color;

        for (let y = startY; y < endY; y += pitch) {
          for (let x = startX; x < endX; x += pitch) {
            // Un-rotate coordinate to sample from image
            const cos = Math.cos((-layer.angle * Math.PI) / 180);
            const sin = Math.sin((-layer.angle * Math.PI) / 180);
            const cx = x - w / 2;
            const cy = y - h / 2;
            const sampleX = Math.round(cx * cos - cy * sin + w / 2);
            const sampleY = Math.round(cx * sin + cy * cos + h / 2);

            if (sampleX >= 0 && sampleX < w && sampleY >= 0 && sampleY < h) {
              const idx = (sampleY * w + sampleX) * 4;
              const r = src[idx];
              const g = src[idx + 1];
              const b = src[idx + 2];
              const inkDensity = Math.min(1, layer.getVal(r, g, b) * layer.gain);
              const dotR = inkDensity * maxDotSize;

              if (dotR > 0.4) {
                ctx.beginPath();
                ctx.arc(x, y, dotR, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        }

        ctx.restore();
      });
    };

    const offCanvas = document.createElement('canvas');
    offCanvas.width = w;
    offCanvas.height = h;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    if (uploadedImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        offCtx.drawImage(img, 0, 0, w, h);
        renderCmyk(offCtx);
      };
      img.src = uploadedImage;
    } else {
      // Default colorful gradient backdrop for rosette demonstration
      const grad = offCtx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#e11d48');
      grad.addColorStop(0.35, '#f59e0b');
      grad.addColorStop(0.7, '#10b981');
      grad.addColorStop(1, '#3b82f6');
      offCtx.fillStyle = grad;
      offCtx.fillRect(0, 0, w, h);
      renderCmyk(offCtx);
    }
  }, [pitch, maxDotSize, cyanGain, magentaGain, yellowGain, blackGain, uploadedImage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `cmyk-halftone-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    confetti({ particleCount: 30, spread: 45 });
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#f5f5f7]">
      {/* Left Control Sidebar */}
      <aside className="w-80 h-full max-h-full shrink-0 border-r border-[#e5e5ea] bg-white overflow-y-auto overflow-x-hidden flex flex-col z-20 custom-scrollbar overscroll-contain">
        <div className="flex items-center justify-between p-4 border-b border-[#e5e5ea]">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#0071e3]" />
            <span className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
              CMYK Print Separation
            </span>
          </div>
        </div>

        {/* Rosette Grid Spacing */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Rosette Pitch</span>
              <span className="font-mono text-[#1d1d1f]">{pitch}px</span>
            </div>
            <input
              type="range"
              min="8"
              max="32"
              value={pitch}
              onChange={(e) => setPitch(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Max Dot Diameter</span>
              <span className="font-mono text-[#1d1d1f]">{maxDotSize}px</span>
            </div>
            <input
              type="range"
              min="2"
              max="16"
              value={maxDotSize}
              onChange={(e) => setMaxDotSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* 4-Color Channel Balances */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-3">
          <span className="text-xs font-medium text-[#1d1d1f]">Channel Gains (Angles)</span>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyan-600 font-medium">Cyan (15°)</span>
              <span className="font-mono text-[#1d1d1f]">{cyanGain.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.05"
              value={cyanGain}
              onChange={(e) => setCyanGain(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-pink-600 font-medium">Magenta (75°)</span>
              <span className="font-mono text-[#1d1d1f]">{magentaGain.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.05"
              value={magentaGain}
              onChange={(e) => setMagentaGain(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-500 font-medium">Yellow (0°)</span>
              <span className="font-mono text-[#1d1d1f]">{yellowGain.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.05"
              value={yellowGain}
              onChange={(e) => setYellowGain(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-800 font-medium">Black / Key (45°)</span>
              <span className="font-mono text-[#1d1d1f]">{blackGain.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.05"
              value={blackGain}
              onChange={(e) => setBlackGain(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Photo Upload */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-2.5">
          <span className="text-xs font-medium text-[#1d1d1f]">Image Source</span>
          <label className="apple-btn apple-btn-secondary gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploadedImage ? 'Replace Image' : 'Upload Image'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Export Action */}
        <div className="mt-auto p-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={exportPng}
            className="apple-btn apple-btn-primary gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Export CMYK PNG</span>
          </button>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="relative flex-1 h-full apple-grid-bg flex items-center justify-center p-8 overflow-hidden select-none">
        <div className="relative w-[720px] h-[480px] rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#000000]/10 bg-white">
          <canvas
            ref={canvasRef}
            width={1440}
            height={960}
            className="w-full h-full object-cover"
          />
        </div>
      </main>
    </div>
  );
};
