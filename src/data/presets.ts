import type { Preset, ShaderState } from "../types/shader";

export const DEFAULT_SHADER_STATE: ShaderState = {
  "speed": 1,
  "zoom": 1,
  "freq": 4,
  "sharpness": 2,
  "amplitude": 1,
  "waveWidthMod": 0.5,
  "offsetX": 0,
  "offsetY": 0,
  "rotation": 0,
  "seed": 0,
  "animate": false,
  "localWarpIntensity": 0.4,
  "localWarpFreqX": 1,
  "localWarpFreqY": 1.9,
  "warpDirection": [
    1,
    -1
  ],
  "ditherEnabled": false,
  "ditherLevels": 16,
  "ditherScale": 4,
  "grainEnabled": false,
  "grainIntensity": 0.02,
  "grainSpeed": 50,
  "vignetteEnabled": false,
  "vignetteIntensity": 1,
  "vignetteRadius": 0.4,
  "fractalGlassEnabled": false,
  "fractalGlassStyle": "fractal",
  "fractalGlassSteps": 25,
  "fractalGlassDistortion": 0.5,
  "fractalGlassBlur": 0.2,
  "brightness": 1,
  "contrast": 1,
  "hue": 0,
  "colors": [
    "#090238",
    "#6903F9",
    "#FF15E5",
    "#DCC5FF"
  ]
};

