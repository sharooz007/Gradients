import React, { useState } from 'react';
import {
  Sparkles,
  Bookmark,
  Search,
  Upload,
  BookmarkPlus,
  Trash2
} from 'lucide-react';
import type { Preset } from '../../types/shader';
import { PRESETS } from '../../data/presets';

interface RightSidebarProps {
  currentPresetId?: string;
  onSelectPreset: (preset: Preset) => void;
  onOpenSaveModal: () => void;
  customPresets: Preset[];
  onDeleteCustomPreset: (id: string) => void;
  onImportPresetJson: (preset: Preset) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  currentPresetId,
  onSelectPreset,
  onOpenSaveModal,
  customPresets,
  onDeleteCustomPreset,
  onImportPresetJson
}) => {
  const [tab, setTab] = useState<'curated' | 'custom'>('curated');
  const [search, setSearch] = useState('');

  const allPresets = tab === 'curated' ? PRESETS : customPresets;
  const filteredPresets = allPresets.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (json.state && json.name) {
          onImportPresetJson({
            id: json.id || `custom-${Date.now()}`,
            name: json.name,
            dimensions: json.dimensions || { width: 2000, height: 1400 },
            state: json.state,
            isCustom: true
          });
        }
      } catch (err) {
        alert('Invalid preset JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <aside className="w-72 h-full min-h-0 shrink-0 border-l border-[#e5e5ea] bg-white flex flex-col z-20 overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="p-3.5 shrink-0 border-b border-[#e5e5ea] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#0071e3]" />
            <span className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
              Preset Library
            </span>
          </div>

          <div className="flex items-center gap-1">
            <label
              title="Import JSON preset"
              className="p-1 rounded-lg hover:bg-[#f2f2f7] text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={onOpenSaveModal}
              title="Save current look"
              className="p-1 rounded-lg hover:bg-[#f2f2f7] text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab switcher: Curated vs Custom */}
        <div className="grid grid-cols-2 p-0.5 rounded-full bg-[#f2f2f7] border border-[#e5e5ea] text-xs">
          <button
            type="button"
            onClick={() => setTab('curated')}
            className={`py-1 rounded-full transition-all cursor-pointer ${
              tab === 'curated'
                ? 'bg-white text-[#1d1d1f] shadow-2xs font-semibold'
                : 'text-[#86868b]'
            }`}
          >
            Curated ({PRESETS.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('custom')}
            className={`py-1 rounded-full transition-all cursor-pointer ${
              tab === 'custom'
                ? 'bg-white text-[#1d1d1f] shadow-2xs font-semibold'
                : 'text-[#86868b]'
            }`}
          >
            Saved ({customPresets.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#86868b]" />
          <input
            type="text"
            placeholder="Search looks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full bg-[#f2f2f7] border border-[#e5e5ea] text-[#1d1d1f] placeholder-[#86868b] outline-none focus:border-[#0071e3]"
          />
        </div>
      </div>

      {/* Presets Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-2 custom-scrollbar overscroll-contain">
        {filteredPresets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <Bookmark className="w-8 h-8 text-[#d1d1d6] mb-2" />
            <p className="text-xs text-[#86868b] font-medium">No presets found</p>
            {tab === 'custom' && (
              <p className="text-[11px] text-[#a1a1a6] mt-1">
                Click the save icon to store your current look.
              </p>
            )}
          </div>
        ) : (
          filteredPresets.map((preset) => {
            const isSelected = currentPresetId === preset.id;
            const colors = preset.state.colors || ['#000', '#fff'];

            // Generate CSS gradient preview representation for thumbnail
            const gradientCss = `linear-gradient(${preset.state.rotation || 45}deg, ${colors.join(', ')})`;

            return (
              <div
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                  isSelected
                    ? 'border-[#0071e3] bg-[#e8f2fc] ring-1 ring-[#0071e3]/30'
                    : 'border-[#e5e5ea] hover:border-[#d1d1d6] bg-white hover:bg-[#fafafc]'
                }`}
              >
                {/* Thumbnail Swatch */}
                <div
                  className="w-12 h-10 rounded-lg shadow-inner shrink-0 border border-black/10 dark:border-white/10 group-hover:scale-105 transition-transform overflow-hidden relative"
                  style={{ background: gradientCss }}
                >
                  {preset.state.ditherEnabled && (
                    <div className="absolute inset-0 bg-black/10 backdrop-brightness-110 opacity-70" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="text-xs font-semibold text-[#1d1d1f] truncate">
                    {preset.name}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    {colors.slice(0, 4).map((c, i) => (
                      <span
                        key={i}
                        className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    {colors.length > 4 && (
                      <span className="text-[10px] text-[#a1a1a6]">+{colors.length - 4}</span>
                    )}
                  </div>
                </div>

                {/* Custom preset delete button */}
                {preset.isCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCustomPreset(preset.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#a1a1a6] hover:text-red-500 transition-all rounded hover:bg-[#f2f2f7]"
                    title="Delete preset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
