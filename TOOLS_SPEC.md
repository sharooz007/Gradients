# MagicPattern Design Tools Suite - Specification Document

This document outlines the complete specification, algorithms, parameters, controls, and export formats for each of the 17 designated tools in the suite.

---

## 1. Shader Background Generator
- **URL**: `https://www.magicpattern.design/tools/shader-background-generator`
- **Category**: Shaders & Gradients
- **Core Math / Algorithm**:
  - WebGL fragment shader with `modulatedSquareWave`, `fastTanh`, coordinate 2D displacement warp.
  - Bayer $4 \times 4$ dithering matrix quantization.
  - Dynamic hash film grain, smoothstep radial vignette, Rodrigues' hue rotation.
- **Controls & Adjustments**:
  - 2 to 6 color stops with palette shuffle.
  - Wave Geometry: Zoom (0.1–3.0), Rotation (0–360°), Frequency (1–10), Sharpness (0–5), Amplitude (0–5).
  - Distortion & Warp: Warp Intensity (0–10), Frequency X/Y (0.5–8.0).
  - Retro Dithering: Bayer matrix toggle, Bit depth levels (2–64), Scale factor (1–8).
  - Film Grain: Intensity (0–0.2), Vignette intensity (0–1.0).
  - Fluted / Frosted glass postprocessing pass.
  - Color Filters: Hue (-180° to +180°), Brightness (-1 to +1), Contrast (0 to 3).
  - Animation & Seed: Live time evolution with speed multiplier, random seed shuffle.
  - Video Timeline Mode: Keyframe insertion, playhead scrubber, easing curves (Linear, EaseIn, EaseOut, EaseInOut), loop toggle.
- **Exports**: PNG/JPG/WebP at 1x, 2x, 4x; WebM/MP4 video loop; React component; GLSL code; HTML canvas; CSS fallback.

---

## 2. Mesh Gradients Studio
- **URL**: `https://www.magicpattern.design/tools/mesh-gradients`
- **Category**: Shaders & Gradients
- **Core Math / Algorithm**:
  - Multi-point 2D coordinate mesh with Gaussian radial falloffs and smooth spatial color blending.
- **Controls & Adjustments**:
  - 4 to 9 interactive draggable control points on canvas.
  - Individual point color pickers, opacity, and coordinate positions $(x, y)$.
  - Global blur radius (10px to 200px), mesh jitter, aspect ratio selection.
  - Randomize point coordinates and color harmonies.
- **Exports**: 4K PNG, SVG vector mesh markup, CSS radial-gradient approximation.

---

## 3. God Rays & Sunbeam Generator
- **URL**: `https://www.magicpattern.design/tools/god-rays-generator`
- **Category**: Shaders & Gradients
- **Core Math / Algorithm**:
  - Radial volumetric light scattering with exponential decay and particle dust blending.
- **Controls & Adjustments**:
  - Origin point $(X, Y)$, ray density / count (12 to 96), light exposure (0.2 to 3.0), ray decay falloff (0.5 to 0.99).
  - Light ray tint color, dark background color.
  - Floating dust motes particle density.
- **Exports**: 4K PNG, SVG, and WebGL code snippet.

---

## 4. Fractal & Fluted Glass Studio
- **URL**: `https://www.magicpattern.design/tools/fractal-glass-effect`
- **Category**: Shaders & Gradients
- **Core Math / Algorithm**:
  - Fluted cylinder normal mapping, surface frosted noise, chromatic aberration color displacement.
- **Controls & Adjustments**:
  - Style: Fluted (vertical ribs), Frosted (frosted blur), Fractal.
  - Rib count / frequency (8 to 80), refraction distortion (0.1 to 1.5), specular rib highlight (0 to 1.0).
  - Custom image upload or generative gradient backdrop.
- **Exports**: High-res PNG with alpha channel, React component.

---

