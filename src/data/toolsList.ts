import type { ToolItem } from '../types/tools';

export const ALL_TOOLS: ToolItem[] = [
  // 1. Shaders & Gradients
  {
    id: 'shader-background-generator',
    slug: 'shader-background-generator',
    name: 'Shader Gradient Editor',
    category: 'shaders-gradients',
    categoryName: 'Shaders & Gradients',
    description: 'Generative WebGL shader gradients with wave distortion, retro dithering, film grain, and video timeline.',
    iconName: 'Sparkles',
    badge: 'Popular',
    tags: ['WebGL', 'GLSL', 'Liquid', 'Mesh', 'Dither', 'Animation', 'Video']
  },
  {
    id: 'gradient-generator',
    slug: 'gradient-generator',
    name: 'CSS & SVG Gradient Studio',
    category: 'shaders-gradients',
    categoryName: 'Shaders & Gradients',
    description: 'Multi-stop linear, radial, conic, and organic mesh gradient generator with angle controls and color interpolation.',
    iconName: 'Palette',
    badge: 'Popular',
    tags: ['Linear', 'Radial', 'Conic', 'Mesh', 'CSS', 'SVG']
  },
  {
    id: 'iphone-13-gradient',
    slug: 'iphone-13-gradient',
    name: 'Apple Iridescent Wallpaper Studio',
    category: 'shaders-gradients',
    categoryName: 'Shaders & Gradients',
    description: 'Create iconic Apple-style iridescent liquid chrome ribbons and pastel wallpaper backgrounds.',
    iconName: 'Smartphone',
    badge: 'New',
    tags: ['Apple', 'Wallpaper', 'Chrome', 'Iridescent', 'Liquid']
  },
  {
    id: 'god-rays-generator',
    slug: 'god-rays-generator',
    name: 'God Rays & Sunbeam Generator',
    category: 'shaders-gradients',
    categoryName: 'Shaders & Gradients',
    description: 'Volumetric light rays, sunbeam bursts, and atmospheric glow with customizable ray decay and density.',
    iconName: 'Sun',
    tags: ['Volumetric', 'Sunbeams', 'Atmosphere', 'Glow', 'Rays']
  },
  {
    id: 'fractal-glass-effect',
    slug: 'fractal-glass-effect',
    name: 'Fluted & Frosted Glass Studio',
    category: 'shaders-gradients',
    categoryName: 'Shaders & Gradients',
    description: 'Refractive fluted glass ribs, frosted texture blur, and chromatic aberration distortion.',
    iconName: 'Layers',
    badge: 'Pro',
    tags: ['Glassmorphism', 'Fluted', 'Refraction', 'Frosted', 'Blur']
  },

  // 2. Patterns & Textures
  {
    id: 'css-pattern-editor',
    slug: 'css-pattern-editor',
    name: 'CSS Background Pattern Editor',
    category: 'patterns-textures',
    categoryName: 'Patterns & Textures',
    description: '30+ seamless CSS background patterns (stripes, dots, chevron, zig-zag, checkers, crosshatch, waves).',
    iconName: 'Grid',
    badge: 'Popular',
    tags: ['CSS', 'Stripes', 'Dots', 'Checkers', 'Seamless', 'Background']
  },
  {
    id: 'perspective-grid-generator',
    slug: 'perspective-grid-generator',
    name: '3D Perspective Grid Generator',
    category: 'patterns-textures',
    categoryName: 'Patterns & Textures',
    description: 'Retro 80s synthwave horizon and isometric wireframe perspective grids with animated velocity and glow.',
    iconName: 'Box',
    badge: 'New',
    tags: ['3D', 'Synthwave', 'Isometric', 'Wireframe', 'Perspective']
  },
  {
    id: 'halftone-generator',
    slug: 'halftone-generator',
    name: 'Halftone Dot Matrix Generator',
    category: 'patterns-textures',
    categoryName: 'Patterns & Textures',
    description: 'Convert photos or generate procedural halftone screens with custom dot shapes, spacing, and contrast.',
    iconName: 'CircleDot',
    tags: ['Halftone', 'Print', 'Dot Matrix', 'Raster', 'Screen']
  },
  {
    id: 'cmyk-halftone',
    slug: 'cmyk-halftone',
    name: 'CMYK Offset Print Halftone',
    category: 'patterns-textures',
    categoryName: 'Patterns & Textures',
    description: 'Simulate authentic 4-color process (Cyan, Magenta, Yellow, Black) offset printing with rosette screen angles.',
    iconName: 'Layers',
    tags: ['CMYK', 'Printmaking', 'Newspaper', 'Vintage', 'Offset']
  },
  {
    id: 'dither-generator',
    slug: 'dither-generator',
    name: 'Retro Image Dither Studio',
    category: 'patterns-textures',
    categoryName: 'Patterns & Textures',
    description: 'Quantize and dither images with Floyd-Steinberg, Atkinson, Bayer 4x4/8x8, and Blue Noise algorithms.',
    iconName: 'Cpu',
    badge: 'Popular',
    tags: ['Dithering', 'Bayer', 'Floyd-Steinberg', 'Atkinson', '1-bit', 'Pixel']
  },
  {
    id: 'dieter-dots',
    slug: 'dieter-dots',
    name: 'Dieter Rams Perforated Grille',
    category: 'patterns-textures',
    categoryName: 'Patterns & Textures',
    description: 'Minimal Braun-inspired speaker grille patterns with metallic bevels, hole spacing, and shadow depth.',
    iconName: 'Disc',
    tags: ['Dieter Rams', 'Braun', 'Industrial', 'Perforated', 'Speaker']
  },
  {
    id: 'polka-dot-pattern-generator',
    slug: 'polka-dot-pattern-generator',
    name: 'Polka Dot Pattern Generator',
    category: 'patterns-textures',
    categoryName: 'Patterns & Textures',
    description: 'Custom polka dot grids with staggered hexagonal offsets, size variation, and random jitter.',
    iconName: 'Circle',
    tags: ['Polka Dots', 'Geometric', 'Scatter', 'Minimal']
  },
  {
    id: 'grid-background-pattern-generator',
    slug: 'grid-background-pattern-generator',
    name: 'Technical Blueprint & Graph Paper',
    category: 'patterns-textures',
    categoryName: 'Patterns & Textures',
    description: 'Engineering graph paper, millimeter grids, and technical blueprint patterns with major and minor axes.',
    iconName: 'LayoutGrid',
    tags: ['Blueprint', 'Graph Paper', 'Technical', 'Grid', 'Engineering']
  },
  {
    id: 'starry-sky-generator',
    slug: 'starry-sky-generator',
    name: 'Starry Sky & Nebula Generator',
    category: 'patterns-textures',
    categoryName: 'Patterns & Textures',
    description: 'Generative cosmic deep space with twinkling stars, constellation lines, and multi-color glowing nebula clouds.',
    iconName: 'Stars',
    tags: ['Space', 'Stars', 'Nebula', 'Cosmic', 'Night']
  },
  {
    id: 'doodle-backgrounds',
    slug: 'doodle-backgrounds',
    name: 'Doodle Scatter Backgrounds',
    category: 'patterns-textures',
    categoryName: 'Patterns & Textures',
    description: 'Playful hand-drawn geometric doodle scatters (stars, squiggles, triangles, sparks, arrows).',
    iconName: 'Pencil',
    tags: ['Doodles', 'Hand-drawn', 'Playful', 'Scatter', 'Geometric']
  },
  {
    id: 'add-grain-to-images',
    slug: 'add-grain-to-images',
    name: 'Film Grain Photo Overlay',
    category: 'patterns-textures',
    categoryName: 'Patterns & Textures',
    description: 'Apply tactile 35mm film grain, analog noise, and vintage textures with customizable blend modes.',
    iconName: 'Film',
    tags: ['Film Grain', 'Analog', 'Vintage', 'Noise', 'Overlay']
  },

  // 3. SVG & Generative Shapes
  {
    id: 'wave-generator',
    slug: 'wave-generator',
    name: 'SVG Layered Waves Generator',
    category: 'svg-shapes',
    categoryName: 'SVG & Shapes',
    description: 'Multi-layer organic SVG wave dividers with customizable amplitude, wavelength, complexity, and gradient fills.',
    iconName: 'Waves',
    badge: 'Popular',
    tags: ['SVG', 'Waves', 'Divider', 'Footer', 'Hero', 'Gradient']
  },
  {
    id: 'blob-generator',
    slug: 'blob-generator',
    name: 'Organic SVG Blob Generator',
    category: 'svg-shapes',
    categoryName: 'SVG & Shapes',
    description: 'Generate smooth morphing organic SVG blobs with control point counts, randomness, and linear/radial fills.',
    iconName: 'Droplet',
    badge: 'Popular',
    tags: ['Blob', 'Organic', 'SVG', 'Vector', 'Morph']
  },
  {
    id: 'shape-generator',
    slug: 'shape-generator',
    name: 'Geometric Shape & Starburst Badge',
    category: 'svg-shapes',
    categoryName: 'SVG & Shapes',
    description: 'Create starburst badges, geometric polygons, ticket shapes, and notched promo stickers with custom spikes.',
    iconName: 'Hexagon',
    tags: ['Starburst', 'Badge', 'Polygon', 'Sticker', 'Sale']
  },
  {
    id: 'confetti-generator',
    slug: 'confetti-generator',
    name: 'Festive Confetti Blast Generator',
    category: 'svg-shapes',
    categoryName: 'SVG & Shapes',
    description: 'Generate scattered confetti particles with ribbons, circles, squares, gravity, and particle spread.',
    iconName: 'PartyPopper',
    tags: ['Confetti', 'Party', 'Ribbons', 'Celebration', 'Physics']
  },
  {
    id: 'svg-chart-generator',
    slug: 'svg-chart-generator',
    name: 'SVG Sparkline & Trend Chart',
    category: 'svg-shapes',
    categoryName: 'SVG & Shapes',
    description: 'Clean SVG sparklines, trend graphs, area charts, and bar charts with smooth bezier curve interpolation.',
    iconName: 'TrendingUp',
    tags: ['Charts', 'Sparkline', 'Trend', 'Graph', 'Analytics', 'SVG']
  },

  // 4. Color & Palette Tools
  {
    id: 'color-palette-generator',
    slug: 'color-palette-generator',
    name: 'Harmonic Color Palette Studio',
    category: 'colors-palettes',
    categoryName: 'Color & Palettes',
    description: 'Generate harmonic palettes using Complementary, Analogous, Triadic, Tetradic, and Monochromatic color theory rules.',
    iconName: 'Palette',
    badge: 'Popular',
    tags: ['Color Theory', 'Harmonies', 'Hex', 'Palette', 'Export']
  },
  {
    id: 'tailwind-color-palette-generator',
    slug: 'tailwind-color-palette-generator',
    name: 'Tailwind CSS Palette Studio',
    category: 'colors-palettes',
    categoryName: 'Color & Palettes',
    description: 'Generate complete 50 to 950 color scale shade objects ready to drop directly into tailwind.config.js.',
    iconName: 'PaintBucket',
    badge: 'Pro',
    tags: ['Tailwind', 'Shades', '50-950', 'Theme', 'Frontend']
  },
  {
    id: 'color-tints-shades-generator',
    slug: 'color-tints-shades-generator',
    name: 'Color Tints, Shades & Tones',
    category: 'colors-palettes',
    categoryName: 'Color & Palettes',
    description: 'Generate calibrated lightness ramps (tints with white), darkness ramps (shades with black), and tones (with gray).',
    iconName: 'Sun',
    tags: ['Tints', 'Shades', 'Tones', 'Ramp', 'Luminance']
  },
  {
    id: 'extract-palette-from-image',
    slug: 'extract-palette-from-image',
    name: 'Image Color Palette Extractor',
    category: 'colors-palettes',
    categoryName: 'Color & Palettes',
    description: 'Upload any image to extract dominant, vibrant, muted, dark, and pastel color palettes with instant copy.',
    iconName: 'Image',
    tags: ['Extraction', 'Image', 'Sampling', 'Color Pick', 'Hex']
  },

  // 5. Converters & Developer Utilities
  {
    id: 'svg-to-css',
    slug: 'svg-to-css',
    name: 'SVG to CSS Data-URI Converter',
    category: 'converters-utilities',
    categoryName: 'Converters & Utilities',
    description: 'Convert raw SVG markup into ultra-clean, URL-encoded CSS background data URIs.',
    iconName: 'Code',
    tags: ['SVG', 'CSS', 'Data URI', 'Converter', 'Background']
  },
  {
    id: 'svg-to-base64',
    slug: 'svg-to-base64',
    name: 'SVG ↔ Base64 Dual Converter',
    category: 'converters-utilities',
    categoryName: 'Converters & Utilities',
    description: 'Lossless two-way conversion between vector SVG code and Base64 encoded strings with live vector preview.',
    iconName: 'Binary',
    tags: ['SVG', 'Base64', 'Encoder', 'Decoder']
  },
  {
    id: 'image-to-base64',
    slug: 'image-to-base64',
    name: 'Image ↔ Base64 Dual Converter',
    category: 'converters-utilities',
    categoryName: 'Converters & Utilities',
    description: 'Convert PNG/JPG/WebP image files into Base64 data strings and decode Base64 strings back to image files.',
    iconName: 'FileCode',
    tags: ['Base64', 'Image', 'PNG', 'JPG', 'Data URI']
  },
  {
    id: 'css-to-svg',
    slug: 'css-to-svg',
    name: 'CSS to SVG Asset Converter',
    category: 'converters-utilities',
    categoryName: 'Converters & Utilities',
    description: 'Convert CSS gradient and pattern declarations into standalone downloadable SVG vector assets.',
    iconName: 'FileSpreadsheet',
    tags: ['CSS', 'SVG', 'Vector', 'Asset', 'Export']
  }
];
