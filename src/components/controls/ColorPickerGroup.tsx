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
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#1d1d1f]">
          Palette Colors ({colors.length}/6)
        </span>
        <button
          type="button"
          onClick={handleShuffleClick}
          className="flex items-center gap-1 text-xs font-medium text-[#0071e3] hover:text-[#0077ed] transition-colors cursor-pointer"
        >
          <Shuffle className={`w-3.5 h-3.5 transition-transform duration-300 ${isShuffling ? 'rotate-180 scale-110' : ''}`} />
          <span>Shuffle</span>
        </button>
      </div>

      <div className="relative flex items-center gap-2 flex-wrap pt-1">
        {colors.map((color, index) => {
          const isOpen = activeIdx === index;
          return (
            <div key={index} className="relative group">
              <button
                type="button"
                onClick={() => setActiveIdx(isOpen ? null : index)}
                className={`w-8 h-8 rounded-lg border shadow-sm transition-all transform hover:scale-105 flex items-center justify-center cursor-pointer ${
                  isOpen
                    ? 'border-[#0071e3] ring-2 ring-[#0071e3]/30 scale-105'
                    : 'border-[#000000]/10'
                }`}
                style={{ backgroundColor: color }}
              />

              {colors.length > 2 && (
                <button
                  type="button"
                  onClick={(e) => handleRemoveColor(index, e)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-slate-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all shadow-sm z-10 cursor-pointer"
                  title="Remove color"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}

              {/* Color picker dropdown popover */}
              {isOpen && (
                <div
                  ref={popoverRef}
                  className="absolute top-10 left-0 z-50 p-2.5 bg-white rounded-lg shadow-[0_4px_14px_rgba(0,0,0,0.1)] border border-[#e5e5ea] flex flex-col gap-2 min-w-[160px]"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
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
                      className="w-20 px-1.5 py-1 text-xs font-mono font-medium rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
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
            className="w-8 h-8 rounded-lg border-2 border-dashed border-[#d1d1d6] hover:border-[#0071e3] hover:bg-[#e8f2fc] text-[#86868b] hover:text-[#0071e3] flex items-center justify-center transition-all"
            title="Add color"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
