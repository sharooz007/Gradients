import React, { useState } from 'react';
import { X, Download, Copy, Check, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ShaderState, CanvasDimensions } from '../../types/shader';
import type { ShaderCanvasRef } from '../canvas/ShaderCanvas';

interface ExportImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ShaderState;
  dimensions: CanvasDimensions;
  canvasRef: React.RefObject<ShaderCanvasRef | null>;
}

export const ExportImageModal: React.FC<ExportImageModalProps> = ({
  isOpen,
  onClose,
  state,
  dimensions,
  canvasRef
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [scale, setScale] = useState<number>(1);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetWidth = Math.round(dimensions.width * scale);
  const targetHeight = Math.round(dimensions.height * scale);

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);

    try {
      const offscreen = await canvasRef.current.renderHighRes(
        state,
        dimensions.width,
        dimensions.height,
        scale
      );

      const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
      const dataUrl = offscreen.toDataURL(mimeType, 0.95);

      const a = document.createElement('a');
      a.download = `shader-gradient-${dimensions.width}x${dimensions.height}-${Date.now()}.${format === 'jpeg' ? 'jpg' : format}`;
      a.href = dataUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });

      onClose();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);

    try {
      const offscreen = await canvasRef.current.renderHighRes(
        state,
        dimensions.width,
        dimensions.height,
        scale
      );

      offscreen.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied(true);
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.7 }
          });
          setTimeout(() => setCopied(false), 3000);
        } catch (clipErr) {
          console.error('Failed to copy to clipboard:', clipErr);
        } finally {
          setIsExporting(false);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to render for clipboard:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Export Gradient Image</h3>
              <p className="text-xs text-slate-500">Download high-res image or copy to Figma</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Format selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Image Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    format === fmt
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {fmt === 'jpeg' ? 'JPG' : fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Scale selection */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Resolution Scale
              </label>
              <span className="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400">
                {targetWidth} × {targetHeight} px
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { scale: 1, label: '1x Normal' },
                { scale: 2, label: '2x Retina' },
                { scale: 4, label: '4x Ultra 4K/8K' }
              ].map((item) => (
                <button
                  key={item.scale}
                  type="button"
                  onClick={() => setScale(item.scale)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    scale === item.scale
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownload}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Download {format.toUpperCase()}</span>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={handleCopyClipboard}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied Image to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Image to Clipboard</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
