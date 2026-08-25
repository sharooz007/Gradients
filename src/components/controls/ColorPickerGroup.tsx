import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Shuffle, Bookmark, BookmarkCheck, Trash2, FolderHeart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SavedPalette {
  id: string;
  name: string;
  colors: string[];
}

const DEFAULT_PRESET_PALETTES: SavedPalette[] = [
  { id: 'neon-cyber', name: 'Cyber Neon', colors: ['#00f2fe', '#ff007f', '#ffe600', '#a855f7'] },
  { id: 'sunset-dusk', name: 'Sunset Dusk', colors: ['#f97316', '#ec4899', '#8b5cf6', '#3b82f6'] },
  { id: 'emerald-mint', name: 'Emerald Aura', colors: ['#059669', '#10b981', '#34d399', '#6ee7b7'] },
  { id: 'cosmic-purple', name: 'Cosmic Violet', colors: ['#1e1b4b', '#4338ca', '#818cf8', '#c084fc'] },
  { id: 'solar-ember', name: 'Solar Ember', colors: ['#7c2d12', '#ea580c', '#fb923c', '#fef08a'] }
];

interface ColorPickerGroupProps {
  colors: string[];
  onChange: (colors: string[]) => void;
  onShuffle: () => void;
  disabled?: boolean;
}

