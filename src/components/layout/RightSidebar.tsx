import React, { useState } from 'react';
import {
  Bookmark,
  Search,
  Upload,
  BookmarkPlus,
  Trash2,
  Sparkles,
  ChevronRight,
  ChevronLeft
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  if (isCollapsed) {
    return (
      <div className="w-10 h-full shrink-0 border-l border-[#23242c] bg-[#16171d] flex flex-col items-center py-4 z-20">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 rounded-lg text-[#8f94a8] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
          title="Expand presets"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 h-full min-h-0 shrink-0 border-l border-[#23242c] bg-[#16171d] flex flex-col z-20 overflow-hidden select-none relative">
      {/* Sidebar Header */}
      <div className="p-3.5 shrink-0 border-b border-[#23242c] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#818cf8]" />
            <span className="text-[11px] font-bold text-[#8f94a8] tracking-wider uppercase">Presets</span>
          </div>

          <div className="flex items-center gap-1">
            <label
              title="Import JSON preset"
              className="p-1 rounded-lg hover:bg-[#23242c] text-[#8f94a8] hover:text-[#f2f2f5] transition-colors cursor-pointer"
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
              className="p-1 rounded-lg hover:bg-[#23242c] text-[#8f94a8] hover:text-[#f2f2f5] transition-colors cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              title="Collapse presets"
              className="p-1 rounded-lg hover:bg-[#23242c] text-[#686c82] hover:text-[#f2f2f5] transition-colors cursor-pointer ml-1"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab switcher: Curated vs Custom */}
        <div className="grid grid-cols-2 p-0.5 rounded-full bg-[#23242c] border border-[#2e303b] text-xs">
          <button
            type="button"
            onClick={() => setTab('curated')}
            className={`py-1 rounded-full transition-all cursor-pointer ${
              tab === 'curated'
                ? 'bg-[#16171d] text-[#f2f2f5] shadow-xs font-semibold'
                : 'text-[#8f94a8] hover:text-[#f2f2f5]'
            }`}
          >
            Curated ({PRESETS.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('custom')}
            className={`py-1 rounded-full transition-all cursor-pointer ${
              tab === 'custom'
                ? 'bg-[#16171d] text-[#f2f2f5] shadow-xs font-semibold'
                : 'text-[#8f94a8] hover:text-[#f2f2f5]'
            }`}
          >
            Saved ({customPresets.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#686c82]" />
          <input
            type="text"
            placeholder="Search looks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#23242c] border border-[#2e303b] text-[#f2f2f5] placeholder-[#686c82] outline-none focus:border-[#6268f8]"
          />
        </div>
      </div>

      {/* Presets Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 grid grid-cols-2 auto-rows-max gap-2.5 custom-scrollbar overscroll-contain pb-10">
        {filteredPresets.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center h-48 text-center p-4">
            <Bookmark className="w-8 h-8 text-[#353746] mb-2" />
            <p className="text-xs text-[#8f94a8] font-medium">No presets found</p>
            {tab === 'custom' && (
              <p className="text-[11px] text-[#686c82] mt-1">
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
                className={`group relative p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? 'border-[#6268f8] bg-[#6268f8]/15 ring-2 ring-[#6268f8]/40 shadow-[0_0_12px_rgba(98,104,248,0.25)]'
                    : 'border-[#2e303b] hover:border-[#484b5c] bg-[#1a1b24] hover:bg-[#20222d]'
                }`}
              >
                {/* Thumbnail Swatch */}
                <div
                  className="w-full aspect-[4/3] rounded-lg shadow-inner shrink-0 border border-black/30 group-hover:scale-102 transition-transform overflow-hidden relative"
                  style={{ background: gradientCss }}
                >
                  {preset.state.ditherEnabled && (
                    <div className="absolute inset-0 bg-black/20 backdrop-brightness-110 opacity-70" />
                  )}
                </div>

                {/* Info */}
                <div className="w-full flex flex-col items-center px-0.5 pb-0.5">
                  <span className="text-[10px] font-semibold text-[#8f94a8] group-hover:text-[#f2f2f5] truncate leading-tight text-center w-full">
                    {preset.name}
                  </span>
                </div>

                {/* Custom preset delete button */}
                {preset.isCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCustomPreset(preset.id);
                    }}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-white bg-black/70 hover:bg-red-500 transition-all rounded-md backdrop-blur-md"
                    title="Delete preset"
                  >
                    <Trash2 className="w-3 h-3" />
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

