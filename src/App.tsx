import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { AppMode, Preset } from './types/shader';
import { PRESETS } from './data/presets';
import { TOOLS_LIST } from './data/toolsList';
import { useShaderState } from './hooks/useShaderState';
import { useVideoTimeline } from './hooks/useVideoTimeline';
import type { ShaderCanvasRef } from './components/canvas/ShaderCanvas';
import { AppleHeader } from './components/layout/AppleHeader';
import { HomePage } from './components/layout/HomePage';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { PreviewArea } from './components/layout/PreviewArea';
import { VideoTimeline } from './components/timeline/VideoTimeline';
import { ExportImageModal } from './components/modals/ExportImageModal';
import { ExportVideoModal } from './components/modals/ExportVideoModal';
import { ExportCodeModal } from './components/modals/ExportCodeModal';
import { SavePresetModal } from './components/modals/SavePresetModal';
import { ToolsGalleryModal } from './components/modals/ToolsGalleryModal';

// Shaders & Gradients Studios
import { MeshGradientStudio } from './tools/shaders/MeshGradientStudio';
import { GodRaysStudio } from './tools/shaders/GodRaysStudio';
import { FractalGlassStudio } from './tools/shaders/FractalGlassStudio';

// Patterns & Textures Studios
import { HalftoneStudio } from './tools/patterns/HalftoneStudio';
import { CmykHalftoneStudio } from './tools/patterns/CmykHalftoneStudio';
import { GeometricPatternStudio } from './tools/patterns/GeometricPatternStudio';
import { SeamlessPatternStudio } from './tools/patterns/SeamlessPatternStudio';
import { GridBackgroundStudio } from './tools/patterns/GridBackgroundStudio';
import { PolkaDotStudio } from './tools/patterns/PolkaDotStudio';
import { CssPatternStudio } from './tools/patterns/CssPatternStudio';
import { FilmGrainStudio } from './tools/patterns/FilmGrainStudio';

// SVG & Charts Studios
import { SvgChartStudio } from './tools/svg/SvgChartStudio';

// Colors & Palettes Studios
import { HarmonicPaletteStudio } from './tools/colors/HarmonicPaletteStudio';
import { ColorTintsShadesStudio } from './tools/colors/ColorTintsShadesStudio';
import { TailwindPaletteStudio } from './tools/colors/TailwindPaletteStudio';
import { ImagePaletteExtractorStudio } from './tools/colors/ImagePaletteExtractorStudio';