export const ColorPickerGroup: React.FC<ColorPickerGroupProps> = ({
  colors,
  onChange,
  onShuffle,
  disabled = false
}) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [showSavedTray, setShowSavedTray] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Load saved palettes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('magic_global_palettes');
      if (saved) {
        setSavedPalettes(JSON.parse(saved));
      } else {
        setSavedPalettes(DEFAULT_PRESET_PALETTES);
        localStorage.setItem('magic_global_palettes', JSON.stringify(DEFAULT_PRESET_PALETTES));
      }
    } catch {
      setSavedPalettes(DEFAULT_PRESET_PALETTES);
    }
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActiveIdx(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorChange = (index: number, newColor: string) => {
    const next = [...colors];
    next[index] = newColor;
    onChange(next);
  };

  const handleAddColor = () => {
    if (colors.length >= 6) return;
    const lastColor = colors[colors.length - 1] || '#ffffff';
    onChange([...colors, lastColor]);
    setActiveIdx(colors.length);
  };

  const handleRemoveColor = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (colors.length <= 2) return;
    const next = colors.filter((_, i) => i !== index);
    onChange(next);
    if (activeIdx === index) setActiveIdx(null);
    else if (activeIdx !== null && activeIdx > index) setActiveIdx(activeIdx - 1);
  };

  const handleShuffleClick = () => {
    setIsShuffling(true);
    onShuffle();
    setTimeout(() => setIsShuffling(false), 400);
  };

  const handleSavePalette = () => {
    const defaultName = `Palette #${savedPalettes.length + 1}`;
    const name = prompt('Enter a name for this color palette:', defaultName);
    if (!name) return;

    const newPalette: SavedPalette = {
      id: `palette-${Date.now()}`,
      name: name.trim(),
      colors: [...colors]
    };

    const updated = [newPalette, ...savedPalettes];
    setSavedPalettes(updated);
    try {
      localStorage.setItem('magic_global_palettes', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setJustSaved(true);
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleDeletePalette = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPalettes.filter((p) => p.id !== id);
    setSavedPalettes(updated);
    try {
      localStorage.setItem('magic_global_palettes', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleApplyPalette = (palette: SavedPalette) => {
    onChange([...palette.colors]);
  };

  return (
    <div className={`flex flex-col gap-2.5 w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* 1. Color circles row */}
      <div className="relative flex items-center gap-2.5 flex-wrap">
        {colors.map((color, index) => {
          const isOpen = activeIdx === index;
          return (
            <div key={index} className="relative group">
              <button
                type="button"
                onClick={() => setActiveIdx(isOpen ? null : index)}
                className={`w-8 h-8 rounded-full border shadow-sm transition-all transform hover:scale-105 flex items-center justify-center cursor-pointer ${
                  isOpen
                    ? 'border-[#818cf8] ring-2 ring-[#818cf8]/50 scale-105'
                    : 'border-black/20 hover:border-white/40'
                }`}
                style={{ backgroundColor: color }}
              />

              {colors.length > 2 && (
                <button
                  type="button"
                  onClick={(e) => handleRemoveColor(index, e)}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-[#0e0f14] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all shadow-sm z-10 cursor-pointer border border-[#353746]"
                  title="Remove color"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}

              {/* Color picker dropdown popover */}
              {isOpen && (
                <div
                  ref={popoverRef}
                  className="absolute top-10 left-0 z-50 p-2.5 bg-[#1a1b24] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.5)] border border-[#2e303b] flex flex-col gap-2 min-w-[160px]"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={color.toUpperCase()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith('#') && val.length <= 7) {
                          handleColorChange(index, val);
                        } else if (!val.startsWith('#') && val.length <= 6) {
                          handleColorChange(index, '#' + val);
                        }
                      }}
                      className="w-20 px-2 py-1 text-xs font-mono font-semibold rounded-lg border border-[#353746] bg-[#23242c] text-[#f2f2f5] outline-none focus:border-[#818cf8]"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {colors.length < 6 && (
          <button
            type="button"
            onClick={handleAddColor}
            className="w-8 h-8 rounded-full border-2 border-dashed border-[#353746] hover:border-[#818cf8] hover:bg-[#818cf8]/10 text-[#8f94a8] hover:text-[#818cf8] flex items-center justify-center transition-all cursor-pointer"
            title="Add color stop"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Shuffle Palette Button */}
      <button
        type="button"
        onClick={handleShuffleClick}
        className="w-full py-2 px-3 rounded-xl bg-[#23242c] hover:bg-[#2a2b36] border border-[#2e303b] hover:border-[#3d4050] text-xs font-semibold text-[#f2f2f5] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
      >
        <Shuffle className={`w-3.5 h-3.5 text-[#818cf8] transition-transform duration-300 ${isShuffling ? 'rotate-180 scale-110' : ''}`} />
        <span>Shuffle Palette</span>
      </button>

      {/* 3. Action Buttons: Save Palette & Saved Palettes Drawer */}
      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={handleSavePalette}
          className="py-1.5 px-2.5 rounded-xl border border-[#2e303b] hover:border-[#818cf8] bg-[#1a1b24] hover:bg-[#23242c] text-[11px] font-medium text-[#f2f2f5] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
          title="Save current color palette to library"
        >
          {justSaved ? (
            <>
              <BookmarkCheck className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Saved!</span>
            </>
          ) : (
            <>
              <Bookmark className="w-3 h-3 text-[#818cf8]" />
              <span>Save Palette</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowSavedTray(!showSavedTray)}
          className={`py-1.5 px-2.5 rounded-xl border text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
            showSavedTray
              ? 'border-[#818cf8] bg-[#818cf8]/15 text-[#818cf8]'
              : 'border-[#2e303b] hover:border-[#3d4050] bg-[#1a1b24] hover:bg-[#23242c] text-[#8f94a8] hover:text-[#f2f2f5]'
          }`}
          title="Open Saved Palettes Library"
        >
          <FolderHeart className="w-3 h-3 text-[#ec4899]" />
          <span>Saved ({savedPalettes.length})</span>
        </button>
      </div>

      {/* 4. Expandable Saved Palettes Tray */}
      {showSavedTray && (
        <div className="flex flex-col gap-1.5 p-2 rounded-xl bg-[#16171d] border border-[#2e303b] max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-1 px-1 border-b border-[#23242c]">
            <span className="text-[10px] font-bold text-[#8f94a8] uppercase tracking-wider">
              My Palette Library
            </span>
            <span className="text-[10px] text-[#686c82]">Click to apply</span>
          </div>

          {savedPalettes.length === 0 ? (
            <div className="py-3 text-center text-xs text-[#686c82]">
              No saved palettes yet. Click "Save Palette" to add one!
            </div>
          ) : (
            savedPalettes.map((palette) => (
              <div
                key={palette.id}
                onClick={() => handleApplyPalette(palette)}
                className="group flex items-center justify-between p-1.5 rounded-lg border border-[#23242c] hover:border-[#818cf8]/50 bg-[#1a1b24] hover:bg-[#20222d] cursor-pointer transition-all gap-2"
                title={`Apply ${palette.name}`}
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[11px] font-medium text-[#f2f2f5] truncate">
                    {palette.name}
                  </span>
                  <div className="flex items-center h-2.5 rounded-md overflow-hidden mt-1 border border-black/40">
                    {palette.colors.map((c, i) => (
                      <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDeletePalette(palette.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#8f94a8] hover:text-red-400 hover:bg-[#23242c] rounded-md transition-all cursor-pointer shrink-0"
                  title="Delete palette"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};


