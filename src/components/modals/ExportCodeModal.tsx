import React, { useState } from 'react';
import { X, Code, Copy, Check } from 'lucide-react';
import type { ShaderState } from '../../types/shader';
import { fragmentShader } from '../../engine/glsl/fragmentShader.glsl';
import { vertexShader } from '../../engine/glsl/vertexShader.glsl';

interface ExportCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ShaderState;
}

export const ExportCodeModal: React.FC<ExportCodeModalProps> = ({
  isOpen,
  onClose,
  state
}) => {
  const [activeTab, setActiveTab] = useState<'react' | 'glsl' | 'html' | 'css'>('react');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getReactCode = () => `import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ShaderGradientProps {
  className?: string;
}

export const ShaderGradient: React.FC<ShaderGradientProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Gradient texture
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 512;
    texCanvas.height = 1;
    const ctx = texCanvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    const colors = ${JSON.stringify(state.colors)};
    colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 1);
    const u_gradient = new THREE.CanvasTexture(texCanvas);

    const material = new THREE.ShaderMaterial({
      vertexShader: \`${vertexShader.trim()}\`,
      fragmentShader: \`${fragmentShader.trim()}\`,
      uniforms: {
        u_resolution: { value: new THREE.Vector2(canvas.clientWidth, canvas.clientHeight) },
        u_time: { value: ${state.seed} },
        u_scale: { value: 1.0 },
        u_gradient: { value: u_gradient },
        speed: { value: ${state.speed} },
        zoom: { value: ${state.zoom} },
        freq: { value: ${state.freq} },
        sharpness: { value: ${state.sharpness} },
        amplitude: { value: ${state.amplitude} },
        waveWidthMod: { value: ${state.waveWidthMod} },
        offsetX: { value: ${state.offsetX} },
        offsetY: { value: ${state.offsetY} },
        rotation: { value: ${state.rotation} },
        localWarpIntensity: { value: ${state.localWarpIntensity} },
        localWarpFreqX: { value: ${state.localWarpFreqX} },
        localWarpFreqY: { value: ${state.localWarpFreqY} },
        warpDirection: { value: new THREE.Vector2(${state.warpDirection[0]}, ${state.warpDirection[1]}) },
        ditherEnabled: { value: ${state.ditherEnabled} },
        ditherLevels: { value: ${state.ditherLevels} },
        ditherScale: { value: ${state.ditherScale} },
        grainEnabled: { value: ${state.grainEnabled} },
        grainIntensity: { value: ${state.grainIntensity} },
        grainSpeed: { value: ${state.grainSpeed} },
        vignetteEnabled: { value: ${state.vignetteEnabled} },
        vignetteIntensity: { value: ${state.vignetteIntensity} },
        vignetteRadius: { value: ${state.vignetteRadius} },
        brightness: { value: ${state.brightness} },
        contrast: { value: ${state.contrast} },
        hue: { value: ${state.hue} }
      }
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    let animId: number;
    let time = ${state.seed};
    const animate = () => {
      ${state.animate ? 'time += 0.016 * ' + state.speed + ';\n      material.uniforms.u_time.value = time;' : ''}
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      material.uniforms.u_resolution.value.set(w * window.devicePixelRatio, h * window.devicePixelRatio);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className={className || 'w-full h-full'} />;
};
`;

  const getGlslCode = () => `// GLSL Mesh & Liquid Gradient Fragment Shader
// Compatible with Three.js, Shadertoy, GLSL Canvas
${fragmentShader.trim()}
`;

  const getHtmlCode = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Shader Gradient Background</title>
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
    canvas { width: 100%; height: 100%; display: block; }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
  <canvas id="gl-canvas"></canvas>
  <script>
    const canvas = document.getElementById('gl-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const texCanvas = document.createElement('canvas');
    texCanvas.width = 512; texCanvas.height = 1;
    const ctx = texCanvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    const colors = ${JSON.stringify(state.colors)};
    colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 1);
    const u_gradient = new THREE.CanvasTexture(texCanvas);

    const material = new THREE.ShaderMaterial({
      vertexShader: \`${vertexShader.trim()}\`,
      fragmentShader: \`${fragmentShader.trim()}\`,
      uniforms: {
        u_resolution: { value: new THREE.Vector2() },
        u_time: { value: ${state.seed} },
        u_scale: { value: 1.0 },
        u_gradient: { value: u_gradient },
        speed: { value: ${state.speed} },
        zoom: { value: ${state.zoom} },
        freq: { value: ${state.freq} },
        sharpness: { value: ${state.sharpness} },
        amplitude: { value: ${state.amplitude} },
        waveWidthMod: { value: ${state.waveWidthMod} },
        offsetX: { value: ${state.offsetX} },
        offsetY: { value: ${state.offsetY} },
        rotation: { value: ${state.rotation} },
        localWarpIntensity: { value: ${state.localWarpIntensity} },
        localWarpFreqX: { value: ${state.localWarpFreqX} },
        localWarpFreqY: { value: ${state.localWarpFreqY} },
        warpDirection: { value: new THREE.Vector2(${state.warpDirection[0]}, ${state.warpDirection[1]}) },
        ditherEnabled: { value: ${state.ditherEnabled} },
        ditherLevels: { value: ${state.ditherLevels} },
        ditherScale: { value: ${state.ditherScale} },
        grainEnabled: { value: ${state.grainEnabled} },
        grainIntensity: { value: ${state.grainIntensity} },
        grainSpeed: { value: ${state.grainSpeed} },
        vignetteEnabled: { value: ${state.vignetteEnabled} },
        vignetteIntensity: { value: ${state.vignetteIntensity} },
        vignetteRadius: { value: ${state.vignetteRadius} },
        brightness: { value: ${state.brightness} },
        contrast: { value: ${state.contrast} },
        hue: { value: ${state.hue} }
      }
    });

    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

    function resize() {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      material.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', resize);
    resize();

    let time = ${state.seed};
    function animate() {
      time += 0.016 * ${state.speed};
      material.uniforms.u_time.value = time;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
  </script>
</body>
</html>`;

  const getCssCode = () => `/* CSS Linear Gradient Fallback */
.gradient-bg {
  background: linear-gradient(
    ${state.rotation}deg,
    ${state.colors.map((c, i) => `${c} ${(i / (state.colors.length - 1)) * 100}%`).join(',\n    ')}
  );
}`;

  const getActiveCode = () => {
    switch (activeTab) {
      case 'react': return getReactCode();
      case 'glsl': return getGlslCode();
      case 'html': return getHtmlCode();
      case 'css': return getCssCode();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#16171d] rounded-2xl shadow-2xl border border-[#2e303b] overflow-hidden flex flex-col text-[#f2f2f5]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#23242c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6268f8]/15 text-[#818cf8] flex items-center justify-center">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f2f2f5]">Export Code Snippet</h3>
              <p className="text-xs text-[#8f94a8]">Embed this shader in your React or WebGL project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#686c82] hover:text-[#f2f2f5] hover:bg-[#23242c] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center px-6 pt-3 border-b border-[#23242c] gap-2 bg-[#1a1b24]">
          {[
            { id: 'react', label: 'React Component' },
            { id: 'glsl', label: 'GLSL Fragment' },
            { id: 'html', label: 'Standalone HTML' },
            { id: 'css', label: 'CSS Gradient' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#6268f8] text-[#818cf8]'
                  : 'border-transparent text-[#8f94a8] hover:text-[#f2f2f5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code view */}
        <div className="relative flex-1 p-4 overflow-hidden flex flex-col bg-[#0e0f14]">
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-6 right-6 z-10 py-1.5 px-3 rounded-lg bg-[#23242c] hover:bg-[#2a2b36] border border-[#2e303b] text-[#f2f2f5] text-xs font-medium flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#818cf8]" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <pre className="flex-1 overflow-auto font-mono text-xs text-[#9da1b4] p-4 leading-relaxed select-text custom-scrollbar">
            <code>{getActiveCode()}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

