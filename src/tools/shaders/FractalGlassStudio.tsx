import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';

export const FractalGlassStudio: React.FC = () => {
  const [styleMode, setStyleMode] = useState<'fluted' | 'frosted' | 'fractal'>('fluted');
  const [ribCount, setRibCount] = useState<number>(28);
  const [refraction, setRefraction] = useState<number>(0.8);
  const [frostedNoise, setFrostedNoise] = useState<number>(0.4);
  const [specular, setSpecular] = useState<number>(0.6);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render Glass Refraction Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Draw background (either uploaded image or vibrant generative gradient)
    const drawBackdrop = () => {
      if (uploadedImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, 0, 0, w, h);
          applyGlassPass();
        };
        img.src = uploadedImage;
      } else {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#8b5cf6');
        grad.addColorStop(0.5, '#ec4899');
        grad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Draw some visual background shapes to show refraction
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(w * 0.35, h * 0.45, 140, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
        ctx.fillRect(w * 0.5, h * 0.2, 220, 260);

        applyGlassPass();
      }
    };

    // Apply Glass Refraction & Fluting Math Pass
    const applyGlassPass = () => {
      const imgData = ctx.getImageData(0, 0, w, h);
      const srcData = new Uint8ClampedArray(imgData.data);
      const d = imgData.data;

      const ribWidth = w / ribCount;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;

          let dx = 0;
          let dy = 0;

          if (styleMode === 'fluted') {
            // Cylindrical fluted rib lens formula
            const localX = (x % ribWidth) / ribWidth; // 0 to 1
            const normalX = (localX - 0.5) * 2; // -1 to 1
            dx = normalX * Math.sqrt(Math.max(0, 1 - normalX * normalX)) * 24 * refraction;
          } else if (styleMode === 'frosted') {
            dx = (Math.random() - 0.5) * 20 * frostedNoise;
            dy = (Math.random() - 0.5) * 20 * frostedNoise;
          } else {
            // Fractal distortion
            dx = Math.sin(x * 0.03 + y * 0.02) * 16 * refraction;
            dy = Math.cos(x * 0.02 - y * 0.03) * 16 * refraction;
          }

          const sampleX = Math.min(w - 1, Math.max(0, Math.round(x + dx)));
          const sampleY = Math.min(h - 1, Math.max(0, Math.round(y + dy)));
          const sampleIdx = (sampleY * w + sampleX) * 4;

          // Sample chromatic aberration (RGB split)
          const rSampleX = Math.min(w - 1, Math.max(0, Math.round(x + dx * 1.15)));
          const bSampleX = Math.min(w - 1, Math.max(0, Math.round(x + dx * 0.85)));
          const rIdx = (sampleY * w + rSampleX) * 4;
          const bIdx = (sampleY * w + bSampleX) * 4;

          d[idx] = srcData[rIdx]; // R
          d[idx + 1] = srcData[sampleIdx + 1]; // G
          d[idx + 2] = srcData[bIdx + 2]; // B

          // Add Specular Highlight on Rib Edges
          if (styleMode === 'fluted') {
            const localX = (x % ribWidth) / ribWidth;
            if (localX < 0.1 || localX > 0.9) {
              const highlight = specular * 80;
              d[idx] = Math.min(255, d[idx] + highlight);
              d[idx + 1] = Math.min(255, d[idx + 1] + highlight);
              d[idx + 2] = Math.min(255, d[idx + 2] + highlight);
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };

    drawBackdrop();
  }, [styleMode, ribCount, refraction, frostedNoise, specular, uploadedImage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `fractal-glass-${Date.now()}.png`;
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
            <Layers className="w-4 h-4 text-[#0071e3]" />
            <span className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
              Glass Refraction
            </span>
          </div>
        </div>

        {/* Style Mode Switcher */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-2">
          <span className="text-xs font-medium text-[#1d1d1f]">Glass Texture Mode</span>
          <div className="grid grid-cols-3 gap-1 p-0.5 rounded-full bg-[#f2f2f7] border border-[#e5e5ea] text-xs">
            {(['fluted', 'frosted', 'fractal'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setStyleMode(mode)}
                className={`py-1 rounded-full font-medium capitalize transition-all cursor-pointer ${
                  styleMode === mode
                    ? 'bg-white text-[#1d1d1f] shadow-2xs font-semibold'
                    : 'text-[#86868b]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Glass Parameters */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-3.5">
          {styleMode === 'fluted' && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs text-[#86868b]">
                <span>Fluted Rib Frequency</span>
                <span className="font-mono text-[#1d1d1f]">{ribCount} ribs</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={ribCount}
                onChange={(e) => setRibCount(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Refraction Distortion</span>
              <span className="font-mono text-[#1d1d1f]">{refraction.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.05"
              value={refraction}
              onChange={(e) => setRefraction(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#86868b]">
              <span>Frosted Blur Noise</span>
              <span className="font-mono text-[#1d1d1f]">{frostedNoise.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1.0"
              step="0.05"
              value={frostedNoise}
              onChange={(e) => setFrostedNoise(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {styleMode === 'fluted' && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs text-[#86868b]">
                <span>Specular Rib Highlights</span>
                <span className="font-mono text-[#1d1d1f]">{(specular * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.05"
                value={specular}
                onChange={(e) => setSpecular(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Custom Image Upload */}
        <div className="p-3.5 border-b border-[#e5e5ea] flex flex-col gap-2.5">
          <span className="text-xs font-medium text-[#1d1d1f]">Backdrop Source</span>
          <label className="apple-btn apple-btn-secondary gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploadedImage ? 'Replace Image' : 'Upload Custom Image'}</span>
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
              Reset to Gradient Backdrop
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
            <span>Export Glass PNG</span>
          </button>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="relative flex-1 h-full apple-grid-bg flex items-center justify-center p-8 overflow-hidden select-none">
        <div className="relative w-[720px] h-[450px] rounded-lg overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#000000]/10 bg-slate-900">
          <canvas
            ref={canvasRef}
            width={1440}
            height={900}
            className="w-full h-full object-cover"
          />
        </div>
      </main>
    </div>
  );
};
