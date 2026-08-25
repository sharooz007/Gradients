import React, { useState } from 'react';
import { Search, Sparkles, ArrowUpRight } from 'lucide-react';
import { TOOLS_LIST, CATEGORIES } from '../../data/toolsList';
import type { ToolCategory } from '../../types/tools';
import { ToolCardPreview } from '../previews/ToolCardPreview';

interface HomePageProps {
  onSelectTool: (toolId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectTool }) => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tools based on category and search query
  const filteredTools = TOOLS_LIST.filter((tool) => {
    const matchesCategory =
      selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#f5f5f7] select-none">
      {/* Hero Section */}
      <section className="pt-12 pb-8 px-4 sm:px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#e5e5ea] shadow-2xs text-xs font-medium text-[#1d1d1f] mb-4">
          <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
          <span>MagicPattern Suite · 17 Professional Design Tools</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] max-w-3xl leading-[1.15]">
          Generative tools for gradients, patterns, and color theory.
        </h1>

        <p className="mt-3 text-sm sm:text-base text-[#86868b] max-w-2xl leading-relaxed">
          Reverse-engineered with procedural canvas and SVG mathematics. Export high-resolution PNGs, vector SVGs, and direct CSS code.
        </p>

        {/* Search & Category Filter Controls */}
        <div className="mt-8 w-full max-w-2xl flex flex-col gap-4 items-center">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]" />
            <input
              type="text"
              placeholder="Search tools by name, category, or format..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#e5e5ea] text-sm text-[#1d1d1f] placeholder-[#86868b] shadow-2xs focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as ToolCategory | 'all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1d1d1f] text-white'
                      : 'bg-white text-[#86868b] border border-[#e5e5ea] hover:border-[#1d1d1f] hover:text-[#1d1d1f]'
                  }`}
                >
                  {cat.name}{' '}
                  <span
                    className={`ml-1 text-[11px] ${
                      isActive ? 'text-white/70' : 'text-[#86868b]'
                    }`}
                  >
                    ({cat.count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tools Cards Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        {filteredTools.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white border border-[#e5e5ea] flex items-center justify-center text-[#86868b] mb-3">
              <Search className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-[#1d1d1f]">No matching tools found</p>
            <p className="text-xs text-[#86868b] mt-1">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => {
              return (
                <div
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  className="apple-card overflow-hidden cursor-pointer group flex flex-col"
                >
                  {/* Top Preview Canvas / SVG (140px Height) */}
                  <div className="relative h-40 w-full bg-[#f2f2f7] border-b border-[#e5e5ea] overflow-hidden">
                    <ToolCardPreview slug={tool.slug} />

                    {/* Badge */}
                    {tool.badge && (
                      <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight bg-white/90 backdrop-blur-md text-[#1d1d1f] border border-[#e5e5ea] shadow-2xs">
                        {tool.badge}
                      </div>
                    )}
                  </div>

                  {/* Card Content Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">
                          {tool.categoryName}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-[#86868b] group-hover:text-[#0071e3] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>

                      <h2 className="text-base font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors leading-snug">
                        {tool.name}
                      </h2>

                      <p className="text-xs text-[#86868b] mt-1.5 line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    {/* Bottom Tags / Meta */}
                    <div className="mt-4 pt-3 border-t border-[#f2f2f7] flex items-center justify-between text-[11px] text-[#86868b]">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {tool.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded bg-[#f2f2f7] text-[#86868b]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <span className="font-medium text-[#0071e3] opacity-0 group-hover:opacity-100 transition-opacity">
                        Open →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
