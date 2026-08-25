import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Sparkles,
  Palette,
  Smartphone,
  Sun,
  Layers,
  Grid,
  Box,
  CircleDot,
  Cpu,
  Disc,
  Circle,
  LayoutGrid,
  Stars,
  Pencil,
  Film,
  Waves,
  Droplet,
  Hexagon,
  PartyPopper,
  TrendingUp,
  PaintBucket,
  Image as ImageIcon,
  Code,
  Binary,
  FileCode,
  FileSpreadsheet
} from 'lucide-react';
import { ALL_TOOLS } from '../../data/toolsList';
import type { ToolCategory } from '../../types/tools';

interface ToolsGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeToolId: string;
  onSelectTool: (toolId: string) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Sparkles,
  Palette,
  Smartphone,
  Sun,
  Layers,
  Grid,
  Box,
  CircleDot,
  Cpu,
  Disc,
  Circle,
  LayoutGrid,
  Stars,
  Pencil,
  Film,
  Waves,
  Droplet,
  Hexagon,
  PartyPopper,
  TrendingUp,
  PaintBucket,
  Image: ImageIcon,
  Code,
  Binary,
  FileCode,
  FileSpreadsheet
};

export const ToolsGalleryModal: React.FC<ToolsGalleryModalProps> = ({
  isOpen,
  onClose,
  activeToolId,
  onSelectTool
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter((tool) => {
      const matchCat = selectedCategory === 'all' || tool.category === selectedCategory;
      const matchQuery =
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase()) ||
        tool.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [search, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
              M
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                MagicPattern Design Suite
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Explore all 30+ procedural tools for shaders, patterns, SVGs, and palettes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools by name, tag..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Tools' },
              { id: 'shaders-gradients', label: 'Shaders & Gradients' },
              { id: 'patterns-textures', label: 'Patterns & Textures' },
              { id: 'svg-shapes', label: 'SVG & Shapes' },
              { id: 'colors-palettes', label: 'Colors & Palettes' },
              { id: 'converters-utilities', label: 'Converters' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => {
            const Icon = ICON_MAP[tool.iconName] || Sparkles;
            const isActive = activeToolId === tool.id;

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  onSelectTool(tool.id);
                  onClose();
                }}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer group hover:scale-[1.02] hover:shadow-lg ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    {tool.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tool.badge === 'Popular'
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-wrap mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  {tool.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
