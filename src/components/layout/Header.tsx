import React, { useState } from 'react';
import {
  Sparkles,
  Undo2,
  Redo2,
  Copy,
  Download,
  Code,
  Film,
  Sun,
  Moon,
  BookmarkPlus,
  Dice5,
  Check,
  ChevronDown,
  Monitor
} from 'lucide-react';
import type { AppMode, CanvasDimensions } from '../../types/shader';
import { CANVAS_SIZE_PRESETS } from '../../data/canvasSizes';
import { SegmentedPicker } from '../controls/SegmentedPicker';

interface HeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  dimensions: CanvasDimensions;
  onDimensionsChange: (dims: CanvasDimensions) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onRandomize: () => void;
  onCopyClipboard: () => void;
  onOpenExportImage: () => void;
  onOpenExportVideo: () => void;
  onOpenExportCode: () => void;
  onOpenSavePreset: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isCopying?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  dimensions,
  onDimensionsChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onRandomize,
  onCopyClipboard,
  onOpenExportImage,
  onOpenExportVideo,
  onOpenExportCode,
  onOpenSavePreset,
  isDarkMode,
  onToggleTheme,
  isCopying = false
}) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);

  const isMac = typeof navigator !== 'undefined' && navigator.platform?.includes('Mac');

  return (
    <header className="h-14 w-full px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between z-30 select-none">
      {/* Left branding & Mode switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              MagicShader
              <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-indigo-800">
                PRO
              </span>
            </span>
            <span className="text-[10px] text-slate-400">Shader Background Studio</span>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block" />

        {/* Mode switch */}
        <div className="w-36">
          <SegmentedPicker<AppMode>
            size="sm"
            value={mode}
            onChange={onModeChange}
            options={[
              { value: 'image', label: 'Image' },
              { value: 'video', label: 'Video' }
            ]}
          />
        </div>

        {/* Canvas Resolution Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSizeMenuOpen(!isSizeMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Monitor className="w-3.5 h-3.5 text-slate-400" />
            <span>{dimensions.width} × {dimensions.height}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isSizeMenuOpen && (
            <div
              className="absolute top-10 left-0 z-50 w-56 py-1 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 text-xs flex flex-col"
              onMouseLeave={() => setIsSizeMenuOpen(false)}
            >
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700/60">
                Canvas Presets
              </div>
              <div className="max-h-60 overflow-auto">
                {CANVAS_SIZE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      onDimensionsChange(preset);
                      setIsSizeMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors ${
                      dimensions.width === preset.width && dimensions.height === preset.height
                        ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span className="text-[10px] text-slate-400">{preset.aspectRatio}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Actions: Randomize */}
      <div className="hidden lg:flex items-center gap-2">
        <button
          type="button"
          onClick={onRandomize}
          className="group flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold shadow-sm transition-all cursor-pointer transform active:scale-95"
        >
          <Dice5 className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
          <span>Generate New</span>
          <kbd className="text-[10px] opacity-60 bg-white/20 dark:bg-black/10 px-1 py-0.5 rounded font-mono">
            Space
          </kbd>
        </button>
      </div>

      {/* Right Actions: Undo/Redo, Copy, Export, Theme */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            title={`Undo (${isMac ? '⌘Z' : 'Ctrl+Z'})`}
            className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            title={`Redo (${isMac ? '⌘⇧Z' : 'Ctrl+Y'})`}
            className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Copy Image Button */}
        <button
          type="button"
          onClick={onCopyClipboard}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors shadow-xs cursor-pointer"
        >
          {isCopying ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>{isCopying ? 'Copied!' : 'Copy Image'}</span>
        </button>

        {/* Save Preset */}
        <button
          type="button"
          onClick={onOpenSavePreset}
          title="Save as custom preset"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
        >
          <BookmarkPlus className="w-4 h-4" />
        </button>

        {/* Code Snippet Button */}
        <button
          type="button"
          onClick={onOpenExportCode}
          title="Export code snippet (React, GLSL, HTML)"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
        >
          <Code className="w-4 h-4" />
        </button>

        {/* Main Export Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {isExportMenuOpen && (
            <div
              className="absolute top-10 right-0 z-50 w-48 py-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 text-xs flex flex-col"
              onMouseLeave={() => setIsExportMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => {
                  setIsExportMenuOpen(false);
                  onOpenExportImage();
                }}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200"
              >
                <Download className="w-3.5 h-3.5 text-indigo-500" />
                <span>Export Image (PNG/JPG)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExportMenuOpen(false);
                  onOpenExportVideo();
                }}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200"
              >
                <Film className="w-3.5 h-3.5 text-pink-500" />
                <span>Export Video (WebM/MP4)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExportMenuOpen(false);
                  onOpenExportCode();
                }}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 border-t border-slate-100 dark:border-slate-700"
              >
                <Code className="w-3.5 h-3.5 text-emerald-500" />
                <span>Export Code Snippet</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title="Toggle Dark/Light theme"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
