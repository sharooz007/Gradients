import React from 'react';
import {
  Sparkles,
  Info,
  ChevronsUpDown,
  Download,
  Bookmark,
  RotateCcw,
  RotateCw,
  ExternalLink
} from 'lucide-react';
import type { ToolItem } from '../../types/tools';

interface AppleHeaderProps {
  view: 'home' | 'tool';
  activeTool?: ToolItem;
  onNavigateHome: () => void;
  onOpenSearch: () => void;
  onExport?: () => void;
  onGenerateNew?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onSave?: () => void;
  toolActions?: React.ReactNode;
}

export const AppleHeader: React.FC<AppleHeaderProps> = ({
  view,
  activeTool,
  onNavigateHome,
  onOpenSearch,
  onExport,
  onGenerateNew,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onSave,
  toolActions
}) => {
  return (
    <header className="h-14 shrink-0 w-full px-4 sm:px-6 border-b border-[#23242c] bg-[#16171d] flex items-center justify-between z-30 select-none">
      {/* Left: MagicPattern Logo & Generate New */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer text-left"
        >
          {/* Logo icon */}
          <div className="w-7 h-7 rounded-lg bg-[#6268f8] text-white flex items-center justify-center shadow-[0_0_12px_rgba(98,104,248,0.5)] font-bold text-xs">
            <span className="tracking-tighter">MP</span>
          </div>
          <span className="font-bold text-sm text-[#f2f2f5] tracking-tight hidden sm:inline">
            MagicPattern
          </span>
        </button>

        {onGenerateNew && (
          <button
            type="button"
            onClick={onGenerateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#818cf8] bg-[#6268f8]/10 hover:bg-[#6268f8]/20 border border-[#6268f8]/30 transition-all cursor-pointer shadow-xs ml-1"
            title="Generate fresh random gradient (Space)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Generate New</span>
          </button>
        )}
      </div>

      {/* Center: Glowing Tool Pill Badge with Info Icon */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#20222f] hover:bg-[#282a3a] border border-[#3b3e55] text-xs font-semibold text-[#f2f2f5] transition-all cursor-pointer tool-badge-glow shadow-md"
          title="Switch tool (⌘K)"
        >
          <span className="text-[10px] text-[#818cf8] font-mono uppercase tracking-wider font-bold">TOOL:</span>
          <span>{activeTool ? activeTool.name : 'Shader Gradient Editor'}</span>
          <ChevronsUpDown className="w-3.5 h-3.5 text-[#8f94a8]" />
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          className="p-1.5 rounded-full text-[#686c82] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer hidden md:flex"
          title="View all 17 studio tools"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Actions & Export */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {view === 'tool' ? (
          <>
            {/* Custom Tool Actions if passed */}
            {toolActions}

            {/* Undo / Redo */}
            {onUndo && onRedo && (
              <div className="hidden sm:flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-[#23242c] border border-[#2e303b]">
                <button
                  type="button"
                  disabled={!canUndo}
                  onClick={onUndo}
                  title="Undo (⌘Z)"
                  className="p-1.5 rounded-full text-[#f2f2f5] hover:bg-[#2e303b] disabled:opacity-25 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={!canRedo}
                  onClick={onRedo}
                  title="Redo (⌘⇧Z)"
                  className="p-1.5 rounded-full text-[#f2f2f5] hover:bg-[#2e303b] disabled:opacity-25 transition-all cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Save look */}
            {onSave && (
              <button
                type="button"
                onClick={onSave}
                className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[#f2f2f5] bg-[#23242c] hover:bg-[#2a2b36] border border-[#2e303b] transition-all cursor-pointer"
                title="Save look"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#818cf8]" />
                <span>Save</span>
              </button>
            )}

            {/* Primary Export Button */}
            {onExport && (
              <button
                type="button"
                onClick={onExport}
                className="studio-btn studio-btn-primary gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.25)]"
              >
                <Download className="w-3.5 h-3.5 text-[#0e0f14]" />
                <span>Export</span>
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <a
              href="https://www.magicpattern.design/tools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#8f94a8] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors"
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

