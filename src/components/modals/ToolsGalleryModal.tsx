import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, ArrowRight } from 'lucide-react';
import { TOOLS_LIST, CATEGORIES } from '../../data/toolsList';
import type { ToolCategory } from '../../types/tools';

interface ToolsGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
  currentToolId?: string;
}

export const ToolsGalleryModal: React.FC<ToolsGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  currentToolId
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter tools based on category and search
  const filteredTools = TOOLS_LIST.filter((tool) => {
    const matchesCategory =
      selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      search.trim() === '' ||
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase()) ||
      tool.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredTools.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % Math.max(1, filteredTools.length));
      } else if (e.key === 'Enter' && filteredTools[selectedIndex]) {
        e.preventDefault();
        onSelectTool(filteredTools[selectedIndex].id);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredTools, selectedIndex, onClose, onSelectTool]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#e5e5ea] overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-[#e5e5ea] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#86868b]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search 17 generative design tools..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-[#1d1d1f] placeholder-[#86868b] outline-none font-medium"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#f2f2f7] text-[#86868b] hover:text-[#1d1d1f] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-4 py-2 bg-[#fafafc] border-b border-[#e5e5ea] flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id as ToolCategory | 'all');
                  setSelectedIndex(0);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1d1d1f] text-white shadow-2xs'
                    : 'bg-white text-[#86868b] hover:text-[#1d1d1f] border border-[#e5e5ea]'
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            );
          })}
        </div>

        {/* Tools Results List */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 custom-scrollbar">
          {filteredTools.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#86868b]">
              No tools found matching "{search}"
            </div>
          ) : (
            filteredTools.map((tool, idx) => {
              const isSelected = selectedIndex === idx;
              const isCurrent = currentToolId === tool.id;

              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    onSelectTool(tool.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#f2f2f7]'
                      : 'hover:bg-[#fafafc]'
                  } ${isCurrent ? 'ring-1 ring-[#0071e3]/30' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#e8f2fc] text-[#0071e3] flex items-center justify-center font-bold text-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#1d1d1f]">
                          {tool.name}
                        </span>
                        {tool.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#0071e3]/10 text-[#0071e3]">
                            {tool.badge}
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] text-[#0071e3] font-medium">
                            (Active)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#86868b] line-clamp-1 mt-0.5">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#86868b] px-2 py-0.5 rounded bg-white border border-[#e5e5ea]">
                      {tool.categoryName}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#0071e3]' : 'text-transparent'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 bg-[#fafafc] border-t border-[#e5e5ea] flex items-center justify-between text-[11px] text-[#86868b]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span>17 Generative Tools</span>
        </div>
      </div>
    </div>
  );
};
