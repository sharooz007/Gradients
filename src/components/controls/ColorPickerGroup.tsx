import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Shuffle } from 'lucide-react';

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
  const popoverRef = useRef<HTMLDivElement>(null);

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
    if (colors.length <= 2) return; // Maintain at least 2 colors
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

  return (
    <div className={`flex flex-col gap-3 w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Color circles */}
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
                    ? 'border-[#6268f8] ring-2 ring-[#6268f8]/50 scale-105'
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
                      className="w-20 px-2 py-1 text-xs font-mono font-semibold rounded-lg border border-[#353746] bg-[#23242c] text-[#f2f2f5] outline-none focus:border-[#6268f8]"
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
            className="w-8 h-8 rounded-full border-2 border-dashed border-[#353746] hover:border-[#6268f8] hover:bg-[#6268f8]/10 text-[#8f94a8] hover:text-[#6268f8] flex items-center justify-center transition-all cursor-pointer"
            title="Add color stop"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Shuffle Palette Button */}
      <button
        type="button"
        onClick={handleShuffleClick}
        className="w-full py-2 px-3 rounded-xl bg-[#23242c] hover:bg-[#2a2b36] border border-[#2e303b] hover:border-[#3d4050] text-xs font-semibold text-[#f2f2f5] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
      >
        <Shuffle className={`w-3.5 h-3.5 text-[#818cf8] transition-transform duration-300 ${isShuffling ? 'rotate-180 scale-110' : ''}`} />
        <span>Shuffle Palette</span>
      </button>
    </div>
  );
};

