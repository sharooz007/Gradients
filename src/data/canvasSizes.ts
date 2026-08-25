import type { CanvasDimensions } from "../types/shader";

export const CANVAS_SIZE_PRESETS: CanvasDimensions[] = [
  { width: 2000, height: 1400, label: "Landscape (2000x1400)", aspectRatio: "10:7" },
  { width: 1920, height: 1080, label: "Full HD (1920x1080)", aspectRatio: "16:9" },
  { width: 3840, height: 2160, label: "4K Ultra HD (3840x2160)", aspectRatio: "16:9" },
  { width: 1080, height: 1080, label: "Square (1080x1080)", aspectRatio: "1:1" },
  { width: 2000, height: 2000, label: "Square High-Res (2000x2000)", aspectRatio: "1:1" },
  { width: 1080, height: 1920, label: "Story / Vertical (1080x1920)", aspectRatio: "9:16" },
  { width: 1200, height: 630, label: "OpenGraph / Social (1200x630)", aspectRatio: "1.91:1" },
  { width: 1500, height: 500, label: "X / Twitter Banner (1500x500)", aspectRatio: "3:1" },
  { width: 1600, height: 1200, label: "Standard (1600x1200)", aspectRatio: "4:3" },
  { width: 1800, height: 1200, label: "Photo (1800x1200)", aspectRatio: "3:2" }
];
