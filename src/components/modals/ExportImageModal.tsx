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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#16171d] rounded-2xl shadow-2xl border border-[#2e303b] overflow-hidden flex flex-col text-[#f2f2f5]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#23242c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6268f8]/15 text-[#818cf8] flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f2f2f5]">Export Gradient Image</h3>
              <p className="text-xs text-[#8f94a8]">Download high-res image or copy to Figma</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#686c82] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Format selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#8f94a8]">
              Image Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    format === fmt
                      ? 'border-[#6268f8] bg-[#6268f8]/15 text-[#818cf8] ring-2 ring-[#6268f8]/30'
                      : 'border-[#2e303b] bg-[#1a1b24] text-[#8f94a8] hover:text-[#f2f2f5] hover:border-[#3d4050]'
                  }`}
                >
                  {fmt === 'jpeg' ? 'JPG' : fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Scale selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#8f94a8]">
              Resolution Scale
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 4].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScale(s)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    scale === s
                      ? 'border-[#6268f8] bg-[#6268f8]/15 text-[#818cf8] ring-2 ring-[#6268f8]/30'
                      : 'border-[#2e303b] bg-[#1a1b24] text-[#8f94a8] hover:text-[#f2f2f5] hover:border-[#3d4050]'
                  }`}
                >
                  {s}x {s === 2 ? '(2K/Retina)' : s === 4 ? '(4K Ultra)' : '(Normal)'}
                </button>
              ))}
            </div>
          </div>

          {/* Output info box */}
          <div className="p-3 bg-[#1a1b24] border border-[#2e303b] rounded-xl flex items-center justify-between text-xs text-[#8f94a8]">
            <span>Export Dimensions:</span>
            <span className="font-mono font-semibold text-[#f2f2f5]">
              {targetWidth} × {targetHeight} px
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[#23242c] bg-[#1a1b24]">
          <button
            type="button"
            onClick={handleCopyClipboard}
            disabled={isExporting}
            className="flex-1 py-2 px-4 rounded-xl border border-[#2e303b] bg-[#23242c] hover:bg-[#2a2b36] text-xs font-semibold text-[#f2f2f5] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#818cf8]" />
                <span>Copy Image</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-1 py-2 px-4 rounded-xl bg-white hover:bg-[#e5e5ea] text-xs font-semibold text-[#0e0f14] flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(255,255,255,0.2)] cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Rendering...' : 'Download'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
