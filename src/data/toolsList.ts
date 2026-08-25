import type { ToolItem } from '../types/tools';

export const TOOLS_LIST: ToolItem[] = [
  // 1. Shaders & Gradients
  {
    id: 'shader-background-generator',
    slug: 'shader-background-generator',
    name: 'Shader Background Generator',
    category: 'shaders-gradients',
    categoryName: 'Shaders & Gradients',
    description: 'Generate iridescent, modulated wave gradients with GLSL shaders, 2D warp, and video keyframes.',
    iconName: 'Sparkles',
    badge: 'Popular',
    tags: ['shader', 'gradient', 'glsl', 'wave', 'video', 'background']
  },
  {
    id: 'mesh-gradients',
    slug: 'mesh-gradients',
    name: 'Mesh Gradients',
    category: 'shaders-gradients',
    categoryName: 'Shaders & Gradients',
    description: 'Interactive multi-point 2D mesh gradient generator with Gaussian blur and draggable control points.',
    iconName: 'Palette',
    badge: 'Popular',
    tags: ['mesh', 'gradient', 'blur', 'radial', 'vector', 'colors']
  },
  {
    id: 'god-rays-generator',
    slug: 'god-rays-generator',
    name: 'God Rays Generator',
    category: 'shaders-gradients',
    categoryName: 'Shaders & Gradients',
    description: 'Create atmospheric volumetric light beams, sunbeam bursts, and particle dust scatter.',
    iconName: 'Sun',
    badge: 'New',
    tags: ['light', 'godrays', 'sunbeam', 'volumetric', 'rays', 'lighting']
  },
  {
    id: 'fractal-glass-effect',
    slug: 'fractal-glass-effect',
    name: 'Fractal Glass Effect',
    category: 'shaders-gradients',
    categoryName: 'Shaders & Gradients',
    description: 'Fluted vertical ribs, frosted texture blur, and chromatic refraction distortion overlays.',
    iconName: 'Layers',
    tags: ['glass', 'fluted', 'frosted', 'refraction', 'fractal', 'texture']
  },

  // 2. Patterns & Textures
  {
    id: 'halftone-generator',
    slug: 'halftone-generator',
    name: 'Halftone Dot Matrix Generator',
    category: 'patterns-textures',
    categoryName: 'Patterns & Textures',
    description: 'Screen raster halftone generator with circle, square, diamond, and line dot matrices from images or gradients.',
    iconName: 'CircleDot',
    badge: 'Popular',
    tags: ['halftone', 'dots', 'raster', 'print', 'retro', 'pattern']
  },
  {
    id: 'cmyk-halftone',
    slug: 'cmyk-halftone',
    name: 'CMYK Halftone Generator',
    category: 'patterns-textures',
    categoryName: 'Patterns & Textures',
    description: 'Authentic 4-color process (Cyan, Magenta, Yellow, Key) offset printing rosette simulation.',
    iconName: 'Printer',
    badge: 'New',
    tags: ['cmyk', 'print', 'offset', 'rosette', 'halftone', 'color-separation']
  },
  {
    id: 'geometric-patterns',
    slug: 'geometric-patterns',
    name: 'Geometric Patterns Generator',
    category: 'patterns-textures',
    categoryName: 'Patterns & Textures',
    description: 'Mathematical tessellations with 3D isometric cubes, equilateral triangles, hexagons, and scales.',
    iconName: 'Boxes',
    tags: ['geometric', 'tessellation', 'isometric', 'hexagons', 'cubes', 'svg']
  },
  {
    id: 'seamless-patterns',
    slug: 'seamless-patterns',
    name: 'Seamless Pattern Generator',
    category: 'patterns-textures',
    categoryName: 'Patterns & Textures',
    description: 'Infinite seamless vector pattern tiles with custom SVG motifs, repeat spacing, and jitter.',
    iconName: 'Repeat',
    tags: ['seamless', 'tiles', 'pattern', 'repeat', 'svg', 'background']
  },
  {
    id: 'grid-background-pattern-generator',
    slug: 'grid-background-pattern-generator',
    name: 'Grid Background Pattern Generator',
    category: 'patterns-textures',
    categoryName: 'Patterns & Textures',
    description: 'Technical engineering blueprint, millimeter graph paper, and dot matrix grids with coordinate markings.',
    iconName: 'Grid',
    tags: ['grid', 'blueprint', 'graph', 'paper', 'technical', 'coordinates']
  },
  {
    id: 'polka-dot-pattern-generator',
    slug: 'polka-dot-pattern-generator',
    name: 'Polka Dot Pattern Generator',
    category: 'patterns-textures',
    categoryName: 'Patterns & Textures',
    description: 'Square and hexagonal staggered polka dot matrices with customizable radius, pitch, and opacity.',
    iconName: 'Dot',
    tags: ['polkadot', 'dots', 'staggered', 'hex', 'pattern', 'css']
  },
  {
    id: 'css-backgrounds',
    slug: 'css-backgrounds',
    name: 'CSS Backgrounds Studio',
    category: 'patterns-textures',
    categoryName: 'Patterns & Textures',
    description: 'Collection of seamless CSS background patterns (stripes, dots, grid, geometric, waves) with 1-click CSS copy.',
    iconName: 'Code',
    badge: 'Popular',
    tags: ['css', 'stripes', 'dots', 'waves', 'backgrounds', 'gradients']
  },
  {
    id: 'add-grain-to-images',
    slug: 'add-grain-to-images',
    name: 'Add Grain to Images',
    category: 'patterns-textures',
    categoryName: 'Patterns & Textures',
    description: 'Add authentic 35mm film grain and analog noise texture to photos with blend mode compositing.',
    iconName: 'Sliders',
    tags: ['grain', 'noise', 'film', 'texture', 'photo', 'analog']
  },

  // 3. SVG & Charts
  {
    id: 'svg-chart-generator',
    slug: 'svg-chart-generator',
    name: 'SVG Chart Generator',
    category: 'svg-charts',
    categoryName: 'SVG & Charts',
    description: 'Clean SVG sparklines, trend graphs, area charts, and bar charts with smooth bezier curve interpolation.',
    iconName: 'TrendingUp',
    tags: ['chart', 'svg', 'sparkline', 'graph', 'trend', 'vector']
  },

  // 4. Color & Palettes
  {
    id: 'color-palette-generator',
    slug: 'color-palette-generator',
    name: 'Color Palette Generator',
    category: 'colors-palettes',
    categoryName: 'Color & Palettes',
    description: 'Harmonic color palette generator with spacebar shuffle, color locking, and contrast check.',
    iconName: 'Sparkle',
    badge: 'Popular',
    tags: ['palette', 'harmony', 'colors', 'hsl', 'contrast', 'generator']
  },
  {
    id: 'color-tints-shades-generator',
    slug: 'color-tints-shades-generator',
    name: 'Color Tints & Shades Generator',
    category: 'colors-palettes',
    categoryName: 'Color & Palettes',
    description: 'Calculate smooth lightness tints (with white), darkness shades (with black), and neutral tones.',
    iconName: 'SunMedium',
    tags: ['tints', 'shades', 'tones', 'color', 'ramp', 'lightness']
  },
  {
    id: 'tailwind-color-palette-generator',
    slug: 'tailwind-color-palette-generator',
    name: 'Tailwind Color Palette Generator',
    category: 'colors-palettes',
    categoryName: 'Color & Palettes',
    description: 'Generate full 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 color scale objects for Tailwind.',
    iconName: 'Wand2',
    tags: ['tailwind', 'palette', '50-950', 'shades', 'config', 'css']
  },
  {
    id: 'extract-palette-from-image',
    slug: 'extract-palette-from-image',
    name: 'Extract Palette from Image',
    category: 'colors-palettes',
    categoryName: 'Color & Palettes',
    description: 'Sample photos and extract dominant, vibrant, muted, dark, and pastel color ramps with hex copy.',
    iconName: 'Pipette',
    tags: ['extract', 'image', 'colors', 'quantize', 'photo', 'sample']
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'All Tools', count: 17 },
  { id: 'shaders-gradients', name: 'Shaders & Gradients', count: 4 },
  { id: 'patterns-textures', name: 'Patterns & Textures', count: 8 },
  { id: 'colors-palettes', name: 'Color & Palettes', count: 4 },
  { id: 'svg-charts', name: 'SVG & Charts', count: 1 }
];
