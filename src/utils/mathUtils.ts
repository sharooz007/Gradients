export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpAngle(a: number, b: number, t: number): number {
  const da = (b - a) % 360;
  const num = (2 * da) % 360 - da;
  return a + num * t;
}

export function randomRange(min: number, max: number, step: number = 0.01): number {
  const count = Math.round((max - min) / step);
  const r = Math.floor(Math.random() * (count + 1));
  const val = min + r * step;
  return Math.round(val * 1000) / 1000;
}