export function App() {
  const [view, setView] = useState<'home' | 'tool'>('home');
  const [activeToolId, setActiveToolId] = useState<string>('shader-background-generator');
  const [isToolsGalleryOpen, setIsToolsGalleryOpen] = useState<boolean>(false);

  const [mode, setMode] = useState<AppMode>('image');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESETS[0].id);

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
    shuffleColors,
    shuffleSeed,
    randomizeAll
  } = useShaderState(PRESETS[0].state);

  // Video timeline management
  const timeline = useVideoTimeline(state);
  const canvasRef = useRef<ShaderCanvasRef | null>(null);

  // Keyboard Shortcuts (⌘K for tool palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsToolsGalleryOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectPreset = (preset: Preset) => {
    setSelectedPresetId(preset.id);
    commitState(preset.state);
    if (preset.dimensions) {
      setDimensions(preset.dimensions);
    }
  };

  const handleSavePreset = (preset: Preset) => {
    const updated = [...customPresets, preset];
    setCustomPresets(updated);
    localStorage.setItem('magic_custom_shader_presets', JSON.stringify(updated));
    setSelectedPresetId(preset.id);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch {
      // ignore
    }
  };

  const activeToolItem = TOOLS_LIST.find((t) => t.id === activeToolId);
  const activeShaderState = mode === 'video' ? timeline.effectiveState : state;

  // Render Studio dynamically based on active tool
  const renderActiveToolStudio = () => {
    switch (activeToolId) {
      // 1. Shaders & Gradients
      case 'shader-background-generator':
        return (
          <>
            <div className="flex-1 flex min-h-0 h-[calc(100vh-3.5rem)] overflow-hidden">
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

      case 'mesh-gradients':
        return <MeshGradientStudio />;

      case 'god-rays-generator':
        return <GodRaysStudio />;

      case 'fractal-glass-effect':
        return <FractalGlassStudio />;

      // 2. Patterns & Textures
      case 'halftone-generator':
        return <HalftoneStudio />;

      case 'cmyk-halftone':
        return <CmykHalftoneStudio />;

      case 'geometric-patterns':
        return <GeometricPatternStudio />;

      case 'seamless-patterns':
        return <SeamlessPatternStudio />;

      case 'grid-background-pattern-generator':
        return <GridBackgroundStudio />;

      case 'polka-dot-pattern-generator':
        return <PolkaDotStudio />;

      case 'css-backgrounds':
        return <CssPatternStudio />;

      case 'add-grain-to-images':
        return <FilmGrainStudio />;

      // 3. SVG & Charts
      case 'svg-chart-generator':
        return <SvgChartStudio />;

      // 4. Colors & Palettes
      case 'color-palette-generator':
        return <HarmonicPaletteStudio />;

      case 'color-tints-shades-generator':
        return <ColorTintsShadesStudio />;

      case 'tailwind-color-palette-generator':
        return <TailwindPaletteStudio />;

      case 'extract-palette-from-image':
        return <ImagePaletteExtractorStudio />;

      default:
        return <HomePage onSelectTool={(id) => { setActiveToolId(id); setView('tool'); }} />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f5f5f7] text-[#1d1d1f] overflow-hidden font-sans">
      {/* Apple Light Navigation Header */}
      <AppleHeader
        view={view}
        activeTool={activeToolItem}
        onNavigateHome={() => setView('home')}
        onOpenSearch={() => setIsToolsGalleryOpen(true)}
        onExport={
          view === 'tool' && activeToolId === 'shader-background-generator'
            ? () => (mode === 'video' ? setIsExportVideoOpen(true) : setIsExportImageOpen(true))
            : undefined
        }
        toolActions={
          view === 'tool' && activeToolId === 'shader-background-generator' ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center p-0.5 rounded-full bg-[#f2f2f7] border border-[#e5e5ea] text-xs">
                <button
                  type="button"
                  onClick={() => setMode('image')}
                  className={`px-3 py-1 rounded-full font-medium transition-all ${
                    mode === 'image'
                      ? 'bg-white text-[#1d1d1f] shadow-2xs'
                      : 'text-[#86868b] hover:text-[#1d1d1f]'
                  }`}
                >
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => setMode('video')}
                  className={`px-3 py-1 rounded-full font-medium transition-all ${
                    mode === 'video'
                      ? 'bg-white text-[#1d1d1f] shadow-2xs'
                      : 'text-[#86868b] hover:text-[#1d1d1f]'
                  }`}
                >
                  Video
                </button>
              </div>

              <button
                type="button"
                onClick={randomizeAll}
                className="apple-pill-btn apple-pill-btn-secondary gap-1"
                title="Randomize (Space)"
              >
                <span>Generate</span>
                <kbd className="text-[10px] opacity-60">Space</kbd>
              </button>
            </div>
          ) : undefined
        }
      />

      {/* Main Content Area: Homepage vs Tool Studio */}
      {view === 'home' ? (
        <HomePage
          onSelectTool={(id) => {
            setActiveToolId(id);
            setView('tool');
          }}
        />
      ) : (
        renderActiveToolStudio()
      )}

      {/* Tools Gallery Modal (⌘K Switcher) */}
      <ToolsGalleryModal
        isOpen={isToolsGalleryOpen}
        onClose={() => setIsToolsGalleryOpen(false)}
        onSelectTool={(toolId) => {
          setActiveToolId(toolId);
          setView('tool');
        }}
        currentToolId={activeToolId}
      />

      {/* Modals for Shader Studio */}
      {isExportImageOpen && (
        <ExportImageModal
          isOpen={isExportImageOpen}
          onClose={() => setIsExportImageOpen(false)}
          state={activeShaderState}
          dimensions={dimensions}
          canvasRef={canvasRef}
        />
      )}

      {isExportVideoOpen && (
        <ExportVideoModal
          isOpen={isExportVideoOpen}
          onClose={() => setIsExportVideoOpen(false)}
          state={activeShaderState}
          project={timeline.project}
          dimensions={dimensions}
          canvasRef={canvasRef}
        />
      )}

      {isExportCodeOpen && (
        <ExportCodeModal
          isOpen={isExportCodeOpen}
          onClose={() => setIsExportCodeOpen(false)}
          state={activeShaderState}
        />
      )}

      {isSavePresetOpen && (
        <SavePresetModal
          isOpen={isSavePresetOpen}
          onClose={() => setIsSavePresetOpen(false)}
          state={activeShaderState}
          dimensions={dimensions}
          onSavePreset={handleSavePreset}
        />
      )}
    </div>
  );
}
export default App;
