import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import type { ShaderState } from '../../types/shader';
import { ShaderRenderer } from '../../engine/ShaderRenderer';

export interface ShaderCanvasRef {
  renderHighRes: (
    state: ShaderState,
    targetWidth: number,
    targetHeight: number,
    scale?: number
  ) => Promise<HTMLCanvasElement>;
  getRenderer: () => ShaderRenderer | null;
  copyToClipboard: () => Promise<boolean>;
}

interface ShaderCanvasProps {
  state: ShaderState;
  width: number;
  height: number;
  customTime?: number;
  onFrameUpdate?: (time: number) => void;
}

export const ShaderCanvas = forwardRef<ShaderCanvasRef, ShaderCanvasProps>(
  ({ state, width, height, customTime, onFrameUpdate }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<ShaderRenderer | null>(null);

    useImperativeHandle(ref, () => ({
      renderHighRes: (s, tw, th, scale = 1) => {
        if (!rendererRef.current) {
          throw new Error('Renderer not initialized');
        }
        return rendererRef.current.renderHighRes(s, tw, th, scale);
      },
      getRenderer: () => rendererRef.current,
      copyToClipboard: async () => {
        if (!rendererRef.current) return false;
        try {
          const exportCanvas = await rendererRef.current.renderHighRes(state, width, height, 1);
          return new Promise<boolean>((resolve) => {
            exportCanvas.toBlob(async (blob) => {
              if (!blob) {
                resolve(false);
                return;
              }
              try {
                await navigator.clipboard.write([
                  new ClipboardItem({ 'image/png': blob })
                ]);
                resolve(true);
              } catch (err) {
                console.error('Clipboard copy failed', err);
                resolve(false);
              }
            }, 'image/png');
          });
        } catch {
          return false;
        }
      }
    }));

    // Initialize renderer
    useEffect(() => {
      if (!canvasRef.current) return;

      const renderer = new ShaderRenderer(canvasRef.current);
      rendererRef.current = renderer;

      renderer.resize(width, height);
      renderer.updateState(state, width, height, customTime);

      if (state.animate) {
        renderer.startAnimation(onFrameUpdate);
      }

      return () => {
        renderer.dispose();
        rendererRef.current = null;
      };
    }, []);

    // Update state & dimensions
    useEffect(() => {
      if (!rendererRef.current) return;
      rendererRef.current.resize(width, height);
      rendererRef.current.updateState(state, width, height, customTime);

      if (state.animate) {
        rendererRef.current.startAnimation(onFrameUpdate);
      } else {
        rendererRef.current.stopAnimation();
      }
    }, [state, width, height, customTime, onFrameUpdate]);

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full object-contain rounded-lg shadow-2xl transition-shadow duration-300"
        style={{
          aspectRatio: `${width} / ${height}`
        }}
      />
    );
  }
);
