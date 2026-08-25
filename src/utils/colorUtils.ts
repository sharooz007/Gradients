export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  let cleaned = hex.replace('#', '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function rgbToHex(rgb: RGB): string {
  const r = Math.round(rgb.r).toString(16).padStart(2, '0');
  const g = Math.round(rgb.g).toString(16).padStart(2, '0');
  const b = Math.round(rgb.b).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`.toUpperCase();
}

export function lerpColor(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const mixed: RGB = {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t
  };
  return rgbToHex(mixed);
}

export function lerpColorArrays(colorsA: string[], colorsB: string[], t: number): string[] {
  const maxLen = Math.max(colorsA.length, colorsB.length);
  const result: string[] = [];

  for (let i = 0; i < maxLen; i++) {
    const colA = colorsA[Math.min(i, colorsA.length - 1)];
    const colB = colorsB[Math.min(i, colorsB.length - 1)];
    result.push(lerpColor(colA, colB, t));
  }

  return result;
}