## 5. Halftone Dot Matrix Generator
- **URL**: `https://www.magicpattern.design/tools/halftone-generator`
- **Category**: Patterns & Textures
- **Core Math / Algorithm**:
  - Luminance sampling of procedural gradients or uploaded photos mapped to dot diameter.
- **Controls & Adjustments**:
  - Dot diameter (4px to 40px), grid spacing / pitch (8px to 50px), screen angle (0° to 90°), contrast curve (0.5 to 2.5).
  - Dot shapes: Circle, Square, Diamond, Line raster.
  - Foreground dot color, background color.
  - Image upload support.
- **Exports**: High-res PNG, Scalable SVG vector file.

---

## 6. CMYK Offset Print Halftone
- **URL**: `https://www.magicpattern.design/tools/cmyk-halftone`
- **Category**: Patterns & Textures
- **Core Math / Algorithm**:
  - 4-color process color separation (Cyan, Magenta, Yellow, Key/Black) with standard offset screen rosette angles (Cyan 15°, Magenta 75°, Yellow 0°, Black 45°).
- **Controls & Adjustments**:
  - Dot resolution, rosette pattern scale, channel gain / contrast.
  - Image upload or sample photos.
- **Exports**: High-res PNG, 4-color SVG print layers.

---

## 7. Geometric Patterns Generator
- **URL**: `https://www.magicpattern.design/tools/geometric-patterns`
- **Category**: Patterns & Textures
- **Core Math / Algorithm**:
  - Tessellating geometric polygons: Isometric 3D cubes, equilateral triangles, hexagons, interlocking scales, octagons.
- **Controls & Adjustments**:
  - Pattern type selection, tile size (20px to 200px), stroke thickness, 2-3 palette colors, fill mode.
- **Exports**: SVG pattern file, CSS background code, PNG.

---

## 8. Seamless Patterns Generator
- **URL**: `https://www.magicpattern.design/tools/seamless-patterns`
- **Category**: Patterns & Textures
- **Core Math / Algorithm**:
  - Seamless SVG vector tile repeater with boundary edge wrapping and randomized distribution.
- **Controls & Adjustments**:
  - Motif library (circles, crosses, stars, squiggles, badges, pills), grid spacing, rotation jitter, color palette.
- **Exports**: Seamless tileable SVG file, CSS `background-repeat` code, PNG.

---

## 9. Grid & Blueprint Pattern Generator
- **URL**: `https://www.magicpattern.design/tools/grid-background-pattern-generator`
- **Category**: Patterns & Textures
- **Core Math / Algorithm**:
  - Multi-tier technical blueprint, graph paper millimeter subdivisions, and dot matrix axes.
- **Controls & Adjustments**:
  - Grid theme (Blueprint, Millimeter Graph, Dot Grid), major grid size (40–200px), minor subdivisions (2–10), major line color, minor line color, background color, coordinate numbers toggle.
- **Exports**: CSS background snippet, SVG vector asset, PNG.

---

## 10. Polka Dot Pattern Generator
- **URL**: `https://www.magicpattern.design/tools/polka-dot-pattern-generator`
- **Category**: Patterns & Textures
- **Core Math / Algorithm**:
  - Square and hexagonal staggered polka dot matrix with size variance and jitter.
- **Controls & Adjustments**:
  - Dot radius (2–30px), spacing / pitch (10–100px), layout mode (Square grid vs Staggered Hex), dot color, background color, opacity.
- **Exports**: CSS background declaration, SVG file, PNG.

---

## 11. CSS Backgrounds Studio
- **URL**: `https://www.magicpattern.design/tools/css-backgrounds`
  - Subtypes: `css-stripe-backgrounds`, `css-dot-backgrounds`, `css-grid-backgrounds`, `css-geometric-backgrounds`, `css-wave-backgrounds`.
- **Category**: Patterns & Textures
- **Core Math / Algorithm**:
  - Pure CSS gradient patterns using `repeating-linear-gradient`, `radial-gradient`, and multi-layer blend modes.
