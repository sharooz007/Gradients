import * as THREE from 'three';
import type { ShaderState } from '../types/shader';
import { vertexShader } from './glsl/vertexShader.glsl';
import { fragmentShader } from './glsl/fragmentShader.glsl';
import { flutedGlassShader } from './glsl/flutedGlassShader.glsl';
import { createGradientTexture } from './textureUtils';

export class ShaderRenderer {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private gradientTexture: THREE.CanvasTexture | null = null;

  // Postprocessing for Glass effect
  private glassScene: THREE.Scene;
  private glassMaterial: THREE.ShaderMaterial;
  private glassMesh: THREE.Mesh;
  private renderTarget: THREE.WebGLRenderTarget | null = null;

  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private currentTime: number = 0;
  private isAnimating: boolean = false;
  private onFrameUpdate?: (time: number) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Core Gradient Shader Material
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_resolution: { value: new THREE.Vector2(canvas.width, canvas.height) },
        u_time: { value: 0 },
        u_scale: { value: 1.0 },
        u_gradient: { value: null },
        speed: { value: 1.0 },
        zoom: { value: 1.0 },
        freq: { value: 4.0 },
        sharpness: { value: 2.0 },
        amplitude: { value: 1.0 },
        waveWidthMod: { value: 0.5 },
        offsetX: { value: 0.0 },
        offsetY: { value: 0.0 },
        rotation: { value: 0.0 },
        localWarpIntensity: { value: 0.4 },
        localWarpFreqX: { value: 1.0 },
        localWarpFreqY: { value: 1.9 },
        warpDirection: { value: new THREE.Vector2(1, -1) },
        ditherEnabled: { value: false },
        ditherLevels: { value: 16.0 },
        ditherScale: { value: 4.0 },
        grainEnabled: { value: false },
        grainIntensity: { value: 0.02 },
        grainSpeed: { value: 50.0 },
        vignetteEnabled: { value: false },
        vignetteIntensity: { value: 1.0 },
        vignetteRadius: { value: 0.4 },
        brightness: { value: 1.0 },
        contrast: { value: 1.0 },
        hue: { value: 0.0 }
      }
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);

    // Glass Postprocessing Scene
    this.glassScene = new THREE.Scene();
    this.glassMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: flutedGlassShader,
      uniforms: {
        tDiffuse: { value: null },
        u_resolution: { value: new THREE.Vector2(canvas.width, canvas.height) },
        distortion: { value: 0.5 },
        fluteSections: { value: 25.0 },
        blur: { value: 0.2 },
        lightPosition: { value: new THREE.Vector3(1, 1, 1) },
        style: { value: 0 }
      }
    });
    this.glassMesh = new THREE.Mesh(geometry, this.glassMaterial);
    this.glassScene.add(this.glassMesh);
  }

  public updateState(state: ShaderState, width: number, height: number, customTime?: number) {
    const pixelRatio = this.renderer.getPixelRatio();
    const renderWidth = width * pixelRatio;
    const renderHeight = height * pixelRatio;

    // Update gradient texture if colors changed
    if (this.gradientTexture) {
      this.gradientTexture.dispose();
    }
    this.gradientTexture = createGradientTexture(state.colors);
    this.material.uniforms.u_gradient.value = this.gradientTexture;

    // Update core uniforms
    const u = this.material.uniforms;
    u.u_resolution.value.set(renderWidth, renderHeight);
    
    if (customTime !== undefined) {
      this.currentTime = customTime;
      u.u_time.value = customTime;
    } else if (!state.animate) {
      u.u_time.value = state.seed;
      this.currentTime = state.seed;
    }

    u.speed.value = state.speed;
    u.zoom.value = state.zoom;
    u.freq.value = state.freq;
    u.sharpness.value = state.sharpness;
    u.amplitude.value = state.amplitude;
    u.waveWidthMod.value = state.waveWidthMod;
    u.offsetX.value = state.offsetX;
    u.offsetY.value = state.offsetY;
    u.rotation.value = state.rotation;
    u.localWarpIntensity.value = state.localWarpIntensity;
    u.localWarpFreqX.value = state.localWarpFreqX;
    u.localWarpFreqY.value = state.localWarpFreqY;
    u.warpDirection.value.set(state.warpDirection[0], state.warpDirection[1]);
    u.ditherEnabled.value = state.ditherEnabled;
    u.ditherLevels.value = state.ditherLevels;
    u.ditherScale.value = state.ditherScale;
    u.grainEnabled.value = state.grainEnabled;
    u.grainIntensity.value = state.grainIntensity;
    u.grainSpeed.value = state.grainSpeed;
    u.vignetteEnabled.value = state.vignetteEnabled;
    u.vignetteIntensity.value = state.vignetteIntensity;
    u.vignetteRadius.value = state.vignetteRadius;
    u.brightness.value = state.brightness;
    u.contrast.value = state.contrast;
    u.hue.value = state.hue;

    // Glass postprocessing uniforms
    const gu = this.glassMaterial.uniforms;
    gu.u_resolution.value.set(renderWidth, renderHeight);
    gu.distortion.value = state.fractalGlassDistortion;
    gu.fluteSections.value = state.fractalGlassSteps;
    gu.blur.value = state.fractalGlassBlur;
    gu.style.value = state.fractalGlassStyle === 'fluted' ? 2 : state.fractalGlassStyle === 'frosted' ? 1 : 0;

    this.isAnimating = state.animate;
    this.renderPass(state.fractalGlassEnabled, width, height);
  }

  public resize(width: number, height: number) {
    this.renderer.setSize(width, height, false);
    const pixelRatio = this.renderer.getPixelRatio();
    this.material.uniforms.u_resolution.value.set(width * pixelRatio, height * pixelRatio);
    this.glassMaterial.uniforms.u_resolution.value.set(width * pixelRatio, height * pixelRatio);

    if (this.renderTarget) {
      this.renderTarget.dispose();
      this.renderTarget = null;
    }
  }

  public renderPass(glassEnabled: boolean, width: number, height: number) {
    const pixelRatio = this.renderer.getPixelRatio();
    const pw = Math.floor(width * pixelRatio);
    const ph = Math.floor(height * pixelRatio);

    if (glassEnabled) {
      if (!this.renderTarget || this.renderTarget.width !== pw || this.renderTarget.height !== ph) {
        if (this.renderTarget) this.renderTarget.dispose();
        this.renderTarget = new THREE.WebGLRenderTarget(pw, ph, {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat
        });
      }

      this.renderer.setRenderTarget(this.renderTarget);
      this.renderer.render(this.scene, this.camera);

      this.renderer.setRenderTarget(null);
      this.glassMaterial.uniforms.tDiffuse.value = this.renderTarget.texture;
      this.renderer.render(this.glassScene, this.camera);
    } else {
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.scene, this.camera);
    }
  }

  public startAnimation(onFrame?: (time: number) => void) {
    this.onFrameUpdate = onFrame;
    this.lastTime = performance.now();

    const loop = (time: number) => {
      const delta = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;

      if (this.isAnimating) {
        this.currentTime += delta * (this.material.uniforms.speed.value || 1.0);
        this.material.uniforms.u_time.value = this.currentTime;
        if (this.onFrameUpdate) {
          this.onFrameUpdate(this.currentTime);
        }
      }

      this.renderPass(
        this.glassMaterial.uniforms.distortion.value > 0 && this.renderTarget !== null,
        this.canvas.width,
        this.canvas.height
      );

      this.animationFrameId = requestAnimationFrame(loop);
    };

    if (!this.animationFrameId) {
      this.animationFrameId = requestAnimationFrame(loop);
    }
  }

  public stopAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Render high-resolution export image
   */
  public async renderHighRes(
    state: ShaderState,
    targetWidth: number,
    targetHeight: number,
    scale: number = 1
  ): Promise<HTMLCanvasElement> {
    const outWidth = Math.round(targetWidth * scale);
    const outHeight = Math.round(targetHeight * scale);

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = outWidth;
    offscreenCanvas.height = outHeight;

    const offRenderer = new THREE.WebGLRenderer({
      canvas: offscreenCanvas,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    offRenderer.setPixelRatio(1);
    offRenderer.setSize(outWidth, outHeight, false);

    const offScene = new THREE.Scene();
    const offCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const offMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: THREE.UniformsUtils.clone(this.material.uniforms)
    });

    const gradTex = createGradientTexture(state.colors);
    offMaterial.uniforms.u_gradient.value = gradTex;
    offMaterial.uniforms.u_resolution.value.set(outWidth, outHeight);
    offMaterial.uniforms.u_scale.value = scale;
    offMaterial.uniforms.u_time.value = state.animate ? this.currentTime : state.seed;

    offMaterial.uniforms.speed.value = state.speed;
    offMaterial.uniforms.zoom.value = state.zoom;
    offMaterial.uniforms.freq.value = state.freq;
    offMaterial.uniforms.sharpness.value = state.sharpness;
    offMaterial.uniforms.amplitude.value = state.amplitude;
    offMaterial.uniforms.waveWidthMod.value = state.waveWidthMod;
    offMaterial.uniforms.offsetX.value = state.offsetX;
    offMaterial.uniforms.offsetY.value = state.offsetY;
    offMaterial.uniforms.rotation.value = state.rotation;
    offMaterial.uniforms.localWarpIntensity.value = state.localWarpIntensity;
    offMaterial.uniforms.localWarpFreqX.value = state.localWarpFreqX;
    offMaterial.uniforms.localWarpFreqY.value = state.localWarpFreqY;
    offMaterial.uniforms.warpDirection.value.set(state.warpDirection[0], state.warpDirection[1]);
    offMaterial.uniforms.ditherEnabled.value = state.ditherEnabled;
    offMaterial.uniforms.ditherLevels.value = state.ditherLevels;
    offMaterial.uniforms.ditherScale.value = state.ditherScale;
    offMaterial.uniforms.grainEnabled.value = state.grainEnabled;
    offMaterial.uniforms.grainIntensity.value = state.grainIntensity;
    offMaterial.uniforms.grainSpeed.value = state.grainSpeed;
    offMaterial.uniforms.vignetteEnabled.value = state.vignetteEnabled;
    offMaterial.uniforms.vignetteIntensity.value = state.vignetteIntensity;
    offMaterial.uniforms.vignetteRadius.value = state.vignetteRadius;
    offMaterial.uniforms.brightness.value = state.brightness;
    offMaterial.uniforms.contrast.value = state.contrast;
    offMaterial.uniforms.hue.value = state.hue;

    const offMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), offMaterial);
    offScene.add(offMesh);

    if (state.fractalGlassEnabled) {
      const rt = new THREE.WebGLRenderTarget(outWidth, outHeight);
      offRenderer.setRenderTarget(rt);
      offRenderer.render(offScene, offCamera);

      const glassMat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: flutedGlassShader,
        uniforms: {
          tDiffuse: { value: rt.texture },
          u_resolution: { value: new THREE.Vector2(outWidth, outHeight) },
          distortion: { value: state.fractalGlassDistortion },
          fluteSections: { value: state.fractalGlassSteps },
          blur: { value: state.fractalGlassBlur },
          lightPosition: { value: new THREE.Vector3(1, 1, 1) },
          style: { value: state.fractalGlassStyle === 'fluted' ? 2 : state.fractalGlassStyle === 'frosted' ? 1 : 0 }
        }
      });
      const glassScn = new THREE.Scene();
      glassScn.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), glassMat));

      offRenderer.setRenderTarget(null);
      offRenderer.render(glassScn, offCamera);
      rt.dispose();
      glassMat.dispose();
    } else {
      offRenderer.setRenderTarget(null);
      offRenderer.render(offScene, offCamera);
    }

    gradTex.dispose();
    offMaterial.dispose();
    offRenderer.dispose();

    return offscreenCanvas;
  }

  public dispose() {
    this.stopAnimation();
    if (this.gradientTexture) this.gradientTexture.dispose();
    if (this.renderTarget) this.renderTarget.dispose();
    this.material.dispose();
    this.glassMaterial.dispose();
    this.renderer.dispose();
  }
}
