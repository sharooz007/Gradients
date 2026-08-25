import * as THREE from 'three';

/**
 * Creates a high-precision 1D gradient texture with linear interpolation across multi-stop colors.
 */
export function createGradientTexture(colors: string[]): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 512, 0);
    const colorList = colors && colors.length > 0 ? colors : ['#090238', '#6903F9', '#FF15E5', '#DCC5FF'];
    
    if (colorList.length === 1) {
      gradient.addColorStop(0, colorList[0]);
      gradient.addColorStop(1, colorList[0]);
    } else {
      colorList.forEach((col, i) => {
        gradient.addColorStop(i / (colorList.length - 1), col);
      });
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}
