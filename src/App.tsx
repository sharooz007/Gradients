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
import { ToolsGalleryModal } from './components/modals/ToolsGalleryModal';

// Category 1: Shaders & Gradients
import { GradientStudio } from './tools/shaders/GradientStudio';
import { AppleWallpaperStudio } from './tools/shaders/AppleWallpaperStudio';
import { GodRaysStudio } from './tools/shaders/GodRaysStudio';
import { FractalGlassStudio } from './tools/shaders/FractalGlassStudio';

// Category 2: Patterns & Textures
import { CssPatternStudio } from './tools/patterns/CssPatternStudio';
import { PerspectiveGridStudio } from './tools/patterns/PerspectiveGridStudio';
import { HalftoneStudio } from './tools/patterns/HalftoneStudio';
import { DitherStudio } from './tools/patterns/DitherStudio';
import { DieterDotsStudio } from './tools/patterns/DieterDotsStudio';
import { StarrySkyStudio } from './tools/patterns/StarrySkyStudio';
import { GridBackgroundStudio } from './tools/patterns/GridBackgroundStudio';
import { DoodleStudio } from './tools/patterns/DoodleStudio';

// Category 3: SVG & Shapes
import { WaveGeneratorStudio } from './tools/svg/WaveGeneratorStudio';
import { BlobGeneratorStudio } from './tools/svg/BlobGeneratorStudio';
import { ShapeGeneratorStudio } from './tools/svg/ShapeGeneratorStudio';
import { ConfettiStudio } from './tools/svg/ConfettiStudio';
import { SvgChartStudio } from './tools/svg/SvgChartStudio';

// Category 4: Colors & Palettes
import { HarmonicPaletteStudio } from './tools/colors/HarmonicPaletteStudio';
import { TailwindPaletteStudio } from './tools/colors/TailwindPaletteStudio';
import { ImagePaletteExtractorStudio } from './tools/colors/ImagePaletteExtractorStudio';

// Category 5: Converters
import { SvgToCssStudio } from './tools/converters/SvgToCssStudio';
import { SvgBase64Studio } from './tools/converters/SvgBase64Studio';
import { ImageBase64Studio } from './tools/converters/ImageBase64Studio';

