import React, { useState, useRef } from 'react';
import { X, Film, Download, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ShaderState, VideoProject, CanvasDimensions } from '../../types/shader';
import type { ShaderCanvasRef } from '../canvas/ShaderCanvas';
import { exportVideoSequence } from '../../engine/videoExporter';

interface ExportVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ShaderState;
  project: VideoProject;
  dimensions: CanvasDimensions;
  canvasRef: React.RefObject<ShaderCanvasRef | null>;
}

export const ExportVideoModal: React.FC<ExportVideoModalProps> = ({
  isOpen,
  onClose,
  state,
  project,
  dimensions,
  canvasRef
}) => {
  const [format, setFormat] = useState<'webm' | 'mp4'>('webm');
  const [fps, setFps] = useState<number>(30);
  const [scale, setScale] = useState<number>(1);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cancelFlagRef = useRef(false);

  if (!isOpen) return null;

  const targetWidth = Math.round(dimensions.width * scale);
  const targetHeight = Math.round(dimensions.height * scale);

  const handleStartExport = async () => {
    if (!canvasRef.current) return;
    const renderer = canvasRef.current.getRenderer();
    if (!renderer) return;

    setIsExporting(true);
    setProgress(0);
    setErrorMsg(null);
    cancelFlagRef.current = false;

    try {
      const blob = await exportVideoSequence(state, project, {
        format,
        fps,
        duration: project.duration,
        width: dimensions.width,
        height: dimensions.height,
        scale,
        onProgress: (p: number) => setProgress(p),
        shouldCancel: () => cancelFlagRef.current
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shader-animation-${project.duration}s-${dimensions.width}x${dimensions.height}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      onClose();
    } catch (err: any) {
      if (err.message !== 'Export cancelled by user') {
        console.error('Video export error:', err);
        setErrorMsg(err.message || 'Export failed');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleCancel = () => {
    cancelFlagRef.current = true;
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#16171d] rounded-2xl shadow-2xl border border-[#2e303b] overflow-hidden flex flex-col text-[#f2f2f5]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#23242c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6268f8]/15 text-[#818cf8] flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f2f2f5]">Export Video Animation</h3>
              <p className="text-xs text-[#8f94a8]">Render loop timeline as WebM or MP4</p>
            </div>
          </div>
          <button
            onClick={isExporting ? handleCancel : onClose}
            className="p-1 rounded-lg text-[#686c82] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Format selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#8f94a8]">
              Video Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { fmt: 'webm', label: 'WebM (VP9 Ultra HD)' },
                { fmt: 'mp4', label: 'MP4 (H.264 Universal)' }
              ].map((item) => (
                <button
                  key={item.fmt}
                  type="button"
                  disabled={isExporting}
                  onClick={() => setFormat(item.fmt as 'webm' | 'mp4')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    format === item.fmt
                      ? 'border-[#6268f8] bg-[#6268f8]/15 text-[#818cf8] ring-2 ring-[#6268f8]/30'
                      : 'border-[#2e303b] bg-[#1a1b24] text-[#8f94a8] hover:text-[#f2f2f5] hover:border-[#3d4050]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* FPS & Scale */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#8f94a8]">
                Frame Rate
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[30, 60].map((f) => (
                  <button
                    key={f}
                    type="button"
                    disabled={isExporting}
                    onClick={() => setFps(f)}
                    className={`py-1.5 px-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                      fps === f
                        ? 'border-[#6268f8] bg-[#6268f8]/15 text-[#818cf8] ring-2 ring-[#6268f8]/30'
                        : 'border-[#2e303b] bg-[#1a1b24] text-[#8f94a8] hover:text-[#f2f2f5]'
                    }`}
                  >
                    {f} FPS
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#8f94a8]">
                Resolution Scale
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { s: 1, l: '1x (HD)' },
                  { s: 2, l: '2x (4K)' }
                ].map((item) => (
                  <button
                    key={item.s}
                    type="button"
                    disabled={isExporting}
                    onClick={() => setScale(item.s)}
                    className={`py-1.5 px-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                      scale === item.s
                        ? 'border-[#6268f8] bg-[#6268f8]/15 text-[#818cf8] ring-2 ring-[#6268f8]/30'
                        : 'border-[#2e303b] bg-[#1a1b24] text-[#8f94a8] hover:text-[#f2f2f5]'
                    }`}
                  >
                    {item.l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Details Box */}
          <div className="p-3 bg-[#1a1b24] border border-[#2e303b] rounded-xl flex items-center justify-between text-xs text-[#8f94a8]">
            <span>Total Duration:</span>
            <span className="font-mono font-semibold text-[#f2f2f5]">
              {project.duration.toFixed(1)}s ({Math.round(project.duration * fps)} frames @ {targetWidth}×{targetHeight}px)
            </span>
          </div>

          {/* Progress Bar (during export) */}
          {isExporting && (
            <div className="flex flex-col gap-2 p-3 bg-[#1a1b24] rounded-xl border border-[#2e303b]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#818cf8] animate-pulse">
                  Rendering WebGL Frames...
                </span>
                <span className="font-mono font-bold text-[#f2f2f5]">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-[#23242c] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#6268f8] to-[#818cf8] transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[#23242c] bg-[#1a1b24]">
          <button
            type="button"
            onClick={isExporting ? handleCancel : onClose}
            className="flex-1 py-2 px-4 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2a2b36] text-xs font-semibold text-[#f2f2f5] transition-all cursor-pointer"
          >
            {isExporting ? 'Cancel Export' : 'Close'}
          </button>

          {!isExporting && (
            <button
              type="button"
              onClick={handleStartExport}
              className="flex-1 py-2 px-4 rounded-xl bg-white hover:bg-[#e5e5ea] text-xs font-semibold text-[#0e0f14] flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(255,255,255,0.2)] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Render Video</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
