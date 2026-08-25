import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download,
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sun,
  Shuffle,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GodRaysPreset {
  id: string;
  name: string;
  originX: number;
  originY: number;
  rayCount: number;
  exposure: number;
  decay: number;
  rayColor: string;
  glowColor: string;
  bgColor: string;
  particles: boolean;
  particleCount: number;
}

const CURATED_GODRAYS_PRESETS: GodRaysPreset[] = [
  {
    id: 'golden-hour',
    name: 'Golden Hour Sunburst',
    originX: 0.5,
    originY: 0.15,
    rayCount: 42,
    exposure: 1.4,
    decay: 0.92,
    rayColor: '#ffd280',
    glowColor: '#ff9a3c',
    bgColor: '#0b0c10',
    particles: true,
    particleCount: 80
  },
  {
    id: 'mystic-forest',
    name: 'Mystic Forest Canopy',
    originX: 0.25,
    originY: 0.1,
    rayCount: 36,
    exposure: 1.3,
    decay: 0.88,
    rayColor: '#a7f3d0',
    glowColor: '#10b981',
    bgColor: '#03140d',
    particles: true,
    particleCount: 120
  },
  {
    id: 'cyber-neon',
    name: 'Cyberpunk Neon Burst',
    originX: 0.5,
    originY: 0.5,
    rayCount: 64,
    exposure: 1.8,
    decay: 0.95,
    rayColor: '#00f2fe',
    glowColor: '#fa709a',
    bgColor: '#05050e',
    particles: true,
    particleCount: 100
  },
  {
    id: 'deep-sea',
    name: 'Deep Sea Crepuscular',
    originX: 0.8,
    originY: 0.05,
    rayCount: 28,
    exposure: 1.5,
    decay: 0.9,
    rayColor: '#38bdf8',
    glowColor: '#0284c7',
    bgColor: '#030712',
    particles: true,
    particleCount: 90
  },
  {
    id: 'holy-cathedral',
    name: 'Holy Cathedral Rays',
    originX: 0.5,
    originY: 0.0,
    rayCount: 48,
    exposure: 1.6,
    decay: 0.94,
    rayColor: '#ffffff',
    glowColor: '#fef08a',
    bgColor: '#0f0a06',
    particles: true,
    particleCount: 150
  },
  {
    id: 'sunset-flare',
    name: 'Sunset Horizon Flare',
    originX: 0.5,
    originY: 0.75,
    rayCount: 50,
    exposure: 1.5,
    decay: 0.85,
    rayColor: '#ff4b72',
    glowColor: '#ff8f3d',
    bgColor: '#12050b',
    particles: true,
    particleCount: 70
  },
  {
    id: 'alien-beam',
    name: 'Alien Tractor Beam',
    originX: 0.5,
    originY: 0.1,
    rayCount: 32,
    exposure: 1.7,
    decay: 0.96,
    rayColor: '#a855f7',
    glowColor: '#ec4899',
    bgColor: '#0a0518',
    particles: true,
    particleCount: 110
  },
  {
    id: 'solar-eclipse',
    name: 'Solar Eclipse Corona',
    originX: 0.5,
    originY: 0.5,
    rayCount: 80,
    exposure: 2.0,
    decay: 0.9,
    rayColor: '#e0e7ff',
    glowColor: '#818cf8',
    bgColor: '#000000',
    particles: false,
    particleCount: 0
  }
];

const ASPECT_PRESETS = [
  { id: '16:9', label: '16:9', width: 1920, height: 1080 },
  { id: '1:1', label: '1:1 Square', width: 1400, height: 1400 },
  { id: '9:16', label: '9:16 Story', width: 1080, height: 1920 },
  { id: '4:3', label: '4:3 Standard', width: 1600, height: 1200 },
  { id: 'banner', label: 'Banner', width: 1500, height: 500 }
];

