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
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#16171d] rounded-2xl shadow-2xl border border-[#2e303b] overflow-hidden flex flex-col max-h-[75vh] text-[#f2f2f5]">
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#23242c]">
          <Search className="w-4 h-4 text-[#686c82]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search 17 generative design tools..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-[#f2f2f5] placeholder-[#686c82] outline-none font-medium"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#23242c] text-[#686c82] hover:text-[#f2f2f5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-4 py-2 bg-[#1a1b24] border-b border-[#23242c] flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
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
                    ? 'bg-[#6268f8] text-white shadow-xs'
                    : 'bg-[#23242c] text-[#8f94a8] hover:text-[#f2f2f5] border border-[#2e303b]'
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
            <div className="py-12 text-center text-xs text-[#8f94a8]">
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
                      ? 'bg-[#23242c] text-white'
                      : 'hover:bg-[#1a1b24]'
                  } ${isCurrent ? 'ring-1 ring-[#6268f8]/50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#6268f8]/15 text-[#818cf8] flex items-center justify-center font-bold text-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#f2f2f5]">
                          {tool.name}
                        </span>
                        {tool.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#6268f8]/20 text-[#818cf8]">
                            {tool.badge}
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] text-[#818cf8] font-medium">
                            (Active)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8f94a8] line-clamp-1 mt-0.5">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#8f94a8] px-2 py-0.5 rounded bg-[#1a1b24] border border-[#2e303b]">
                      {tool.categoryName}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#818cf8]' : 'text-transparent'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 bg-[#1a1b24] border-t border-[#23242c] flex items-center justify-between text-[11px] text-[#686c82]">
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
