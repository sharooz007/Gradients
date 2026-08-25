import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { AppMode, Preset } from './types/shader';
import { PRESETS } from './data/presets';
import { useShaderState } from './hooks/useShaderState';
import { useVideoTimeline } from './hooks/useVideoTimeline';
import type { ShaderCanvasRef } from './components/canvas/ShaderCanvas';
import { Header } from './components/layout/Header';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { PreviewArea } from './components/layout/PreviewArea';
import { VideoTimeline } from './components/timeline/VideoTimeline';
import { ExportImageModal } from './components/modals/ExportImageModal';
import { ExportVideoModal } from './components/modals/ExportVideoModal';
import { ExportCodeModal } from './components/modals/ExportCodeModal';
import { SavePresetModal } from './components/modals/SavePresetModal';

export function App() {
  const [mode, setMode] = useState<AppMode>('image');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESETS[0].id);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isCopying, setIsCopying] = useState(false);

  // Modals state
  const [isExportImageOpen, setIsExportImageOpen] = useState(false);
  const [isExportVideoOpen, setIsExportVideoOpen] = useState(false);
  const [isExportCodeOpen, setIsExportCodeOpen] = useState(false);
  const [isSavePresetOpen, setIsSavePresetOpen] = useState(false);

  // Custom presets from localStorage
  const [customPresets, setCustomPresets] = useState<Preset[]>(() => {
    try {
      const saved = localStorage.getItem('magic_custom_shader_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Shader state management
  const {
    state,
    dimensions,
    setDimensions,
    updateState,
    commitState,
    undo,
    redo,
    canUndo,
    canRedo,
    shuffleColors,
    shuffleSeed,
    randomizeAll
  } = useShaderState(PRESETS[0].state);

  // Video timeline management
  const timeline = useVideoTimeline(state);

  const canvasRef = useRef<ShaderCanvasRef | null>(null);

  // Initialize theme
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  // Keyboard shortcut listener for Spacebar (Randomize)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      if (e.code === 'Space' && mode === 'image') {
        e.preventDefault();
        randomizeAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, randomizeAll]);

  // Apply Preset
  const handleSelectPreset = (preset: Preset) => {
    setSelectedPresetId(preset.id);
    if (preset.dimensions) {
      setDimensions(preset.dimensions);
    }
    commitState(preset.state);
  };

  // Save Custom Preset
  const handleSavePreset = (preset: Preset) => {
    const updated = [preset, ...customPresets];
    setCustomPresets(updated);
    try {
      localStorage.setItem('magic_custom_shader_presets', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  // Delete Custom Preset
  const handleDeleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    try {
      localStorage.setItem('magic_custom_shader_presets', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  // Quick Copy to Clipboard
  const handleQuickCopyClipboard = async () => {
    if (!canvasRef.current) return;
    setIsCopying(true);

    try {
      const effective = mode === 'video' ? timeline.effectiveState : state;
      const offscreen = await canvasRef.current.renderHighRes(
        effective,
        dimensions.width,
        dimensions.height,
        1
      );

      offscreen.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.7 }
          });
          setTimeout(() => setIsCopying(false), 2000);
        } catch (clipErr) {
          console.error('Clipboard copy error:', clipErr);
          setIsCopying(false);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Quick copy error:', err);
      setIsCopying(false);
    }
  };

  // The active state to display
  const activeDisplayState = mode === 'video' ? timeline.effectiveState : state;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        mode={mode}
        onModeChange={setMode}
        dimensions={dimensions}
        onDimensionsChange={setDimensions}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onRandomize={randomizeAll}
        onCopyClipboard={handleQuickCopyClipboard}
        onOpenExportImage={() => setIsExportImageOpen(true)}
        onOpenExportVideo={() => setIsExportVideoOpen(true)}
        onOpenExportCode={() => setIsExportCodeOpen(true)}
        onOpenSavePreset={() => setIsSavePresetOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        isCopying={isCopying}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Customization Sidebar */}
        <LeftSidebar
          state={activeDisplayState}
          onUpdateState={(updates, commit) => {
            if (mode === 'video' && timeline.selectedKeyframeId) {
              timeline.updateKeyframeValues(timeline.selectedKeyframeId, updates);
            }
            updateState(updates, commit);
          }}
          onShuffleColors={shuffleColors}
          onShuffleSeed={shuffleSeed}
        />

        {/* Center Preview Viewport */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <PreviewArea
            canvasRef={canvasRef}
            state={activeDisplayState}
            dimensions={dimensions}
            customTime={mode === 'video' ? timeline.playhead : undefined}
          />

          {/* Bottom Video Keyframe Timeline (Visible only in Video Mode) */}
          {mode === 'video' && (
            <VideoTimeline
              project={timeline.project}
              playhead={timeline.playhead}
              isPlaying={timeline.isPlaying}
              isLooping={timeline.isLooping}
              selectedKeyframeId={timeline.selectedKeyframeId}
              onTogglePlay={timeline.togglePlay}
              onToggleLoop={() => timeline.setIsLooping(!timeline.isLooping)}
              onSeek={timeline.seek}
              onAddKeyframe={() => timeline.addKeyframeAtPlayhead(state)}
              onRemoveKeyframe={timeline.removeKeyframe}
              onUpdateEasing={timeline.updateKeyframeEasing}
              onChangeDuration={timeline.setDuration}
            />
          )}
        </div>

        {/* Right Presets Sidebar */}
        <RightSidebar
          currentPresetId={selectedPresetId}
          onSelectPreset={handleSelectPreset}
          onOpenSaveModal={() => setIsSavePresetOpen(true)}
          customPresets={customPresets}
          onDeleteCustomPreset={handleDeleteCustomPreset}
          onImportPresetJson={handleSavePreset}
        />
      </div>

      {/* Modals */}
      <ExportImageModal
        isOpen={isExportImageOpen}
        onClose={() => setIsExportImageOpen(false)}
        state={activeDisplayState}
        dimensions={dimensions}
        canvasRef={canvasRef}
      />

      <ExportVideoModal
        isOpen={isExportVideoOpen}
        onClose={() => setIsExportVideoOpen(false)}
        state={state}
        project={timeline.project}
        dimensions={dimensions}
        canvasRef={canvasRef}
      />

      <ExportCodeModal
        isOpen={isExportCodeOpen}
        onClose={() => setIsExportCodeOpen(false)}
        state={activeDisplayState}
      />

      <SavePresetModal
        isOpen={isSavePresetOpen}
        onClose={() => setIsSavePresetOpen(false)}
        state={activeDisplayState}
        dimensions={dimensions}
        onSavePreset={handleSavePreset}
      />
    </div>
  );
}

export default App;
