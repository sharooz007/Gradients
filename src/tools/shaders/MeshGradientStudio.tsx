import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download,
  Check,
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Palette,
  Shuffle,
  FileCode,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MeshPoint {
  id: string;
  x: number; // 0 to 1
  y: number; // 0 to 1
  color: string;
  opacity: number;
  radius: number; // 0.2 to 1.0
}

interface MeshPreset {
  id: string;
  name: string;
  bgColor: string;
  blurRadius: number;
  points: { x: number; y: number; color: string; opacity: number; radius?: number }[];
}

const CURATED_MESH_PRESETS: MeshPreset[] = [
  {
    id: 'cosmic-nebula',
    name: 'Cosmic Nebula',
    bgColor: '#0b0c10',
    blurRadius: 90,
    points: [
      { x: 0.2, y: 0.2, color: '#3b82f6', opacity: 1, radius: 0.6 },
      { x: 0.8, y: 0.25, color: '#ec4899', opacity: 1, radius: 0.55 },
      { x: 0.25, y: 0.8, color: '#8b5cf6', opacity: 1, radius: 0.65 },
      { x: 0.8, y: 0.8, color: '#10b981', opacity: 0.9, radius: 0.5 },
      { x: 0.5, y: 0.5, color: '#f59e0b', opacity: 0.85, radius: 0.5 }
    ]
  },
  {
    id: 'sunset-blush',
    name: 'Sunset Blush',
    bgColor: '#180a0a',
    blurRadius: 85,
    points: [
      { x: 0.15, y: 0.3, color: '#ff4b72', opacity: 1, radius: 0.6 },
      { x: 0.85, y: 0.2, color: '#ff8f3d', opacity: 1, radius: 0.65 },
      { x: 0.5, y: 0.8, color: '#7928ca', opacity: 1, radius: 0.7 },
      { x: 0.5, y: 0.35, color: '#ffd000', opacity: 0.85, radius: 0.45 }
    ]
  },
  {
    id: 'neon-mirage',
    name: 'Neon Mirage',
    bgColor: '#060814',
    blurRadius: 75,
    points: [
      { x: 0.1, y: 0.5, color: '#00f2fe', opacity: 1, radius: 0.6 },
      { x: 0.9, y: 0.5, color: '#4facfe', opacity: 1, radius: 0.6 },
      { x: 0.5, y: 0.15, color: '#fa709a', opacity: 1, radius: 0.55 },
      { x: 0.5, y: 0.85, color: '#fee140', opacity: 0.9, radius: 0.5 }
    ]
  },
  {
    id: 'emerald-dream',
    name: 'Emerald Dream',
    bgColor: '#03140d',
    blurRadius: 95,
    points: [
      { x: 0.2, y: 0.3, color: '#059669', opacity: 1, radius: 0.65 },
      { x: 0.8, y: 0.2, color: '#10b981', opacity: 1, radius: 0.6 },
      { x: 0.3, y: 0.8, color: '#064e3b', opacity: 1, radius: 0.7 },
      { x: 0.75, y: 0.75, color: '#34d399', opacity: 0.9, radius: 0.55 },
      { x: 0.5, y: 0.45, color: '#a7f3d0', opacity: 0.75, radius: 0.4 }
    ]
  },
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    bgColor: '#030712',
    blurRadius: 90,
    points: [
      { x: 0.1, y: 0.2, color: '#1e3a8a', opacity: 1, radius: 0.7 },
      { x: 0.9, y: 0.2, color: '#0284c7', opacity: 1, radius: 0.6 },
      { x: 0.2, y: 0.85, color: '#0f766e', opacity: 1, radius: 0.65 },
      { x: 0.85, y: 0.85, color: '#06b6d4', opacity: 0.95, radius: 0.55 },
      { x: 0.5, y: 0.5, color: '#38bdf8', opacity: 0.8, radius: 0.45 }
    ]
  },
  {
    id: 'pastel-wave',
    name: 'Pastel Wave',
    bgColor: '#161320',
    blurRadius: 100,
    points: [
      { x: 0.2, y: 0.3, color: '#c084fc', opacity: 0.9, radius: 0.6 },
      { x: 0.8, y: 0.2, color: '#f472b6', opacity: 0.9, radius: 0.6 },
      { x: 0.3, y: 0.8, color: '#38bdf8', opacity: 0.9, radius: 0.65 },
      { x: 0.8, y: 0.8, color: '#a7f3d0', opacity: 0.85, radius: 0.55 }
    ]
  },
  {
    id: 'velvet-midnight',
    name: 'Velvet Midnight',
    bgColor: '#0a0518',
    blurRadius: 85,
    points: [
      { x: 0.15, y: 0.15, color: '#6366f1', opacity: 1, radius: 0.65 },
      { x: 0.85, y: 0.2, color: '#a855f7', opacity: 1, radius: 0.6 },
      { x: 0.2, y: 0.8, color: '#ec4899', opacity: 1, radius: 0.6 },
      { x: 0.8, y: 0.85, color: '#3b82f6', opacity: 0.9, radius: 0.55 },
      { x: 0.5, y: 0.5, color: '#e879f9', opacity: 0.8, radius: 0.45 }
    ]
  },
  {
    id: 'citrus-pop',
    name: 'Citrus Pop',
    bgColor: '#1c1103',
    blurRadius: 80,
    points: [
      { x: 0.2, y: 0.2, color: '#eab308', opacity: 1, radius: 0.6 },
      { x: 0.8, y: 0.3, color: '#f97316', opacity: 1, radius: 0.65 },
      { x: 0.3, y: 0.8, color: '#ef4444', opacity: 1, radius: 0.6 },
      { x: 0.8, y: 0.8, color: '#84cc16', opacity: 0.9, radius: 0.5 }
    ]
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Glow',
    bgColor: '#05050d',
    blurRadius: 70,
    points: [
      { x: 0.1, y: 0.2, color: '#ff0055', opacity: 1, radius: 0.55 },
      { x: 0.9, y: 0.2, color: '#00ffff', opacity: 1, radius: 0.55 },
      { x: 0.2, y: 0.8, color: '#7928ca', opacity: 1, radius: 0.65 },
      { x: 0.8, y: 0.8, color: '#ff007f', opacity: 0.95, radius: 0.5 },
      { x: 0.5, y: 0.5, color: '#00e5ff', opacity: 0.85, radius: 0.45 }
    ]
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora Borealis',
    bgColor: '#020d18',
    blurRadius: 90,
    points: [
      { x: 0.2, y: 0.25, color: '#10b981', opacity: 1, radius: 0.6 },
      { x: 0.75, y: 0.2, color: '#06b6d4', opacity: 1, radius: 0.65 },
      { x: 0.3, y: 0.75, color: '#8b5cf6', opacity: 0.9, radius: 0.65 },
      { x: 0.85, y: 0.8, color: '#3b82f6', opacity: 0.85, radius: 0.55 },
      { x: 0.5, y: 0.45, color: '#6ee7b7', opacity: 0.8, radius: 0.4 }
    ]
  },
  {
    id: 'cotton-candy',
    name: 'Cotton Candy',
    bgColor: '#140c18',
    blurRadius: 95,
    points: [
      { x: 0.2, y: 0.3, color: '#f472b6', opacity: 1, radius: 0.6 },
      { x: 0.8, y: 0.25, color: '#60a5fa', opacity: 1, radius: 0.6 },
      { x: 0.3, y: 0.8, color: '#c084fc', opacity: 0.95, radius: 0.65 },
      { x: 0.75, y: 0.75, color: '#fbcfe8', opacity: 0.8, radius: 0.5 }
    ]
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    bgColor: '#190e05',
    blurRadius: 85,
    points: [
      { x: 0.15, y: 0.2, color: '#f59e0b', opacity: 1, radius: 0.65 },
      { x: 0.85, y: 0.2, color: '#ea580c', opacity: 1, radius: 0.6 },
      { x: 0.3, y: 0.8, color: '#b45309', opacity: 0.95, radius: 0.65 },
      { x: 0.8, y: 0.8, color: '#fde047', opacity: 0.85, radius: 0.5 }
    ]
  }
];

