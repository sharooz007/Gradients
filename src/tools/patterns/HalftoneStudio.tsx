import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, CircleDot } from 'lucide-react';
import confetti from 'canvas-confetti';

export const HalftoneStudio: React.FC = () => {
  const [dotShape, setDotShape] = useState<'circle' | 'square' | 'diamond' | 'line'>('circle');
  const [spacing, setSpacing] = useState<number>(16);
  const [maxRadius, setMaxRadius] = useState<number>(7);
  const [angle, setAngle] = useState<number>(45);
  const [contrast, setContrast] = useState<number>(1.2);
  const [dotColor, setDotColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render Halftone Matrix
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    const renderHalftone = (sourceCtx: CanvasRenderingContext2D) => {
      const srcImgData = sourceCtx.getImageData(0, 0, w, h);
      const src = srcImgData.data;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.translate(-w / 2, -h / 2);

      const rad = Math.hypot(w, h);
      const startX = -rad / 2;
      const endX = w + rad / 2;
      const startY = -rad / 2;
      const endY = h + rad / 2;

      ctx.fillStyle = dotColor;

      for (let y = startY; y < endY; y += spacing) {
        for (let x = startX; x < endX; x += spacing) {
          // Un-rotate coordinate to sample from original image
          const cos = Math.cos((-angle * Math.PI) / 180);
          const sin = Math.sin((-angle * Math.PI) / 180);
          const cx = x - w / 2;
          const cy = y - h / 2;
          const sampleX = Math.round(cx * cos - cy * sin + w / 2);
          const sampleY = Math.round(cx * sin + cy * cos + h / 2);

          if (sampleX >= 0 && sampleX < w && sampleY >= 0 && sampleY < h) {
            const idx = (sampleY * w + sampleX) * 4;
            const r = src[idx];
            const g = src[idx + 1];
            const b = src[idx + 2];
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            const adjustedLum = Math.pow(luminance, contrast);
            const size = (1 - adjustedLum) * maxRadius;

            if (size > 0.5) {
              if (dotShape === 'circle') {
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
              } else if (dotShape === 'square') {
                ctx.fillRect(x - size, y - size, size * 2, size * 2);
              } else if (dotShape === 'diamond') {
                ctx.beginPath();
                ctx.moveTo(x, y - size * 1.2);
                ctx.lineTo(x + size * 1.2, y);
                ctx.lineTo(x, y + size * 1.2);
                ctx.lineTo(x - size * 1.2, y);
                ctx.closePath();
                ctx.fill();
              } else if (dotShape === 'line') {
                ctx.fillRect(x - spacing / 2, y - size * 0.5, spacing, size);
              }
            }
          }
        }
      }

      ctx.restore();
    };

    // Prepare source context
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
        renderHalftone(offCtx);
      };
      img.src = uploadedImage;
    } else {
      // Default radial gradient source
      const grad = offCtx.createRadialGradient(w * 0.5, h * 0.5, 20, w * 0.5, h * 0.5, w * 0.45);
      grad.addColorStop(0, '#000000');
      grad.addColorStop(1, '#ffffff');
      offCtx.fillStyle = grad;
      offCtx.fillRect(0, 0, w, h);
      renderHalftone(offCtx);
    }
  }, [dotShape, spacing, maxRadius, angle, contrast, dotColor, bgColor, uploadedImage]);

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
    link.download = `halftone-matrix-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    confetti({ particleCount: 30, spread: 50 });
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#f5f5f7]">
      {/* Left Control Sidebar */}
      <aside className="w-80 h-full max-h-full shrink-0 border-r border-[#e5e5ea] bg-white overflow-y-auto overflow-x-hidden flex flex-col z-20 custom-scrollbar overscroll-contain">
        <div className="flex items-center justify-between p-4 border-b border-[#e5e5ea]">
          <div className="flex items-center gap-2">
            <CircleDot className="w-4 h-4 text-[#0071e3]" />
            <span className="text-xs font-semibold text-[#1d1d1f]">
              Halftone Parameters
            </span>
          </div>
        </div>

        {/* Dot Shape Selector */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-2">
          <span className="text-xs font-medium text-[#1d1d1f]">Dot Matrix Shape</span>
          <div className="grid grid-cols-4 gap-1 p-0.5 rounded-full bg-[#f2f2f7] border border-[#e5e5ea] text-xs">
            {(['circle', 'square', 'diamond', 'line'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setDotShape(s)}
                className={`py-1 rounded-full font-medium capitalize transition-all cursor-pointer ${
                  dotShape === s
                    ? 'bg-white text-[#1d1d1f] shadow-2xs font-semibold'
                    : 'text-[#86868b]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Colors Panel */}
        <div className="p-3.5 border-b border-[#e5e5ea] grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-[#86868b]">Dot Color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={dotColor}
                onChange={(e) => setDotColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-[#e5e5ea] p-0.5 bg-white"
              />
              <span className="text-xs font-mono text-[#1d1d1f]">{dotColor}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-[#86868b]">Background</span>
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

        {/* Grid & Pitch Controls */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Grid Spacing (Pitch)</span>
              <span className="font-mono text-[#1d1d1f]">{spacing}px</span>
            </div>
            <input
              type="range"
              min="8"
              max="40"
              value={spacing}
              onChange={(e) => setSpacing(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Max Dot Size</span>
              <span className="font-mono text-[#1d1d1f]">{maxRadius}px</span>
            </div>
            <input
              type="range"
              min="2"
              max="24"
              value={maxRadius}
              onChange={(e) => setMaxRadius(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Screen Angle</span>
              <span className="font-mono text-[#1d1d1f]">{angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Contrast Gamma</span>
              <span className="font-mono text-[#1d1d1f]">{contrast.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={contrast}
              onChange={(e) => setContrast(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Custom Image Upload */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-2.5">
          <span className="text-xs font-medium text-[#1d1d1f]">Image Source</span>
          <label className="apple-btn apple-btn-secondary gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploadedImage ? 'Replace Photo' : 'Upload Image to Halftone'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {uploadedImage && (
            <button
              type="button"
              onClick={() => setUploadedImage(null)}
              className="text-[11px] text-red-600 hover:underline text-center cursor-pointer"
            >
              Reset to Gradient Source
            </button>
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
            <span>Export Halftone PNG</span>
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