export function App() {
  const [activeToolId, setActiveToolId] = useState<string>('shader-background-generator');
  const [isToolsGalleryOpen, setIsToolsGalleryOpen] = useState<boolean>(false);

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

  // Keyboard shortcut listener for Spacebar & Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsToolsGalleryOpen((prev) => !prev);
        return;
      }

      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      if (e.code === 'Space' && mode === 'image' && activeToolId === 'shader-background-generator') {
        e.preventDefault();
        randomizeAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, randomizeAll, activeToolId]);

  // Handle preset selection
  const handleSelectPreset = (preset: Preset) => {
    setSelectedPresetId(preset.id);
    commitState(preset.state);
  };

  // Handle saving new preset
  const handleSavePreset = (newPreset: Preset) => {
    const nextPresets = [newPreset, ...customPresets];
    setCustomPresets(nextPresets);
    setSelectedPresetId(newPreset.id);
    try {
      localStorage.setItem('magic_custom_shader_presets', JSON.stringify(nextPresets));
    } catch {
      // ignore
    }
  };

  // Handle copy image to clipboard
  const handleCopyClipboard = async () => {
    if (!canvasRef.current || isCopying) return;
    setIsCopying(true);
    try {
      const success = await canvasRef.current.copyToClipboard();
      if (success) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      }
    } catch (err) {
      console.error('Failed to copy canvas to clipboard:', err);
    } finally {
      setTimeout(() => setIsCopying(false), 2000);
    }
  };

  const activeShaderState = mode === 'video' ? timeline.effectiveState : state;

  // Render Studio dynamically based on active tool
  const renderActiveToolStudio = () => {
    switch (activeToolId) {
      case 'shader-background-generator':
        return (
          <>
            <div className="flex-1 flex overflow-hidden">
              <LeftSidebar
                state={activeShaderState}
                onUpdateState={updateState}
                onShuffleColors={shuffleColors}
                onShuffleSeed={shuffleSeed}
              />

              <PreviewArea
                state={activeShaderState}
                dimensions={dimensions}
                canvasRef={canvasRef}
              />

              <RightSidebar
                currentPresetId={selectedPresetId}
                onSelectPreset={handleSelectPreset}
                customPresets={customPresets}
                onOpenSaveModal={() => setIsSavePresetOpen(true)}
                onDeleteCustomPreset={(id) => {
                  const updated = customPresets.filter((p) => p.id !== id);
                  setCustomPresets(updated);
                  localStorage.setItem('magic_custom_shader_presets', JSON.stringify(updated));
                }}
                onImportPresetJson={(p) => {
                  handleSavePreset(p);
                }}
              />
            </div>

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
                onAddKeyframe={timeline.addKeyframeAtPlayhead}
                onRemoveKeyframe={timeline.removeKeyframe}
                onUpdateEasing={timeline.updateKeyframeEasing}
                onChangeDuration={timeline.setDuration}
              />
            )}
          </>
        );

      case 'gradient-generator':
        return <GradientStudio />;

      case 'iphone-13-gradient':
        return <AppleWallpaperStudio />;

      case 'god-rays-generator':
        return <GodRaysStudio />;

      case 'fractal-glass-effect':
        return <FractalGlassStudio />;

      case 'css-pattern-editor':
      case 'polka-dot-pattern-generator':
      case 'css-backgrounds':
      case 'css-stripe-backgrounds':
      case 'css-dot-backgrounds':
      case 'css-grid-backgrounds':
      case 'css-geometric-backgrounds':
      case 'css-wave-backgrounds':
        return <CssPatternStudio />;

      case 'perspective-grid-generator':
        return <PerspectiveGridStudio />;

      case 'halftone-generator':
      case 'cmyk-halftone':
        return <HalftoneStudio />;

      case 'dither-generator':
      case 'add-grain-to-images':
        return <DitherStudio />;

      case 'dieter-dots':
        return <DieterDotsStudio />;

      case 'starry-sky-generator':
        return <StarrySkyStudio />;

      case 'grid-background-pattern-generator':
        return <GridBackgroundStudio />;

      case 'doodle-backgrounds':
        return <DoodleStudio />;

      case 'wave-generator':
        return <WaveGeneratorStudio />;

      case 'blob-generator':
        return <BlobGeneratorStudio />;

      case 'shape-generator':
        return <ShapeGeneratorStudio />;

      case 'confetti-generator':
        return <ConfettiStudio />;

      case 'svg-chart-generator':
        return <SvgChartStudio />;

      case 'color-palette-generator':
      case 'color-tints-shades-generator':
        return <HarmonicPaletteStudio />;

      case 'tailwind-color-palette-generator':
        return <TailwindPaletteStudio />;

      case 'extract-palette-from-image':
        return <ImagePaletteExtractorStudio />;

      case 'svg-to-css':
      case 'css-to-svg':
        return <SvgToCssStudio />;

      case 'svg-to-base64':
      case 'base64-to-svg':
        return <SvgBase64Studio />;

      case 'image-to-base64':
      case 'base64-to-image':
        return <ImageBase64Studio />;

      default:
        return <GradientStudio />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Header */}
      <Header
        activeToolId={activeToolId}
        onOpenToolsGallery={() => setIsToolsGalleryOpen(true)}
        mode={mode}
        onModeChange={setMode}
        dimensions={dimensions}
        onDimensionsChange={setDimensions}
        canUndo={canUndo}
        canRedo={redo !== undefined && canRedo}
        onUndo={undo}
        onRedo={redo}
        onRandomize={randomizeAll}
        onCopyClipboard={handleCopyClipboard}
        onOpenExportImage={() => setIsExportImageOpen(true)}
        onOpenExportVideo={() => setIsExportVideoOpen(true)}
        onOpenExportCode={() => setIsExportCodeOpen(true)}
        onOpenSavePreset={() => setIsSavePresetOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        isCopying={isCopying}
      />

      {/* Main Studio Viewport */}
      {renderActiveToolStudio()}

      {/* Tools Gallery Switcher Modal */}
      <ToolsGalleryModal
        isOpen={isToolsGalleryOpen}
        onClose={() => setIsToolsGalleryOpen(false)}
        activeToolId={activeToolId}
        onSelectTool={(id) => {
          setActiveToolId(id);
          setIsToolsGalleryOpen(false);
        }}
      />

      {/* Global Shader Modals */}
      <ExportImageModal
        isOpen={isExportImageOpen}
        onClose={() => setIsExportImageOpen(false)}
        state={activeShaderState}
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
        state={activeShaderState}
      />

      <SavePresetModal
        isOpen={isSavePresetOpen}
        onClose={() => setIsSavePresetOpen(false)}
        state={activeShaderState}
        dimensions={dimensions}
        onSavePreset={handleSavePreset}
      />
    </div>
  );
}

export default App;