const ASPECT_PRESETS = [
  { id: '16:9', label: '16:9', width: 1920, height: 1080 },
  { id: '1:1', label: '1:1 Square', width: 1400, height: 1400 },
  { id: '9:16', label: '9:16 Story', width: 1080, height: 1920 },
  { id: '4:3', label: '4:3 Standard', width: 1600, height: 1200 },
  { id: 'banner', label: 'Banner', width: 1500, height: 500 }
];

export const MeshGradientStudio: React.FC = () => {
  const [points, setPoints] = useState<MeshPoint[]>(
    CURATED_MESH_PRESETS[0].points.map((p, i) => ({
      id: `p-${i + 1}`,
      x: p.x,
      y: p.y,
      color: p.color,
      opacity: p.opacity,
      radius: p.radius || 0.5
    }))
  );
  const [bgColor, setBgColor] = useState<string>(CURATED_MESH_PRESETS[0].bgColor);
  const [blurRadius, setBlurRadius] = useState<number>(CURATED_MESH_PRESETS[0].blurRadius);
  const [activePointId, setActivePointId] = useState<string>('p-1');
  const [grainEnabled, setGrainEnabled] = useState<boolean>(false);
  const [grainIntensity, setGrainIntensity] = useState<number>(0.08);

  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080, label: '16:9' });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('cosmic-nebula');
  const [searchPreset, setSearchPreset] = useState('');
  const [presetTab, setPresetTab] = useState<'curated' | 'saved'>('curated');
  const [customPresets, setCustomPresets] = useState<MeshPreset[]>([]);
  const [copiedCss, setCopiedCss] = useState(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    points: true,
    activePoint: true,
    global: true,
    canvas: false
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);

  // Load custom presets from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('magic_custom_mesh_presets');
      if (saved) setCustomPresets(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Render Mesh Gradient to Canvas
  const renderMesh = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear and fill background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    // Save state for blur filtering
    ctx.save();
    // Scale blur relative to canvas resolution
    const scaleFactor = Math.min(w, h) / 1000;
    ctx.filter = `blur(${Math.max(10, blurRadius * scaleFactor)}px)`;

    // Draw each point as a soft radial gradient
    points.forEach((p) => {
      const px = p.x * w;
      const py = p.y * h;
      const baseRadius = Math.max(w, h) * (p.radius || 0.55);

      const grad = ctx.createRadialGradient(px, py, 0, px, py, baseRadius);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, 'transparent');

      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, baseRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();

    // Optional Grain Overlay
    if (grainEnabled && grainIntensity > 0) {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      const amount = grainIntensity * 255;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * amount;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imgData, 0, 0);
    }
  }, [points, bgColor, blurRadius, grainEnabled, grainIntensity]);

  useEffect(() => {
    renderMesh();
  }, [renderMesh]);

  // Pointer dragging on canvas pins
  const handlePointerDownPin = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(id);
    setActivePointId(id);
  };

  const handlePointerMoveContainer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0.02, Math.min(0.98, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0.02, Math.min(0.98, (e.clientY - rect.top) / rect.height));

    setPoints((prev) =>
      prev.map((p) => (p.id === isDragging ? { ...p, x, y } : p))
    );
  };

  const handlePointerUpContainer = () => {
    setIsDragging(null);
  };

  const addPoint = () => {
    if (points.length >= 12) return;
    const newId = `p-${Date.now()}`;
    const vibrantColors = [
      '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b',
      '#06b6d4', '#f43f5e', '#a855f7', '#6366f1', '#14b8a6'
    ];
    const newPoint: MeshPoint = {
      id: newId,
      x: 0.25 + Math.random() * 0.5,
      y: 0.25 + Math.random() * 0.5,
      color: vibrantColors[points.length % vibrantColors.length],
      opacity: 1,
      radius: 0.5
    };
    setPoints([...points, newPoint]);
    setActivePointId(newId);
  };

  const removePoint = (id: string) => {
    if (points.length <= 2) return;
    const remaining = points.filter((p) => p.id !== id);
    setPoints(remaining);
    setActivePointId(remaining[0].id);
  };

  const randomizePositions = () => {
    setPoints((prev) =>
      prev.map((p) => ({
        ...p,
        x: 0.1 + Math.random() * 0.8,
        y: 0.1 + Math.random() * 0.8
      }))
    );
  };

  const shufflePalette = () => {
    const randomPreset = CURATED_MESH_PRESETS[Math.floor(Math.random() * CURATED_MESH_PRESETS.length)];
    setPoints((prev) =>
      prev.map((p, i) => ({
        ...p,
        color: randomPreset.points[i % randomPreset.points.length].color
      }))
    );
  };

  const applyPreset = (preset: MeshPreset) => {
    setSelectedPresetId(preset.id);
    setBgColor(preset.bgColor);
    setBlurRadius(preset.blurRadius);
    setPoints(
      preset.points.map((p, i) => ({
        id: `p-${i + 1}`,
        x: p.x,
        y: p.y,
        color: p.color,
        opacity: p.opacity,
        radius: p.radius || 0.5
      }))
    );
    setActivePointId('p-1');
  };

  const saveCurrentAsPreset = () => {
    const name = prompt('Enter preset name:', `Mesh Look #${customPresets.length + 1}`);
    if (!name) return;
    const newPreset: MeshPreset = {
      id: `custom-${Date.now()}`,
      name,
      bgColor,
      blurRadius,
      points: points.map((p) => ({ x: p.x, y: p.y, color: p.color, opacity: p.opacity, radius: p.radius }))
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_mesh_presets', JSON.stringify(updated));
    setSelectedPresetId(newPreset.id);
    confetti({ particleCount: 40, spread: 60 });
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_mesh_presets', JSON.stringify(updated));
  };

  const exportPngHighRes = (scale: number = 2) => {
    const offscreen = document.createElement('canvas');
    offscreen.width = dimensions.width * scale;
    offscreen.height = dimensions.height * scale;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, offscreen.width, offscreen.height);

    ctx.save();
    const scaleFactor = Math.min(offscreen.width, offscreen.height) / 1000;
    ctx.filter = `blur(${Math.max(10, blurRadius * scaleFactor)}px)`;

    points.forEach((p) => {
      const px = p.x * offscreen.width;
      const py = p.y * offscreen.height;
      const baseRadius = Math.max(offscreen.width, offscreen.height) * (p.radius || 0.55);

      const grad = ctx.createRadialGradient(px, py, 0, px, py, baseRadius);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, 'transparent');

      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, baseRadius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    const a = document.createElement('a');
    a.download = `mesh-gradient-${dimensions.width * scale}x${dimensions.height * scale}-${Date.now()}.png`;
    a.href = offscreen.toDataURL('image/png');
    a.click();

    confetti({ particleCount: 50, spread: 60 });
    setIsExportModalOpen(false);
  };

  const copyCssGradient = () => {
    const stops = points
      .map(
        (p) =>
          `radial-gradient(at ${Math.round(p.x * 100)}% ${Math.round(p.y * 100)}%, ${p.color} 0px, transparent ${Math.round((p.radius || 0.5) * 100)}%)`
      )
      .join(',\n    ');

    const cssCode = `/* Mesh Gradient CSS */
.mesh-gradient-bg {
  background-color: ${bgColor};
  background-image:
    ${stops};
}`;

    navigator.clipboard.writeText(cssCode);
    setCopiedCss(true);
    confetti({ particleCount: 30, spread: 45 });
    setTimeout(() => setCopiedCss(false), 2500);
  };

  const activePoint = points.find((p) => p.id === activePointId) || points[0];
  const allPresets = presetTab === 'curated' ? CURATED_MESH_PRESETS : customPresets;
  const filteredPresets = allPresets.filter((p) =>
    p.name.toLowerCase().includes(searchPreset.toLowerCase())
  );

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#0e0f14] text-[#f2f2f5] relative">
      {/* 1. Left Control Sidebar */}
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
          {/* Header */}
          <div className="p-3.5 border-b border-[#23242c] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#818cf8]" />
              <span className="text-xs font-bold text-[#f2f2f5] tracking-wide uppercase">
                Mesh Gradients
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
            {/* Section 1: Mesh Points Swatches & Actions */}
            <div className="p-3.5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">
                  Mesh Points ({points.length}/12)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={randomizePositions}
                    className="p-1.5 rounded-lg bg-[#23242c] hover:bg-[#2e303d] text-[#8f94a8] hover:text-[#f2f2f5] transition-colors cursor-pointer"
                    title="Randomize Pin Positions (Space)"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={shufflePalette}
                    className="p-1.5 rounded-lg bg-[#23242c] hover:bg-[#2e303d] text-[#8f94a8] hover:text-[#f2f2f5] transition-colors cursor-pointer"
                    title="Shuffle Palette Colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#818cf8]" />
                  </button>
                  <button
                    type="button"
                    onClick={addPoint}
                    disabled={points.length >= 12}
                    className="p-1.5 rounded-lg bg-[#6268f8] hover:bg-[#777dfb] text-white disabled:opacity-30 transition-all cursor-pointer shadow-[0_0_8px_rgba(98,104,248,0.4)]"
                    title="Add Mesh Point"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Point Swatches Grid */}
              <div className="grid grid-cols-6 gap-2">
                {points.map((p, idx) => {
                  const isSelected = p.id === activePointId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePointId(p.id)}
                      className={`relative aspect-square rounded-xl border transition-all flex items-center justify-center font-extrabold text-xs cursor-pointer shadow-sm ${
                        isSelected
                          ? 'border-white ring-2 ring-[#6268f8] scale-110 shadow-[0_0_12px_rgba(98,104,248,0.8)] text-white'
                          : 'border-black/30 hover:scale-105 text-white/90'
                      }`}
                      style={{ backgroundColor: p.color }}
                      title={`Point #${idx + 1} (${p.color})`}
                    >
                      <span className="drop-shadow-sm">{idx + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Active Point Customization */}
            {activePoint && (
              <div className="p-3.5 flex flex-col gap-3.5 bg-[#1a1b24]/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#f2f2f5] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activePoint.color }} />
                    Point #{points.findIndex((p) => p.id === activePoint.id) + 1} Settings
                  </span>
                  {points.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removePoint(activePoint.id)}
                      className="p-1 text-[#686c82] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete this point"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Color Hex Input & Swatch */}
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[#2e303b] shadow-inner shrink-0 cursor-pointer">
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
                      className="absolute -inset-2 w-16 h-16 cursor-pointer border-none bg-transparent"
                    />
                  </div>
                  <input
                    type="text"
                    value={activePoint.color.toUpperCase()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPoints((prev) =>
                        prev.map((p) =>
                          p.id === activePoint.id ? { ...p, color: val } : p
                        )
                      );
                    }}
                    className="flex-1 px-3 py-2 text-xs font-mono font-semibold uppercase bg-[#23242c] rounded-xl border border-[#2e303b] text-[#f2f2f5] outline-none focus:border-[#6268f8]"
                  />
                </div>

                {/* Opacity Slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#8f94a8]">Opacity</span>
                    <span className="font-mono font-bold text-[#f2f2f5]">
                      {Math.round(activePoint.opacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={activePoint.opacity}
                    onChange={(e) => {
                      const op = parseFloat(e.target.value);
                      setPoints((prev) =>
                        prev.map((p) =>
                          p.id === activePoint.id ? { ...p, opacity: op } : p
                        )
                      );
                    }}
                    className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#6268f8]"
                  />
                </div>

                {/* Radius Influence Slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#8f94a8]">Radius / Influence</span>
                    <span className="font-mono font-bold text-[#f2f2f5]">
                      {Math.round((activePoint.radius || 0.5) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={1.0}
                    step={0.02}
                    value={activePoint.radius || 0.5}
                    onChange={(e) => {
                      const rad = parseFloat(e.target.value);
                      setPoints((prev) =>
                        prev.map((p) =>
                          p.id === activePoint.id ? { ...p, radius: rad } : p
                        )
                      );
                    }}
                    className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#6268f8]"
                  />
                </div>
              </div>
            )}

            {/* Section 3: Global Mesh Controls */}
            <div className="p-3.5 flex flex-col gap-3.5">
              <button
                type="button"
                onClick={() => toggleSection('global')}
                className="w-full flex items-center justify-between text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase hover:text-[#f2f2f5] cursor-pointer"
              >
                <span>Global Canvas Controls</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections.global ? 'rotate-180' : ''}`} />
              </button>

              {openSections.global && (
                <div className="flex flex-col gap-3.5 pt-1">
                  {/* Blur Softness */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#8f94a8]">Blur Softness</span>
                      <span className="font-mono font-bold text-[#f2f2f5]">{blurRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={220}
                      step={5}
                      value={blurRadius}
                      onChange={(e) => setBlurRadius(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#23242c] rounded-full appearance-none cursor-pointer accent-[#6268f8]"
                    />
                  </div>

                  {/* Background Color */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#8f94a8]">Base Canvas Color</span>
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

                  {/* Grain Overlay */}
                  <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-[#23242c] border border-[#2e303b]">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#f2f2f5]">Film Grain Overlay</span>
                        <span className="text-[10px] text-[#8f94a8]">Analog texture noise</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGrainEnabled(!grainEnabled)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          grainEnabled ? 'bg-[#6268f8]' : 'bg-[#16171d]'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                            grainEnabled ? 'left-6' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    {grainEnabled && (
                      <div className="flex flex-col gap-1 pt-1 border-t border-[#2e303b]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#8f94a8]">Intensity</span>
                          <span className="font-mono font-bold text-[#f2f2f5]">{Math.round(grainIntensity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0.02}
                          max={0.25}
                          step={0.01}
                          value={grainIntensity}
                          onChange={(e) => setGrainIntensity(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-[#16171d] rounded-full appearance-none cursor-pointer accent-[#6268f8]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Canvas Dimensions & Ratio */}
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
                          ? 'border-[#6268f8] bg-[#6268f8]/15 text-[#818cf8] shadow-xs'
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
            onClick={randomizePositions}
            className="studio-btn studio-btn-secondary"
            title="Randomize pin positions (Space)"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#818cf8]" />
            <span>Randomize</span>
          </button>
          <button
            type="button"
            onClick={copyCssGradient}
            className="studio-btn studio-btn-secondary"
            title="Copy CSS radial-gradient to clipboard"
          >
            {copiedCss ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
            <span>{copiedCss ? 'Copied CSS!' : 'Copy CSS'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="studio-btn studio-btn-primary"
            title="Export 4K PNG or SVG"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>

        {/* Center Canvas Framing with Draggable Pins */}
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
            {/* 2D Canvas */}
            <canvas
              ref={canvasRef}
              width={dimensions.width}
              height={dimensions.height}
              className="w-full h-full object-contain block pointer-events-none"
            />

            {/* Draggable Numbered Glowing Pins */}
            {points.map((p, idx) => {
              const isSelected = p.id === activePointId;
              const isDrag = p.id === isDragging;

              return (
                <div
                  key={p.id}
                  onPointerDown={(e) => handlePointerDownPin(p.id, e)}
                  style={{
                    left: `${p.x * 100}%`,
                    top: `${p.y * 100}%`
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-grab active:cursor-grabbing flex items-center justify-center transition-transform ${
                    isDrag ? 'scale-125' : isSelected ? 'scale-110' : 'hover:scale-115'
                  }`}
                >
                  {/* Outer Glowing Halo */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all shadow-md ${
                      isSelected
                        ? 'border-white ring-4 ring-[#6268f8]/60 shadow-[0_0_16px_rgba(98,104,248,0.9)] bg-[#16171d]'
                        : 'border-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.6)] bg-[#16171d]/90'
                    }`}
                  >
                    {/* Inner Color Dot with Number */}
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white shadow-inner"
                      style={{ backgroundColor: p.color }}
                    >
                      {idx + 1}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Toolbar & Feedback */}
        <div className="w-full shrink-0 flex items-center justify-between text-xs text-[#686c82] px-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8f94a8]">Drag pins to shape the gradient</span>
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
                <Sparkles className="w-3.5 h-3.5 text-[#818cf8]" />
                <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">Presets</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={saveCurrentAsPreset}
                  title="Save current mesh"
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
                Curated ({CURATED_MESH_PRESETS.length})
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
              placeholder="Search mesh looks..."
              value={searchPreset}
              onChange={(e) => setSearchPreset(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] placeholder-[#686c82] outline-none focus:border-[#6268f8]"
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
                      ? 'border-[#6268f8] bg-[#6268f8]/15 ring-2 ring-[#6268f8]/40 shadow-[0_0_12px_rgba(98,104,248,0.25)]'
                      : 'border-[#2e303b] hover:border-[#484b5c] bg-[#1a1b24] hover:bg-[#20222d]'
                  }`}
                >
                  {/* Thumbnail Swatch */}
                  <div
                    className="w-full aspect-[4/3] rounded-lg shadow-inner shrink-0 border border-black/30 group-hover:scale-102 transition-transform overflow-hidden relative"
                    style={{
                      backgroundColor: preset.bgColor,
                      backgroundImage: `radial-gradient(circle at 30% 30%, ${preset.points[0]?.color || '#3b82f6'}, transparent 60%), radial-gradient(circle at 70% 70%, ${preset.points[1]?.color || '#ec4899'}, transparent 60%)`
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
                <div className="w-8 h-8 rounded-lg bg-[#6268f8]/15 text-[#818cf8] flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#f2f2f5]">Export Mesh Gradient</h3>
                  <p className="text-xs text-[#8f94a8]">Download Ultra-HD PNG or copy code</p>
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
                      className="py-2.5 px-3 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2e303d] hover:border-[#6268f8] text-xs font-semibold text-[#f2f2f5] flex flex-col items-center gap-0.5 transition-all cursor-pointer"
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-[#8f94a8] font-mono">
                        {dimensions.width * item.scale}×{dimensions.height * item.scale}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  copyCssGradient();
                  setIsExportModalOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#2e303b] bg-[#1a1b24] hover:bg-[#23242c] text-xs font-semibold text-[#f2f2f5] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-[#818cf8]" />
                <span>Copy CSS Code</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

