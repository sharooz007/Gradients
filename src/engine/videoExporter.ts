import type { ShaderState, VideoProject } from '../types/shader';
import { interpolateVideoState } from '../utils/interpolation';
import { ShaderRenderer } from './ShaderRenderer';

export interface VideoExportOptions {
  format: 'webm' | 'mp4' | 'gif';
  fps: number;
  duration: number;
  width: number;
  height: number;
  scale: number;
  onProgress: (progress: number) => void;
  shouldCancel: () => boolean;
}

export async function exportVideoSequence(
  baseState: ShaderState,
  project: VideoProject,
  options: VideoExportOptions
): Promise<Blob> {
  const { format, fps, duration, width, height, scale, onProgress, shouldCancel } = options;
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);
  const totalFrames = Math.round(duration * fps);

  // Setup offscreen canvas and recording stream
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get 2d context for video export');
  }

  // Create WebGL frame renderer
  const offscreenWebGL = document.createElement('canvas');
  offscreenWebGL.width = targetWidth;
  offscreenWebGL.height = targetHeight;
  const frameRenderer = new ShaderRenderer(offscreenWebGL);

  // Check supported MIME type
  let mimeType = 'video/webm;codecs=vp9';
  if (format === 'mp4' && MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
    mimeType = 'video/mp4;codecs=avc1';
  } else if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : '';
  }

  const stream = canvas.captureStream(fps);
  const recordedChunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, {
    mimeType: mimeType || undefined,
    videoBitsPerSecond: 12000000 // 12 Mbps
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  recorder.start();

  // Render each frame sequentially at exact discrete timestamps
  for (let f = 0; f < totalFrames; f++) {
    if (shouldCancel()) {
      recorder.stop();
      frameRenderer.dispose();
      throw new Error('Export cancelled by user');
    }

    const t = (f / totalFrames) * duration;
    const interpolatedState = project.keyframes.length > 0
      ? interpolateVideoState(baseState, project, t)
      : { ...baseState, seed: baseState.seed + t * baseState.speed };

    frameRenderer.updateState(interpolatedState, targetWidth, targetHeight, t);
    ctx.drawImage(offscreenWebGL, 0, 0, targetWidth, targetHeight);

    onProgress(Math.round(((f + 1) / totalFrames) * 100));

    // Yield control briefly to ensure canvas stream pushes frame
    await new Promise((resolve) => setTimeout(resolve, 1000 / fps));
  }

  return new Promise((resolve) => {
    recorder.onstop = () => {
      frameRenderer.dispose();
      const outputBlob = new Blob(recordedChunks, { type: mimeType || 'video/webm' });
      resolve(outputBlob);
    };
    recorder.stop();
  });
}
