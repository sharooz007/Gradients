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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Export Video Animation</h3>
              <p className="text-xs text-slate-500">Render loop timeline as WebM or MP4</p>
            </div>
          </div>
          <button
            onClick={isExporting ? handleCancel : onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Format selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
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
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    format === item.fmt
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
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
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Frame Rate
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[30, 60].map((f) => (
                  <button
                    key={f}
                    type="button"
                    disabled={isExporting}
                    onClick={() => setFps(f)}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-semibold ${
                      fps === f
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {f} FPS
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
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
                    className={`py-1.5 px-2 rounded-lg border text-xs font-semibold ${
                      scale === item.s
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs flex justify-between">
            <span className="text-slate-500">Duration: <strong className="text-slate-800 dark:text-slate-200">{project.duration}s</strong></span>
            <span className="text-slate-500">Output: <strong className="text-slate-800 dark:text-slate-200">{targetWidth} × {targetHeight}</strong></span>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Progress bar during export */}
          {isExporting && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Rendering frames...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-150 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            {isExporting ? (
              <button
                type="button"
                onClick={handleCancel}
                className="w-full py-3 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Cancel Export</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartExport}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export {format.toUpperCase()} Video</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
