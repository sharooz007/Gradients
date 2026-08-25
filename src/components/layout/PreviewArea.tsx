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
    <main className="relative flex-1 h-full canvas-grid-bg flex items-center justify-center p-6 sm:p-10 overflow-hidden select-none">
      {/* Top Floating Badge with Dimensions & Aspect */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-xs font-medium text-slate-600 dark:text-slate-300">
        <span className="font-mono font-semibold text-slate-900 dark:text-white">
          {dimensions.width} × {dimensions.height}
        </span>
        {dimensions.aspectRatio && (
          <>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[11px] text-slate-400">{dimensions.aspectRatio}</span>
          </>
        )}
      </div>

      {/* Main Canvas Framing Container */}
      <div className="relative w-full h-full max-w-5xl max-h-[75vh] flex items-center justify-center">
        <div
          className="relative max-w-full max-h-full rounded-2xl p-1.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-2xl transition-all duration-300"
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