- **Controls & Adjustments**:
  - Pattern categories: Diagonal Stripes, Polka Dots, Grid Lines, Checkerboard, Crosshatch, Zig-zag Chevron, Wave curves.
  - Tile dimensions, stroke weight, angle, foreground/background colors.
- **Exports**: One-click copy CSS background code, SVG file, PNG.

---

## 12. Add Grain & Film Noise to Images
- **URL**: `https://www.magicpattern.design/tools/add-grain-to-images`
- **Category**: Patterns & Textures
- **Core Math / Algorithm**:
  - Analog 35mm film grain, per-pixel luminance noise, Gaussian distribution with blend mode compositing.
- **Controls & Adjustments**:
  - Noise intensity (0–100%), grain roughness / scale (1–6px), monochromatic vs color noise, blend mode (Overlay, Soft Light, Screen, Multiply), image upload support.
- **Exports**: Processed high-res PNG image.

---

## 13. SVG Sparkline & Chart Generator
- **URL**: `https://www.magicpattern.design/tools/svg-chart-generator`
- **Category**: SVG & Charts
- **Core Math / Algorithm**:
  - Smooth Catmull-Rom / cubic bezier spline interpolation for data visualization curves.
- **Controls & Adjustments**:
  - Chart type: Area fill, Smooth line sparkline, Bar chart.
  - Data points editor / randomize, stroke thickness, line color, gradient fill color, data point dots toggle, smooth curve toggle.
- **Exports**: Pure SVG markup, React component, PNG.

---

## 14. Harmonic Color Palette Generator
- **URL**: `https://www.magicpattern.design/tools/color-palette-generator`
- **Category**: Color & Palettes
- **Core Math / Algorithm**:
  - HSL / OKLab color wheel harmony calculations: Complementary ($180^\circ$), Analogous ($\pm 30^\circ$), Triadic ($120^\circ$), Tetradic ($90^\circ$), Monochromatic (luminance stepping).
- **Controls & Adjustments**:
  - Base anchor color, harmony rule selector, individual color lock/unlock toggles, spacebar randomize, contrast ratio indicators (WCAG 2.1).
- **Exports**: Hex codes list, CSS variables (`:root`), JSON, Tailwind color object.

---

## 15. Color Tints, Shades & Tones Generator
- **URL**: `https://www.magicpattern.design/tools/color-tints-shades-generator`
- **Category**: Color & Palettes
- **Core Math / Algorithm**:
  - Precise color ramp stepping: Tints (interpolated with white `#FFF`), Shades (interpolated with black `#000`), Tones (interpolated with neutral gray `#808080`).
- **Controls & Adjustments**:
  - Base hex color, ramp steps count (5 to 21 steps), step distribution curve.
- **Exports**: Hex array, CSS variables, JSON.

---

## 16. Tailwind Color Palette Generator
- **URL**: `https://www.magicpattern.design/tools/tailwind-color-palette-generator`
- **Category**: Color & Palettes
- **Core Math / Algorithm**:
  - Luminance-calibrated 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 shade generation.
- **Controls & Adjustments**:
  - Base color input (500 anchor), palette key name, lightness / chroma curve fine-tuning.
- **Exports**: Copy-pasteable `tailwind.config.js` color object, CSS variables.

---

## 17. Extract Palette from Image
- **URL**: `https://www.magicpattern.design/tools/extract-palette-from-image`
- **Category**: Color & Palettes
- **Core Math / Algorithm**:
  - Canvas pixel sampling and color quantization (k-means / median cut clustering) to isolate dominant, vibrant, dark, and pastel hues.
- **Controls & Adjustments**:
  - Drag-and-drop image upload, sample count (4 to 8 colors), sample density, copy hex code on click.
- **Exports**: Hex color list, CSS theme snippet, JSON.
