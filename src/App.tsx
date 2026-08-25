import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { AppMode, Preset, ShaderState } from './types/shader';
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
    undo,
    redo,
    canUndo,
    canRedo,
    shuffleColors,
    shuffleSeed,
    randomizeAll
  } = useShaderState(PRESETS[0].state);

  const [copiedClipboard, setCopiedClipboard] = useState(false);

  const handleQuickCopy = async () => {
    if (!canvasRef.current) return;
    const ok = await canvasRef.current.copyToClipboard();
    if (ok) {
      setCopiedClipboard(true);
      try {
        confetti({
          particleCount: 40,
          spread: 45,
          origin: { y: 0.8 }
        });
      } catch {
        // ignore
      }
      setTimeout(() => setCopiedClipboard(false), 2500);
    }
  };

  // Video timeline management
  const timeline = useVideoTimeline(state);
  const canvasRef = useRef<ShaderCanvasRef | null>(null);

  // Keyboard Shortcuts (⌘K for tool palette, Spacebar for randomize/play)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsToolsGalleryOpen((prev) => !prev);
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (mode === 'video') {
          timeline.togglePlay();
        } else {
          randomizeAll();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, randomizeAll, timeline]);

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

  const handleUpdateShaderState = (updates: Partial<ShaderState>, commit?: boolean) => {
    if (mode === 'video') {
      if (timeline.selectedKeyframeId) {
        timeline.updateKeyframeValues(timeline.selectedKeyframeId, updates);
      }
      updateState(updates, commit);
    } else {
      updateState(updates, commit);
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
          <div className="flex-1 flex min-h-0 h-[calc(100vh-3.5rem)] overflow-hidden bg-[#0e0f14]">
            <LeftSidebar
              state={activeShaderState}
              dimensions={dimensions}
              mode={mode}
              project={timeline.project}
              selectedKeyframeId={timeline.selectedKeyframeId}
              onSelectKeyframe={(id) => {
                timeline.setSelectedKeyframeId(id);
                const kf = timeline.project.keyframes.find((k) => k.id === id);
                if (kf) timeline.seek(kf.time);
              }}
              onUpdateKeyframeEasing={timeline.updateKeyframeEasing}
              onRemoveKeyframe={timeline.removeKeyframe}
              onChangeDuration={timeline.setDuration}
              onUpdateState={handleUpdateShaderState}
              onUpdateDimensions={setDimensions}
              onShuffleColors={shuffleColors}
              onShuffleSeed={shuffleSeed}
            />

            <PreviewArea
              state={activeShaderState}
              dimensions={dimensions}
              mode={mode}
              onSetMode={setMode}
              canvasRef={canvasRef}
              footerContent={
                mode === 'video' ? (
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
                    onRandomizeKeyframe={(id) => {
                      const kf = timeline.project.keyframes.find((k) => k.id === id);
                      if (kf) {
                        const randomRot = Math.floor(Math.random() * 360);
                        const randomFreq = 1.0 + Math.random() * 10.0;
                        timeline.updateKeyframeValues(id, {
                          rotation: randomRot,
                          freq: randomFreq,
                          amplitude: 0.5 + Math.random() * 2.5
                        });
                      }
                    }}
                    onDuplicateKeyframe={(id) => {
                      const kf = timeline.project.keyframes.find((k) => k.id === id);
                      if (kf) {
                        timeline.addKeyframeAtPlayhead({ ...kf.values });
                      }
                    }}
                  />
                ) : null
              }
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
    <div className="flex flex-col h-screen w-screen bg-[#0e0f14] text-[#f2f2f5] overflow-hidden font-sans">
      {/* Studio Navigation Header */}
      <AppleHeader
        view={view}
        activeTool={activeToolItem}
        onNavigateHome={() => setView('home')}
        onOpenSearch={() => setIsToolsGalleryOpen(true)}
        onGenerateNew={view === 'tool' && activeToolId === 'shader-background-generator' ? randomizeAll : undefined}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onSave={() => setIsSavePresetOpen(true)}
        onExport={
          view === 'tool' && activeToolId === 'shader-background-generator'
            ? () => (mode === 'video' ? setIsExportVideoOpen(true) : setIsExportImageOpen(true))
            : undefined
        }
        toolActions={
          view === 'tool' && activeToolId === 'shader-background-generator' ? (
            <div className="flex items-center gap-1.5">
              {/* Quick Copy to Clipboard */}
              <button
                type="button"
                onClick={handleQuickCopy}
                className="hidden md:inline-flex studio-btn studio-btn-secondary"
                title="Copy PNG image to clipboard for Figma/Canva"
              >
                <span>{copiedClipboard ? 'Copied Image!' : 'Copy PNG'}</span>
              </button>

              {/* Code Export Button */}
              <button
                type="button"
                onClick={() => setIsExportCodeOpen(true)}
                className="hidden lg:inline-flex studio-btn studio-btn-secondary"
                title="View React, GLSL, HTML and CSS code"
              >
                <span>Code</span>
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