export const PRESETS: Preset[] = [
  {
    "id": "ultraviolet-dream",
    "name": "Ultraviolet Dream",
    "dimensions": {
      "width": 2000,
      "height": 1400
    },
    "state": {
      "speed": 1,
      "zoom": 1,
      "freq": 4,
      "sharpness": 2,
      "amplitude": 1,
      "waveWidthMod": 0.5,
      "offsetX": 0,
      "offsetY": 0,
      "rotation": 0,
      "seed": 91.34177718023277,
      "animate": false,
      "localWarpIntensity": 2.2,
      "localWarpFreqX": 1,
      "localWarpFreqY": 5.2,
      "warpDirection": [
        1,
        -1
      ],
      "ditherEnabled": false,
      "ditherLevels": 16,
      "ditherScale": 4,
      "grainEnabled": false,
      "grainIntensity": 0.02,
      "grainSpeed": 50,
      "vignetteEnabled": false,
      "vignetteIntensity": 1,
      "vignetteRadius": 0.4,
      "fractalGlassEnabled": false,
      "fractalGlassStyle": "fractal",
      "fractalGlassSteps": 25,
      "fractalGlassDistortion": 0.5,
      "fractalGlassBlur": 0.2,
      "brightness": 1,
      "contrast": 1,
      "hue": 0,
      "colors": [
        "#090238",
        "#6903F9",
        "#FF15E5",
        "#DCC5FF"
      ]
    }
  },
  {
    "id": "blue-waves",
    "name": "Blue Waves",
    "dimensions": {
      "width": 2000,
      "height": 1400
    },
    "state": {
      "speed": 1,
      "zoom": 1.21,
      "freq": 2.9,
      "sharpness": 1,
      "amplitude": 0.7,
      "waveWidthMod": 1.6,
      "offsetX": 0,
      "offsetY": 0,
      "rotation": 0,
      "seed": 9.275139772396345,
      "animate": false,
      "localWarpIntensity": 1,
      "localWarpFreqX": 1,
      "localWarpFreqY": 7.6,
      "warpDirection": [
        1,
        -1
      ],
      "ditherEnabled": false,
      "ditherLevels": 17,
      "ditherScale": 5.5,
      "grainEnabled": false,
      "grainIntensity": 0.059,
      "grainSpeed": 53,
      "vignetteEnabled": false,
      "vignetteIntensity": 1,
      "vignetteRadius": 0.4,
      "fractalGlassEnabled": false,
      "fractalGlassStyle": "fractal",
      "fractalGlassSteps": 10,
      "fractalGlassDistortion": 0.38,
      "fractalGlassBlur": 0.36,
      "brightness": 0.88,
      "contrast": 1.27,
      "hue": 0,
      "colors": [
        "#276678",
        "#1687A7",
        "#D3E0EA",
        "#F6F5F5"
      ],
                      }
  },
  {
    "id": "aurora",
    "name": "Aurora",
    "dimensions": {
      "width": 2000,
      "height": 1400
    },
    "state": {
      "speed": 1,
      "zoom": 0.75,
      "freq": 4.3,
      "sharpness": 1,
      "amplitude": 0.69,
      "waveWidthMod": 0.34,
      "offsetX": 0,
      "offsetY": 0,
      "rotation": 69,
      "seed": 12.5,
      "animate": false,
      "localWarpIntensity": 0.6,
      "localWarpFreqX": 1,
      "localWarpFreqY": 1.6,
      "warpDirection": [
        1,
        -1
      ],
      "ditherEnabled": false,
      "ditherLevels": 16,
      "ditherScale": 4,
      "grainEnabled": true,
      "grainIntensity": 0.047,
      "grainSpeed": 0,
      "vignetteEnabled": false,
      "vignetteIntensity": 1,
      "vignetteRadius": 0.4,
      "fractalGlassEnabled": false,
      "fractalGlassStyle": "fractal",
      "fractalGlassSteps": 25,
      "fractalGlassDistortion": 0.5,
      "fractalGlassBlur": 0.2,
      "brightness": 1,
      "contrast": 1,
      "hue": 0,
      "colors": [
        "#021B1A",
        "#0C6972",
        "#1DD3B0",
        "#AFFC41"
      ]
    }
  },
  {
    "id": "sunset",
    "name": "Sunset",
    "dimensions": {
      "width": 2000,
      "height": 1400
    },
    "state": {
      "speed": 1,
      "zoom": 1,
      "freq": 4,
      "sharpness": 2.2,
      "amplitude": 1.3,
      "waveWidthMod": 0.5,
      "offsetX": 0,
      "offsetY": 0,
      "rotation": 200,
      "seed": 47.2,
      "animate": false,
      "localWarpIntensity": 0.8,
      "localWarpFreqX": 1,
      "localWarpFreqY": 1.6,
      "warpDirection": [
        1,
        -1
      ],
      "ditherEnabled": false,
      "ditherLevels": 16,
      "ditherScale": 4,
      "grainEnabled": true,
      "grainIntensity": 0.04,
      "grainSpeed": 50,
      "vignetteEnabled": false,
      "vignetteIntensity": 1,
      "vignetteRadius": 0.4,
      "fractalGlassEnabled": false,
      "fractalGlassStyle": "fractal",
      "fractalGlassSteps": 25,
      "fractalGlassDistortion": 0.5,
      "fractalGlassBlur": 0.2,
      "brightness": 1,
      "contrast": 1,
      "hue": 0,
      "colors": [
        "#2B0A3D",
        "#7B2D8E",
        "#FF5E78",
        "#FFC15E"
      ]
    }
  },
  {
    "id": "midnight",
    "name": "Midnight",
    "dimensions": {
      "width": 2000,
      "height": 1400
    },
    "state": {
      "speed": 1,
      "zoom": 0.94,
      "freq": 7,
      "sharpness": 1,
      "amplitude": 2.75,
      "waveWidthMod": 0.44,
      "offsetX": 0,
      "offsetY": 0,
      "rotation": 120,
      "seed": 88.1,
      "animate": false,
      "localWarpIntensity": 1.4,
      "localWarpFreqX": 1,
      "localWarpFreqY": 1.9,
      "warpDirection": [
        1,
        -1
      ],
      "ditherEnabled": false,
      "ditherLevels": 16,
      "ditherScale": 4,
      "grainEnabled": true,
      "grainIntensity": 0.071,
      "grainSpeed": 50,
      "vignetteEnabled": true,
      "vignetteIntensity": 0.54,
      "vignetteRadius": 0.5,
      "fractalGlassEnabled": false,
      "fractalGlassStyle": "fractal",
      "fractalGlassSteps": 25,
      "fractalGlassDistortion": 0.5,
      "fractalGlassBlur": 0.2,
      "brightness": 1,
      "contrast": 1,
      "hue": 0,
      "colors": [
        "#05010D",
        "#0B1E4A",
        "#3A2EAD",
        "#6C5CE7"
      ]
    }
  },
  {
    "id": "candy",
    "name": "Candy",
    "dimensions": {
      "width": 2000,
      "height": 1400
    },
    "state": {
      "speed": 1,
      "zoom": 1,
      "freq": 6,
      "sharpness": 2.5,
      "amplitude": 1.2,
      "waveWidthMod": 0.7,
      "offsetX": 0,
      "offsetY": 0,
      "rotation": 45,
      "seed": 5.9,
      "animate": false,
      "localWarpIntensity": 1.2,
      "localWarpFreqX": 1,
      "localWarpFreqY": 3.2,
      "warpDirection": [
        1,
        -1
      ],
      "ditherEnabled": true,
      "ditherLevels": 12,
      "ditherScale": 4,
      "grainEnabled": false,
      "grainIntensity": 0.02,
      "grainSpeed": 50,
      "vignetteEnabled": false,
      "vignetteIntensity": 1,
      "vignetteRadius": 0.4,
      "fractalGlassEnabled": false,
      "fractalGlassStyle": "fractal",
      "fractalGlassSteps": 25,
      "fractalGlassDistortion": 0.5,
      "fractalGlassBlur": 0.2,
      "brightness": 1,
      "contrast": 1,
      "hue": 0,
      "colors": [
        "#F875AA",
        "#FBACCC",
        "#F1D1D0",
        "#F4F9F9"
      ]
    }
  },
  {
    "id": "fractal-ocean",
    "name": "Fractal Ocean",
    "dimensions": {
      "width": 2000,
      "height": 1400
    },
    "state": {
      "speed": 1,
      "zoom": 1,
      "freq": 4,
      "sharpness": 2,
      "amplitude": 1.4,
      "waveWidthMod": 0.55,
      "offsetX": 0,
      "offsetY": 0,
      "rotation": 15,
      "seed": 33.3,
      "animate": false,
      "localWarpIntensity": 0.7,
      "localWarpFreqX": 1,
      "localWarpFreqY": 2,
      "warpDirection": [
        1,
        -1
      ],
      "ditherEnabled": false,
      "ditherLevels": 16,
      "ditherScale": 4,
      "grainEnabled": false,
      "grainIntensity": 0.02,
      "grainSpeed": 50,
      "vignetteEnabled": false,
      "vignetteIntensity": 1,
      "vignetteRadius": 0.4,
      "fractalGlassEnabled": true,
      "fractalGlassStyle": "fractal",
      "fractalGlassSteps": 24,
      "fractalGlassDistortion": 0.42,
      "fractalGlassBlur": 0.23,
      "brightness": 1.12,
      "contrast": 1.13,
      "hue": 0,
      "colors": [
        "#012A4A",
        "#2C7DA0",
        "#61A5C2",
        "#A9D6E5"
      ]
    }
  },
  {
    "id": "ember",
    "name": "Ember",
    "dimensions": {
      "width": 2000,
      "height": 1400
    },
    "state": {
      "speed": 1,
      "zoom": 1,
      "freq": 8,
      "sharpness": 5,
      "amplitude": 1,
      "waveWidthMod": 0.45,
      "offsetX": 0,
      "offsetY": 0,
      "rotation": 90,
      "seed": 64.7,
      "animate": false,
      "localWarpIntensity": 1,
      "localWarpFreqX": 1,
      "localWarpFreqY": 2.8,
      "warpDirection": [
        1,
        -1
      ],
      "ditherEnabled": false,
      "ditherLevels": 16,
      "ditherScale": 4,
      "grainEnabled": true,
      "grainIntensity": 0.06,
      "grainSpeed": 50,
      "vignetteEnabled": true,
      "vignetteIntensity": 0.9,
      "vignetteRadius": 0.45,
      "fractalGlassEnabled": false,
      "fractalGlassStyle": "fractal",
      "fractalGlassSteps": 25,
      "fractalGlassDistortion": 0.5,
      "fractalGlassBlur": 0.2,
      "brightness": 1,
      "contrast": 1,
      "hue": 0,
      "colors": [
        "#0B0000",
        "#3D0C02",
        "#C1121F",
        "#FB8B24"
      ]
    }
  },
  {
    "id": "solar-tide",
    "name": "Solar Tide",
    "dimensions": {
      "width": 2000,
      "height": 1400
    },
    "state": {
      "speed": 1,
      "zoom": 1.15,
      "freq": 4,
      "sharpness": 2.2,
      "amplitude": 1.21,
      "waveWidthMod": 0.5,
      "offsetX": 0,
      "offsetY": 0,
      "rotation": 147,
      "seed": 47.2,
      "animate": false,
      "localWarpIntensity": 2,
      "localWarpFreqX": 1,
      "localWarpFreqY": 5.3,
      "warpDirection": [
        1,
        -1
      ],
      "ditherEnabled": false,
      "ditherLevels": 16,
      "ditherScale": 4,
      "grainEnabled": true,
      "grainIntensity": 0.04,
      "grainSpeed": 50,
      "vignetteEnabled": false,
      "vignetteIntensity": 1,
      "vignetteRadius": 0.4,
      "fractalGlassEnabled": false,
      "fractalGlassStyle": "fractal",
      "fractalGlassSteps": 25,
      "fractalGlassDistortion": 0.5,
      "fractalGlassBlur": 0.2,
      "brightness": 1,
      "contrast": 1,
      "hue": 0,
      "colors": [
        "#474744",
        "#2994B2",
        "#FFFBE0",
        "#FFB400"
      ]
    }
  },
  {
    "id": "raspberry-silk",
    "name": "Raspberry Silk",
    "dimensions": {
      "width": 2000,
      "height": 1400
    },
    "state": {
      "speed": 1,
      "zoom": 0.85,
      "freq": 5.2,
      "sharpness": 1.1,
      "amplitude": 1.45,
      "waveWidthMod": 0.9500000000000001,
      "offsetX": 0.01,
      "offsetY": 0.68,
      "rotation": 41,
      "seed": 36.7,
      "animate": false,
      "localWarpIntensity": 5,
      "localWarpFreqX": 1,
      "localWarpFreqY": 1.8,
      "warpDirection": [
        1,
        -1
      ],
      "ditherEnabled": false,
      "ditherLevels": 16,
      "ditherScale": 4,
      "grainEnabled": true,
      "grainIntensity": 0.096,
      "grainSpeed": 50,
      "vignetteEnabled": false,
      "vignetteIntensity": 0.93,
      "vignetteRadius": 0.37,
      "fractalGlassEnabled": false,
      "fractalGlassStyle": "fractal",
      "fractalGlassSteps": 25,
      "fractalGlassDistortion": 0.5,
      "fractalGlassBlur": 0.2,
      "brightness": 1,
      "contrast": 1,
      "hue": 0,
      "colors": [
        "#790C5A",
        "#CC0E74",
        "#E6739F",
        "#F1D4D4"
      ]
    }
  },
  {
    "id": "whisper-violet",
    "name": "Whisper Violet",
    "dimensions": {
      "width": 2000,
      "height": 1400
    },
    "state": {
      "speed": 1,
      "zoom": 1.2,
      "freq": 3.5,
      "sharpness": 5.5,
      "amplitude": 1.79,
      "waveWidthMod": 0.26,
      "offsetX": 0.68,
      "offsetY": -0.44,
      "rotation": 349,
      "seed": 81.7,
      "animate": false,
      "localWarpIntensity": 0.6000000000000001,
      "localWarpFreqX": 1,
      "localWarpFreqY": 2.8000000000000003,
      "warpDirection": [
        1,
        -1
      ],
      "ditherEnabled": false,
      "ditherLevels": 16,
      "ditherScale": 4,
      "grainEnabled": true,
      "grainIntensity": 0.051000000000000004,
      "grainSpeed": 50,
      "vignetteEnabled": false,
      "vignetteIntensity": 0.56,
      "vignetteRadius": 0.32,
      "fractalGlassEnabled": false,
      "fractalGlassStyle": "fractal",
      "fractalGlassSteps": 25,
      "fractalGlassDistortion": 0.5,
      "fractalGlassBlur": 0.2,
      "brightness": 1,
      "contrast": 1,
      "hue": 0,
      "colors": [
        "#EDEEF7",
        "#7868E6",
        "#B8B5FF",
        "#E4FBFF"
      ]
    }
  },
  {
    "id": "liquid-silver",
    "name": "Liquid Silver",
    "dimensions": {
      "width": 2000,
      "height": 1400
    },
    "state": {
      "speed": 1,
      "zoom": 0.8,
      "freq": 3.4000000000000004,
      "sharpness": 5,
      "amplitude": 0.98,
      "waveWidthMod": 0.51,
      "offsetX": -0.73,
      "offsetY": 0.18,
      "rotation": 91,
      "seed": 22.8,
      "animate": false,
      "localWarpIntensity": 0.6000000000000001,
      "localWarpFreqX": 1,
      "localWarpFreqY": 3.4000000000000004,
      "warpDirection": [
        1,
        -1
      ],
      "ditherEnabled": false,
      "ditherLevels": 16,
      "ditherScale": 4,
      "grainEnabled": true,
      "grainIntensity": 0.095,
      "grainSpeed": 50,
      "vignetteEnabled": false,
      "vignetteIntensity": 0.68,
      "vignetteRadius": 0.32,
      "fractalGlassEnabled": false,
      "fractalGlassStyle": "fractal",
      "fractalGlassSteps": 25,
      "fractalGlassDistortion": 0.5,
      "fractalGlassBlur": 0.2,
      "brightness": 1,
      "contrast": 1,
      "hue": 0,
      "colors": [
        "#494949",
        "#FFFDF6",
        "#ECE8D9",
        "#FAF6E9"
      ]
    }
  },
  {
    "id": "retro",
    "name": "Retro",
    "dimensions": {
      "width": 2000,
      "height": 1400
    },
    "state": {
      "speed": 1,
      "zoom": 0.91,
      "freq": 3.7,
      "sharpness": 2.2,
      "amplitude": 0.54,
      "waveWidthMod": 0.6,
      "offsetX": 0.71,
      "offsetY": 0.07,
      "rotation": 358,
      "seed": 96.80000000000001,
      "animate": false,
      "localWarpIntensity": 1.3,
      "localWarpFreqX": 1,
      "localWarpFreqY": 3,
      "warpDirection": [
        1,
        -1
      ],
      "ditherEnabled": true,
      "ditherLevels": 5,
      "ditherScale": 5,
      "grainEnabled": false,
      "grainIntensity": 0.026000000000000002,
      "grainSpeed": 50,
      "vignetteEnabled": false,
      "vignetteIntensity": 0.79,
      "vignetteRadius": 0.56,
      "fractalGlassEnabled": false,
      "fractalGlassStyle": "fractal",
      "fractalGlassSteps": 13,
      "fractalGlassDistortion": 0.45,
      "fractalGlassBlur": 0.2,
      "brightness": 1,
      "contrast": 1,
      "hue": 0,
      "colors": [
        "#FF7E67",
        "#FAFAFA",
        "#A2D5F2",
        "#07689F"
      ]
    }
  },
  {
    "id": "metallic-ember",
    "name": "Metallic Ember",
    "dimensions": {
      "width": 2000,
      "height": 1400
    },
    "state": {
      "speed": 1,
      "zoom": 0.52,
      "freq": 4.5,
      "sharpness": 4.2,
      "amplitude": 2.24,
      "waveWidthMod": 0.44,
      "offsetX": -0.03,
      "offsetY": -0.46,
      "rotation": 308,
      "seed": 90.4,
      "animate": false,
      "localWarpIntensity": 1.1,
      "localWarpFreqX": 1,
      "localWarpFreqY": 3.9000000000000004,
      "warpDirection": [
        1,
        -1
      ],
      "ditherEnabled": false,
      "ditherLevels": 14,
      "ditherScale": 7.5,
      "grainEnabled": false,
      "grainIntensity": 0.055,
      "grainSpeed": 50,
      "vignetteEnabled": false,
      "vignetteIntensity": 0.85,
      "vignetteRadius": 0.41000000000000003,
      "fractalGlassEnabled": false,
      "fractalGlassStyle": "fractal",
      "fractalGlassSteps": 27,
      "fractalGlassDistortion": 0.62,
      "fractalGlassBlur": 0.2,
      "brightness": 1,
      "contrast": 1,
      "hue": 0,
      "colors": [
        "#53354A",
        "#903749",
        "#E84545",
        "#2B2E4A"
      ]
    }
  },
  {
    "id": "northern-depths",
    "name": "Northern Depths",
    "dimensions": {
      "width": 2000,
      "height": 1400
    },
    "state": {
      "speed": 1,
      "zoom": 0.7000000000000001,
      "freq": 2,
      "sharpness": 2.3000000000000003,
      "amplitude": 0.78,
      "waveWidthMod": 0.76,
      "offsetX": 0.12,
      "offsetY": -0.1,
      "rotation": 193,
      "seed": 27.1,
      "animate": false,
      "localWarpIntensity": 0.30000000000000004,
      "localWarpFreqX": 1,
      "localWarpFreqY": 2.4000000000000004,
      "warpDirection": [
        1,
        -1
      ],
      "ditherEnabled": false,
      "ditherLevels": 7,
      "ditherScale": 5,
      "grainEnabled": true,
      "grainIntensity": 0.058,
      "grainSpeed": 50,
      "vignetteEnabled": false,
      "vignetteIntensity": 0.93,
      "vignetteRadius": 0.39,
      "fractalGlassEnabled": false,
      "fractalGlassStyle": "fractal",
      "fractalGlassSteps": 25,
      "fractalGlassDistortion": 0.56,
      "fractalGlassBlur": 0.2,
      "brightness": 1,
      "contrast": 1,
      "hue": 0,
      "colors": [
        "#EEEEEE",
        "#00ADB5",
        "#393E46",
        "#222831"
      ]
    }
  }
];
