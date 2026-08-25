import React from 'react';
import type { CanvasDimensions, ShaderState } from '../../types/shader';
import { ShaderCanvas } from '../canvas/ShaderCanvas';
import type { ShaderCanvasRef } from '../canvas/ShaderCanvas';

interface PreviewAreaProps {
  state: ShaderState;
  dimensions: CanvasDimensions;
  customTime?: number;
  canvasRef: React.RefObject<ShaderCanvasRef | null>;
  onFrameUpdate?: (time: number) => void;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({
  state,
  dimensions,
  customTime,
  canvasRef,
  onFrameUpdate
}) => {
  return (
    <main className="relative flex-1 h-full bg-[#f5f5f7] flex items-center justify-center p-6 sm:p-10 overflow-hidden select-none">
      {/* Top Floating Badge with Dimensions & Aspect */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-[#e5e5ea] shadow-sm text-xs font-medium text-[#86868b]">
        <span className="font-mono font-semibold text-[#1d1d1f]">
          {dimensions.width} × {dimensions.height}
        </span>
        {dimensions.aspectRatio && (
          <>
            <span className="text-[#e5e5ea]">•</span>
            <span className="text-[11px] text-[#a1a1a6]">{dimensions.aspectRatio}</span>
          </>
        )}
      </div>

      {/* Main Canvas Framing Container */}
      <div className="relative w-full h-full max-w-5xl max-h-[75vh] flex items-center justify-center">
        <div
          className="relative max-w-full max-h-full rounded-lg border border-[#000000]/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden transition-all duration-300 bg-white"
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
    </main>
  );
};
