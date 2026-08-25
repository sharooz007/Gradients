import React, { useState, useEffect } from 'react';
import {
  Wand2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Plus,
  Trash2,
  FileCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

interface TailwindPreset {
  id: string;
  name: string;
  hex: string;
}

const CURATED_TAILWIND_PRESETS: TailwindPreset[] = [
  { id: 'indigo-electric', name: 'Electric Indigo', hex: '#6366f1' },
  { id: 'sky-blue', name: 'Sky Cyan', hex: '#0284c7' },
  { id: 'emerald-green', name: 'Emerald Mint', hex: '#10b981' },
  { id: 'rose-red', name: 'Rose Petal', hex: '#f43f5e' },
  { id: 'violet-purple', name: 'Deep Violet', hex: '#8b5cf6' },
  { id: 'amber-gold', name: 'Solar Amber', hex: '#f59e0b' }
];

export const TailwindPaletteStudio: React.FC = () => {
  const [baseColor, setBaseColor] = useState<string>(CURATED_TAILWIND_PRESETS[0].hex);
  const [paletteName, setPaletteName] = useState<string>('brand');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('indigo-electric');
  const [searchPreset, setSearchPreset] = useState('');
  const [presetTab, setPresetTab] = useState<'curated' | 'saved'>('curated');
  const [customPresets, setCustomPresets] = useState<TailwindPreset[]>([]);


  useEffect(() => {
    try {
      const saved = localStorage.getItem('magic_custom_tailwind_presets');
      if (saved) setCustomPresets(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const shades: Record<number, string> = {
    50: interpolateColor('#ffffff', baseColor, 0.1),
    100: interpolateColor('#ffffff', baseColor, 0.22),
    200: interpolateColor('#ffffff', baseColor, 0.4),
    300: interpolateColor('#ffffff', baseColor, 0.6),
    400: interpolateColor('#ffffff', baseColor, 0.8),
    500: baseColor,
    600: interpolateColor(baseColor, '#000000', 0.18),
    700: interpolateColor(baseColor, '#000000', 0.38),
    800: interpolateColor(baseColor, '#000000', 0.58),
    900: interpolateColor(baseColor, '#000000', 0.75),
    950: interpolateColor(baseColor, '#000000', 0.88)
  };

  const copyConfig = () => {
    const jsObj = `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        '${paletteName}': {
${SHADE_STEPS.map((step) => `          ${step}: '${shades[step]}',`).join('\n')}
        }
      }
    }
  }
};`;

    navigator.clipboard.writeText(jsObj);
    setCopiedKey('CONFIG');
    confetti({ particleCount: 30, spread: 45 });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyShade = (step: number, hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedKey(`${step}`);
    confetti({ particleCount: 15, spread: 30 });
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const randomize = () => {
    const randomHex = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    setBaseColor(randomHex);
  };

  const saveCurrentAsPreset = () => {
    const name = prompt('Enter color name:', `Tailwind Look #${customPresets.length + 1}`);
    if (!name) return;
    const newPreset: TailwindPreset = {
      id: `custom-${Date.now()}`,
      name,
      hex: baseColor
    };
    const updated = [newPreset, ...customPresets];
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_tailwind_presets', JSON.stringify(updated));
    setSelectedPresetId(newPreset.id);
    confetti({ particleCount: 40, spread: 60 });
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_tailwind_presets', JSON.stringify(updated));
  };

  const allPresets = presetTab === 'curated' ? CURATED_TAILWIND_PRESETS : customPresets;
  const filteredPresets = allPresets.filter((p) =>
    p.name.toLowerCase().includes(searchPreset.toLowerCase())
  );

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden select-none bg-[#0e0f14] text-[#f2f2f5] relative">
      {isLeftCollapsed ? (
        <div className="w-10 h-full shrink-0 border-r border-[#23242c] bg-[#16171d] flex flex-col items-center py-4 z-20">
          <button type="button" onClick={() => setIsLeftCollapsed(false)} className="p-1.5 rounded-lg text-[#8f94a8] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <aside className="w-80 h-full min-h-0 shrink-0 border-r border-[#23242c] bg-[#16171d] flex flex-col z-20 overflow-y-auto custom-scrollbar">
          <div className="p-3.5 border-b border-[#23242c] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-[#38bdf8]" />
              <span className="text-xs font-bold text-[#f2f2f5] uppercase tracking-wide">Tailwind Palette</span>
            </div>
            <button type="button" onClick={() => setIsLeftCollapsed(true)} className="p-1 rounded-lg text-[#686c82] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3.5 flex flex-col gap-3">
            <span className="text-[11px] font-bold text-[#8f94a8] uppercase">Anchor (500)</span>
            <div className="flex items-center gap-3">
              <input type="color" value={baseColor} onChange={(e) => setBaseColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer border border-[#2e303b] p-0.5 bg-transparent" />
              <input type="text" value={baseColor.toUpperCase()} onChange={(e) => setBaseColor(e.target.value)} className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] outline-none" />
            </div>
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-[11px] font-bold text-[#8f94a8] uppercase">Color Key Name</span>
              <input type="text" value={paletteName} onChange={(e) => setPaletteName(e.target.value)} className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] outline-none" placeholder="brand" />
            </div>
          </div>
        </aside>
      )}

      <main className="relative flex-1 h-full flex flex-col items-center justify-between p-6 overflow-hidden">
        <div className="z-10 flex items-center gap-2">
          <button type="button" onClick={randomize} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#23242c] border border-[#2e303b] text-xs hover:bg-[#2e303b] transition-colors">
            <Shuffle className="w-3.5 h-3.5 text-[#38bdf8]" /> Randomize
          </button>
          <button type="button" onClick={copyConfig} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#23242c] border border-[#2e303b] text-xs hover:bg-[#2e303b] transition-colors">
            <FileCode className="w-3.5 h-3.5" /> Copy Config
          </button>
        </div>

        <div className="w-full flex-1 max-w-5xl flex flex-col justify-center my-2">
          <div className="w-full h-auto rounded-2xl border border-[#2e303b] overflow-hidden flex flex-col sm:flex-row bg-[#16171d]">
            {SHADE_STEPS.map((step) => {
              const hex = shades[step];
              const isDark = getLuminance(hex) < 0.5;
              return (
                <div key={step} onClick={() => copyShade(step, hex)} className="flex-1 min-h-[380px] p-4 flex flex-col justify-between items-center cursor-pointer transition-all hover:flex-[1.3]" style={{ backgroundColor: hex }}>
                  <span className="font-mono text-sm font-bold" style={{ color: isDark ? '#ffffff' : '#000000' }}>{step}</span>
                  <span className="font-mono text-[11px] px-2 py-1 rounded-lg" style={{ color: isDark ? '#ffffff' : '#000000', backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }}>
                    {copiedKey === `${step}` ? 'Copied!' : hex.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {isRightCollapsed ? (
        <div className="w-10 h-full shrink-0 border-l border-[#23242c] bg-[#16171d] flex flex-col items-center py-4 z-20">
          <button type="button" onClick={() => setIsRightCollapsed(false)} className="p-1.5 rounded-lg text-[#8f94a8] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <aside className="w-72 h-full shrink-0 border-l border-[#23242c] bg-[#16171d] flex flex-col z-20">
          <div className="p-3.5 border-b border-[#23242c] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8f94a8] uppercase"><Sparkles className="w-3.5 h-3.5" /> Presets</div>
              <button onClick={saveCurrentAsPreset} className="p-1 rounded-lg hover:bg-[#23242c]"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <div className="grid grid-cols-2 p-0.5 rounded-full bg-[#23242c] text-xs">
              <button onClick={() => setPresetTab('curated')} className={`py-1 rounded-full ${presetTab === 'curated' ? 'bg-[#16171d]' : ''}`}>Curated</button>
              <button onClick={() => setPresetTab('saved')} className={`py-1 rounded-full ${presetTab === 'saved' ? 'bg-[#16171d]' : ''}`}>Saved</button>
            </div>
            <input type="text" placeholder="Search presets..." value={searchPreset} onChange={(e) => setSearchPreset(e.target.value)} className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] outline-none" />
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {filteredPresets.map((p) => (
              <div key={p.id} onClick={() => { setSelectedPresetId(p.id); setBaseColor(p.hex); }} className={`p-2 rounded-xl border flex items-center gap-3 cursor-pointer ${selectedPresetId === p.id ? 'border-[#38bdf8] bg-[#38bdf8]/10' : 'border-[#2e303b] bg-[#1a1b24]'}`}>
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: p.hex }} />
                <div className="flex-1 text-xs">{p.name}</div>
                {presetTab === 'saved' && <button onClick={(e) => { e.stopPropagation(); deleteCustomPreset(p.id); }}><Trash2 className="w-3 h-3" /></button>}
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
};

function interpolateColor(color1: string, color2: string, factor: number) {
  const r1 = parseInt(color1.slice(1, 3), 16), g1 = parseInt(color1.slice(3, 5), 16), b1 = parseInt(color1.slice(5, 7), 16);
  const r2 = parseInt(color2.slice(1, 3), 16), g2 = parseInt(color2.slice(3, 5), 16), b2 = parseInt(color2.slice(5, 7), 16);
  const r = Math.round(r1 + factor * (r2 - r1)), g = Math.round(g1 + factor * (g2 - g1)), b = Math.round(b1 + factor * (b2 - b1));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function getLuminance(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
