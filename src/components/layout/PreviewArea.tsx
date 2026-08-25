import React from 'react';
import { Image, Video, Plus, Minus } from 'lucide-react';
import type { AppMode, CanvasDimensions, ShaderState } from '../../types/shader';
import { ShaderCanvas } from '../canvas/ShaderCanvas';
import type { ShaderCanvasRef } from '../canvas/ShaderCanvas';

interface PreviewAreaProps {
  state: ShaderState;
  dimensions: CanvasDimensions;
  mode?: AppMode;
  onSetMode?: (m: AppMode) => void;
  customTime?: number;
  canvasRef: React.RefObject<ShaderCanvasRef | null>;
  onFrameUpdate?: (time: number) => void;
  footerContent?: React.ReactNode;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({
  state,
  dimensions,
  mode = 'image',
  onSetMode,
  customTime,
  canvasRef,
  onFrameUpdate,
  footerContent
}) => {
  return (
    <main className="relative flex-1 h-full studio-grid-bg flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none">
      {/* Top Floating Mode Switcher: [ Image | Video ] */}
      <div className="z-10 shrink-0">
        {onSetMode && (
          <div className="flex items-center p-0.5 rounded-full bg-[#1c1d27]/90 backdrop-blur-md border border-[#2e303b] shadow-lg">
            <button
              type="button"
              onClick={() => onSetMode('image')}
              className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                mode === 'image'
                  ? 'bg-white text-[#0e0f14] shadow-xs'
                  : 'text-[#8f94a8] hover:text-[#f2f2f5]'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>Image</span>
            </button>
            <button
              type="button"
              onClick={() => onSetMode('video')}
              className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                mode === 'video'
                  ? 'bg-white text-[#0e0f14] shadow-xs'
                  : 'text-[#8f94a8] hover:text-[#f2f2f5]'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video</span>
            </button>
          </div>
        )}
      </div>

      {/* Center Canvas Framing Container */}
      <div className="relative w-full flex-1 max-w-4xl flex items-center justify-center min-h-0 my-2">
        <div
          className="relative max-w-full max-h-full rounded-2xl border border-[#2e303b] shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 bg-[#16171d] group"
          style={{
            aspectRatio: `${dimensions.width} / ${dimensions.height}`
          }}
        >
          <ShaderCanvas
            ref={canvasRef}
            state={state}
            width={dimensions.width}
            height={dimensions.height}
            customTime={customTime}
            onFrameUpdate={onFrameUpdate}
          />
        </div>
      </div>

      {/* Bottom Footer or Floating Player */}
      <div className="w-full shrink-0 flex flex-col items-center">
        {footerContent}

        {/* Bottom Left Feedback / Zoom Controls */}
        <div className="w-full flex items-center justify-between text-xs text-[#686c82] px-2 pt-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#1a1b24] border border-[#2e303b]">
              <button
                type="button"
                className="p-1 text-[#8f94a8] hover:text-[#f2f2f5] transition-colors rounded cursor-pointer"
                title="Zoom out"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                type="button"
                className="p-1 text-[#8f94a8] hover:text-[#f2f2f5] transition-colors rounded cursor-pointer"
                title="Zoom in"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <a
              href="https://www.magicpattern.design"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#8f94a8] hover:text-[#f2f2f5] transition-colors flex items-center gap-1"
            >
              <span>Share Feedback</span>
            </a>
          </div>

          <div className="font-mono text-[10px] text-[#686c82]">
            {dimensions.width} × {dimensions.height} ({dimensions.aspectRatio || 'Custom'})
          </div>
        </div>
      </div>
    </main>
  );
};