export const GodRaysStudio: React.FC = () => {
  const [originX, setOriginX] = useState<number>(CURATED_GODRAYS_PRESETS[0].originX);
  const [originY, setOriginY] = useState<number>(CURATED_GODRAYS_PRESETS[0].originY);
  const [rayCount, setRayCount] = useState<number>(CURATED_GODRAYS_PRESETS[0].rayCount);
  const [exposure, setExposure] = useState<number>(CURATED_GODRAYS_PRESETS[0].exposure);
  const [decay, setDecay] = useState<number>(CURATED_GODRAYS_PRESETS[0].decay);
  const [rayColor, setRayColor] = useState<string>(CURATED_GODRAYS_PRESETS[0].rayColor);
  const [glowColor, setGlowColor] = useState<string>(CURATED_GODRAYS_PRESETS[0].glowColor);
  const [bgColor, setBgColor] = useState<string>(CURATED_GODRAYS_PRESETS[0].bgColor);
  const [particles, setParticles] = useState<boolean>(CURATED_GODRAYS_PRESETS[0].particles);
  const [particleCount, setParticleCount] = useState<number>(CURATED_GODRAYS_PRESETS[0].particleCount);

  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080, label: '16:9' });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('golden-hour');
  const [searchPreset, setSearchPreset] = useState('');
  const [presetTab, setPresetTab] = useState<'curated' | 'saved'>('curated');
  const [customPresets, setCustomPresets] = useState<GodRaysPreset[]>([]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    light: true,
    particles: true,
    colors: true,
    canvas: false
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingOrigin, setIsDraggingOrigin] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('magic_custom_godrays_presets');
      if (saved) setCustomPresets(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    const ox = originX * w;
    const oy = originY * h;
    const maxRadius = Math.hypot(w, h) * 1.3;

    const coreGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, maxRadius * 0.45);
    coreGrad.addColorStop(0, rayColor);
    coreGrad.addColorStop(0.2, glowColor);
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(ox, oy, maxRadius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const rayWidth = (0.035 + Math.sin(i * 3.7) * 0.018) * exposure;

      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, maxRadius);
      grad.addColorStop(0, rayColor);
      grad.addColorStop(0.3, glowColor);
      grad.addColorStop(decay * 0.8, 'rgba(255, 255, 255, 0.05)');
      grad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.globalAlpha = Math.min(1, 0.35 * exposure);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.arc(ox, oy, maxRadius, angle - rayWidth, angle + rayWidth);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    if (particles && particleCount > 0) {
      ctx.save();
      for (let i = 0; i < particleCount; i++) {
        const px = ((Math.sin(i * 99 + 1) * 0.5 + 0.5) * w);
        const py = ((Math.cos(i * 33 + 2) * 0.5 + 0.5) * h);
        const dist = Math.hypot(px - ox, py - oy);
        const alpha = Math.max(0.1, (1 - dist / maxRadius) * 0.85);
        const size = 1 + (i % 3);

        ctx.fillStyle = rayColor;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }, [originX, originY, rayCount, exposure, decay, rayColor, glowColor, bgColor, particles, particleCount]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handlePointerDownOrigin = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDraggingOrigin(true);
  };

  const handlePointerMoveContainer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingOrigin || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0.02, Math.min(0.98, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0.02, Math.min(0.98, (e.clientY - rect.top) / rect.height));
    setOriginX(x);
    setOriginY(y);
  };

  const handlePointerUpContainer = () => {
    setIsDraggingOrigin(false);
  };

  const randomizeOrigin = () => {
    setOriginX(0.15 + Math.random() * 0.7);
    setOriginY(0.05 + Math.random() * 0.5);
  };

  const applyPreset = (preset: GodRaysPreset) => {
    setSelectedPresetId(preset.id);
    setOriginX(preset.originX);
    setOriginY(preset.originY);
    setRayCount(preset.rayCount);
    setExposure(preset.exposure);
    setDecay(preset.decay);
    setRayColor(preset.rayColor);
    setGlowColor(preset.glowColor || preset.rayColor);
    setBgColor(preset.bgColor);
    setParticles(preset.particles);
    setParticleCount(preset.particleCount);
  };

  const saveCurrentAsPreset = () => {
    const name = prompt('Enter preset name:', `God Rays Look #${customPresets.length + 1}`);
    if (!name) return;
    const newPreset: GodRaysPreset = {
      id: `custom-${Date.now()}`,
      name,
      originX,
      originY,
      rayCount,
      exposure,
      decay,
      rayColor,
      glowColor,
      bgColor,
      particles,
      particleCount
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_godrays_presets', JSON.stringify(updated));
    setSelectedPresetId(newPreset.id);
    confetti({ particleCount: 40, spread: 60 });
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_godrays_presets', JSON.stringify(updated));
  };

  const exportPngHighRes = (scale: number = 2) => {
    const offscreen = document.createElement('canvas');
    offscreen.width = dimensions.width * scale;
    offscreen.height = dimensions.height * scale;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, offscreen.width, offscreen.height);

    const ox = originX * offscreen.width;
    const oy = originY * offscreen.height;
    const maxRadius = Math.hypot(offscreen.width, offscreen.height) * 1.3;

    const coreGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, maxRadius * 0.45);
    coreGrad.addColorStop(0, rayColor);
    coreGrad.addColorStop(0.2, glowColor);
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(ox, oy, maxRadius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const rayWidth = (0.035 + Math.sin(i * 3.7) * 0.018) * exposure;

      const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, maxRadius);
      grad.addColorStop(0, rayColor);
      grad.addColorStop(0.3, glowColor);
      grad.addColorStop(decay * 0.8, 'rgba(255, 255, 255, 0.05)');
      grad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.globalAlpha = Math.min(1, 0.35 * exposure);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.arc(ox, oy, maxRadius, angle - rayWidth, angle + rayWidth);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    if (particles && particleCount > 0) {
      ctx.save();
      for (let i = 0; i < particleCount; i++) {
        const px = ((Math.sin(i * 99 + 1) * 0.5 + 0.5) * offscreen.width);
        const py = ((Math.cos(i * 33 + 2) * 0.5 + 0.5) * offscreen.height);
        const dist = Math.hypot(px - ox, py - oy);
        const alpha = Math.max(0.1, (1 - dist / maxRadius) * 0.85);
        const size = (1 + (i % 3)) * scale;

        ctx.fillStyle = rayColor;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    const a = document.createElement('a');
    a.download = `god-rays-${dimensions.width * scale}x${dimensions.height * scale}-${Date.now()}.png`;
    a.href = offscreen.toDataURL('image/png');
    a.click();

    confetti({ particleCount: 50, spread: 60 });
    setIsExportModalOpen(false);
  };

  const allPresets = presetTab === 'curated' ? CURATED_GODRAYS_PRESETS : customPresets;
  const filteredPresets = allPresets.filter((p) =>
    p.name.toLowerCase().includes(searchPreset.toLowerCase())
  );

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#0e0f14] text-[#f2f2f5] relative">
      {isLeftCollapsed ? (
        <div className="w-10 h-full shrink-0 border-r border-[#23242c] bg-[#16171d] flex flex-col items-center py-4 z-20">
          <button
            type="button"
            onClick={() => setIsLeftCollapsed(false)}
            className="p-1.5 rounded-lg text-[#8f94a8] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
            title="Expand controls"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <aside className="w-80 h-full min-h-0 shrink-0 border-r border-[#23242c] bg-[#16171d] flex flex-col z-20 overflow-y-auto overflow-x-hidden custom-scrollbar overscroll-contain pb-12 relative">
          <div className="p-3.5 border-b border-[#23242c] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#fbbf24]" />
              <span className="text-xs font-bold text-[#f2f2f5] tracking-wide uppercase">
                God Rays Generator
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsLeftCollapsed(true)}
              className="p-1 rounded-lg text-[#686c82] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col w-full min-h-max divide-y divide-[#23242c]">
            <div className="p-3.5 flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">
                  Light Source Position
                </span>
                <button
                  type="button"
                  onClick={randomizeOrigin}
                  className="p-1.5 rounded-lg bg-[#23242c] hover:bg-[#2e303d] text-[#8f94a8] hover:text-[#f2f2f5] transition-colors cursor-pointer"
                  title="Randomize light position"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8f94a8]">X Position</span>
                    <span className="font-mono font-bold text-[#f2f2f5]">{Math.round(originX * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={originX}
                    onChange={(e) => setOriginX(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#fbbf24]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8f94a8]">Y Position</span>
                    <span className="font-mono font-bold text-[#f2f2f5]">{Math.round(originY * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={originY}
                    onChange={(e) => setOriginY(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#fbbf24]"
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 flex flex-col gap-3.5">
              <button
                type="button"
                onClick={() => toggleSection('light')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:text-[#f2f2f5] cursor-pointer"
              >
                <span>Ray Beam Parameters</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.light ? 'rotate-180' : ''}`} />
              </button>

              {openSections.light && (
                <div className="flex flex-col gap-3.5 pt-1">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Ray Density</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{rayCount} beams</span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={96}
                      step={2}
                      value={rayCount}
                      onChange={(e) => setRayCount(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#fbbf24]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Light Intensity</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{exposure.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.4}
                      max={2.5}
                      step={0.1}
                      value={exposure}
                      onChange={(e) => setExposure(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#fbbf24]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Beam Dispersion / Falloff</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{Math.round(decay * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={0.99}
                      step={0.01}
                      value={decay}
                      onChange={(e) => setDecay(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#fbbf24]"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3.5 flex flex-col gap-3.5">
              <button
                type="button"
                onClick={() => toggleSection('colors')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:text-[#f2f2f5] cursor-pointer"
              >
                <span>Colors & Atmosphere</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.colors ? 'rotate-180' : ''}`} />
              </button>

              {openSections.colors && (
                <div className="flex flex-col gap-3.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#8f94a8]">Ray Core Color</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={rayColor}
                        onChange={(e) => setRayColor(e.target.value)}
                        className="w-7 h-7 rounded-lg border border-[#2e303b] bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-xs text-[#f2f2f5] uppercase">{rayColor}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#8f94a8]">Atmosphere Glow</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={glowColor}
                        onChange={(e) => setGlowColor(e.target.value)}
                        className="w-7 h-7 rounded-lg border border-[#2e303b] bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-xs text-[#f2f2f5] uppercase">{glowColor}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#8f94a8]">Sky Backdrop</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-7 h-7 rounded-lg border border-[#2e303b] bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-xs text-[#f2f2f5] uppercase">{bgColor}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-[#23242c] border border-[#2e303b]">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#f2f2f5]">Dust Motes / Particles</span>
                        <span className="text-[10px] text-[#8f94a8]">Atmospheric scatter</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setParticles(!particles)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          particles ? 'bg-[#fbbf24]' : 'bg-[#16171d]'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                            particles ? 'left-6' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>

                    {particles && (
                      <div className="flex flex-col gap-1 pt-1 border-t border-[#2e303b]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#8f94a8]">Density</span>
                          <span className="font-mono font-bold text-[#f2f2f5]">{particleCount}</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={200}
                          step={10}
                          value={particleCount}
                          onChange={(e) => setParticleCount(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-[#16171d] rounded-full appearance-none cursor-pointer accent-[#fbbf24]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3.5 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">
                Aspect Ratio
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {ASPECT_PRESETS.map((ap) => {
                  const isActive = dimensions.label === ap.id;
                  return (
                    <button
                      key={ap.id}
                      type="button"
                      onClick={() => setDimensions({ width: ap.width, height: ap.height, label: ap.id })}
                      className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#fbbf24] bg-[#fbbf24]/15 text-[#fbbf24] shadow-xs'
                          : 'border-[#2e303b] bg-[#23242c] text-[#8f94a8] hover:text-[#f2f2f5]'
                      }`}
                    >
                      {ap.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Central Canvas Viewport */}
      <main className="relative flex-1 h-full studio-grid-bg flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none">
        {/* Top Floating Action Bar */}
        <div className="z-10 shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={randomizeOrigin}
            className="studio-btn studio-btn-secondary"
            title="Randomize light origin (Space)"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>Randomize</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="studio-btn studio-btn-primary"
            title="Export 4K PNG"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>

        {/* Center Canvas Framing with Draggable Origin Pin */}
        <div className="relative w-full flex-1 max-w-4xl flex items-center justify-center min-h-0 my-2">
          <div
            ref={containerRef}
            onPointerMove={handlePointerMoveContainer}
            onPointerUp={handlePointerUpContainer}
            className="relative max-w-full max-h-full rounded-2xl border border-[#2e303b] shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 bg-[#16171d] group cursor-crosshair select-none"
            style={{
              aspectRatio: `${dimensions.width} / ${dimensions.height}`
            }}
          >
            <canvas
              ref={canvasRef}
              width={dimensions.width}
              height={dimensions.height}
              className="w-full h-full object-contain block pointer-events-none"
            />

            {/* Draggable Sun Pin */}
            <div
              onPointerDown={handlePointerDownOrigin}
              style={{
                left: `${originX * 100}%`,
                top: `${originY * 100}%`
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-grab active:cursor-grabbing flex items-center justify-center transition-transform ${
                isDraggingOrigin ? 'scale-125' : 'hover:scale-115'
              }`}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white ring-4 ring-[#fbbf24]/60 shadow-[0_0_20px_rgba(251,191,36,0.9)] bg-[#16171d]/90">
                <Sun className="w-4 h-4 text-[#fbbf24]" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Toolbar & Feedback */}
        <div className="w-full shrink-0 flex items-center justify-between text-xs text-[#686c82] px-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8f94a8]">Drag the glowing sun to reposition light source</span>
          </div>
          <div className="font-mono text-[10px] text-[#686c82]">
            {dimensions.width} × {dimensions.height} ({dimensions.label})
          </div>
        </div>
      </main>

      {/* 3. Right Presets Sidebar */}
      {isRightCollapsed ? (
        <div className="w-10 h-full shrink-0 border-l border-[#23242c] bg-[#16171d] flex flex-col items-center py-4 z-20">
          <button
            type="button"
            onClick={() => setIsRightCollapsed(false)}
            className="p-1.5 rounded-lg text-[#8f94a8] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
            title="Expand presets"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <aside className="w-72 h-full min-h-0 shrink-0 border-l border-[#23242c] bg-[#16171d] flex flex-col z-20 overflow-hidden select-none">
          {/* Header */}
          <div className="p-3.5 shrink-0 border-b border-[#23242c] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">Presets</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={saveCurrentAsPreset}
                  title="Save current look"
                  className="p-1 rounded-lg hover:bg-[#23242c] text-[#8f94a8] hover:text-[#f2f2f5] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsRightCollapsed(true)}
                  title="Collapse presets"
                  className="p-1 rounded-lg hover:bg-[#23242c] text-[#686c82] hover:text-[#f2f2f5] transition-colors cursor-pointer ml-1"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tab switch */}
            <div className="grid grid-cols-2 p-0.5 rounded-full bg-[#23242c] border border-[#2e303b] text-xs">
              <button
                type="button"
                onClick={() => setPresetTab('curated')}
                className={`py-1 rounded-full transition-all cursor-pointer ${
                  presetTab === 'curated'
                    ? 'bg-[#16171d] text-[#f2f2f5] shadow-xs font-semibold'
                    : 'text-[#8f94a8] hover:text-[#f2f2f5]'
                }`}
              >
                Curated ({CURATED_GODRAYS_PRESETS.length})
              </button>
              <button
                type="button"
                onClick={() => setPresetTab('saved')}
                className={`py-1 rounded-full transition-all cursor-pointer ${
                  presetTab === 'saved'
                    ? 'bg-[#16171d] text-[#f2f2f5] shadow-xs font-semibold'
                    : 'text-[#8f94a8] hover:text-[#f2f2f5]'
                }`}
              >
                Saved ({customPresets.length})
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search god ray looks..."
              value={searchPreset}
              onChange={(e) => setSearchPreset(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] placeholder-[#686c82] outline-none focus:border-[#fbbf24]"
            />
          </div>

          {/* Presets Grid */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 grid grid-cols-2 auto-rows-max gap-2.5 custom-scrollbar overscroll-contain pb-10">
            {filteredPresets.map((preset) => {
              const isSelected = selectedPresetId === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`group relative p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'border-[#fbbf24] bg-[#fbbf24]/15 ring-2 ring-[#fbbf24]/40 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                      : 'border-[#2e303b] hover:border-[#484b5c] bg-[#1a1b24] hover:bg-[#20222d]'
                  }`}
                >
                  {/* Thumbnail Swatch */}
                  <div
                    className="w-full aspect-[4/3] rounded-lg shadow-inner shrink-0 border border-black/30 group-hover:scale-102 transition-transform overflow-hidden relative"
                    style={{
                      backgroundColor: preset.bgColor,
                      backgroundImage: `radial-gradient(circle at ${preset.originX * 100}% ${preset.originY * 100}%, ${preset.rayColor}, ${preset.glowColor || 'transparent'} 50%, transparent 80%)`
                    }}
                  />

                  {/* Info */}
                  <div className="w-full flex flex-col items-center px-0.5 pb-0.5">
                    <span className="text-[10px] font-semibold text-[#8f94a8] group-hover:text-[#f2f2f5] truncate leading-tight text-center w-full">
                      {preset.name}
                    </span>
                  </div>

                  {presetTab === 'saved' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCustomPreset(preset.id);
                      }}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-white bg-black/70 hover:bg-red-500 transition-all rounded-md"
                      title="Delete preset"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#16171d] rounded-2xl shadow-2xl border border-[#2e303b] overflow-hidden flex flex-col text-[#f2f2f5]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#23242c]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#fbbf24]/15 text-[#fbbf24] flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#f2f2f5]">Export God Rays</h3>
                  <p className="text-xs text-[#8f94a8]">Download Ultra-HD PNG resolution</p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="p-1 rounded-lg text-[#686c82] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-[#8f94a8]">Resolution Scale</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { scale: 1, label: '1x (FHD)' },
                    { scale: 2, label: '2x (2K/Retina)' },
                    { scale: 4, label: '4x (4K Ultra)' }
                  ].map((item) => (
                    <button
                      key={item.scale}
                      type="button"
                      onClick={() => exportPngHighRes(item.scale)}
                      className="py-2.5 px-3 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#fbbf24] text-xs font-semibold text-[#f2f2f5] flex flex-col items-center gap-0.5 transition-all cursor-pointer"
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-[#8f94a8] font-mono">
                        {dimensions.width * item.scale}×{dimensions.height * item.scale}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

