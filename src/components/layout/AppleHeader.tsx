import React from 'react';
import {
  ArrowLeft,
  Search,
  Download,
  ExternalLink
} from 'lucide-react';
import type { ToolItem } from '../../types/tools';

interface AppleHeaderProps {
  view: 'home' | 'tool';
  activeTool?: ToolItem;
  onNavigateHome: () => void;
  onOpenSearch: () => void;
  onExport?: () => void;
  toolActions?: React.ReactNode;
}

export const AppleHeader: React.FC<AppleHeaderProps> = ({
  view,
  activeTool,
  onNavigateHome,
  onOpenSearch,
  onExport,
  toolActions
}) => {
  const isMac = typeof navigator !== 'undefined' && navigator.platform?.includes('Mac');

  return (
    <header className="h-14 shrink-0 w-full px-4 sm:px-6 border-b border-[#e5e5ea] bg-white/90 backdrop-blur-md flex items-center justify-between z-30 select-none">
      {/* Left Branding / Navigation */}
      <div className="flex items-center gap-3">
        {view === 'tool' ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#1d1d1f] bg-[#f2f2f7] hover:bg-[#e5e5ea] border border-[#e5e5ea] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Tools</span>
            </button>

            <div className="h-4 w-px bg-[#e5e5ea]" />

            {activeTool && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#1d1d1f] tracking-tight">
                  {activeTool.name}
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#f2f2f7] text-[#86868b] border border-[#e5e5ea]">
                  {activeTool.categoryName}
                </span>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-[#0071e3] text-white flex items-center justify-center shadow-xs font-bold text-sm">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-[#1d1d1f] tracking-tight">
                  MagicPattern
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#0071e3]/10 text-[#0071e3]">
                  17 Tools
                </span>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Center Search Trigger */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f2f2f7] hover:bg-[#e5e5ea] border border-[#e5e5ea] text-xs text-[#86868b] hover:text-[#1d1d1f] transition-all cursor-pointer shadow-2xs min-w-[180px] sm:min-w-[220px]"
        >
          <Search className="w-3.5 h-3.5 text-[#86868b]" />
          <span className="flex-1 text-left">Search 17 tools...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-[#d1d1d6] text-[#86868b] shadow-2xs">
            {isMac ? '⌘K' : 'Ctrl+K'}
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {view === 'tool' ? (
          <>
            {toolActions}

            {onExport && (
              <button
                type="button"
                onClick={onExport}
                className="apple-btn apple-btn-primary gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <a
              href="https://www.magicpattern.design/tools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f2f2f7] transition-colors"
            >
              <span>Original Site</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
