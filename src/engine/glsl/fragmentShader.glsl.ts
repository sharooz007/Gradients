export const fragmentShader = `
precision highp float;

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_scale;

// Wave parameters
uniform float freq;
uniform float sharpness;
uniform float amplitude;
uniform float waveWidthMod;
uniform float offsetX;
uniform float offsetY;
uniform float rotation;
uniform float speed;
uniform float zoom;

// Warp parameters
uniform float localWarpIntensity;
uniform float localWarpFreqX;
uniform float localWarpFreqY;
uniform vec2  warpDirection;

// Dithering
uniform bool  ditherEnabled;
uniform float ditherLevels;
uniform float ditherScale;

// Film Grain
uniform bool  grainEnabled;
uniform float grainIntensity;
uniform float grainSpeed;

// Vignette
uniform bool  vignetteEnabled;
uniform float vignetteIntensity;
uniform float vignetteRadius;

// Color adjustment filters
uniform float brightness;
uniform float contrast;
uniform float hue;

// Color ramp gradient texture
uniform sampler2D u_gradient;

// Fast tanh approximation for smooth curve clamping
float fastTanh(float x) {
  return clamp(x * (27.0 + x * x) / (27.0 + 9.0 * x * x), -1.0, 1.0);
}

// Modulated square wave with silk-like wave folding
float modulatedSquareWave(float x, float freq, float sharpness, float widthMod) {
  float m = 1.0 + sin(x * freq * 0.5) * widthMod;
  m = clamp(m, 0.3, 2.0);
  return fastTanh(sin(x * freq * m) * sharpness);
}

// Sinusoidal coordinate distortion field
vec2 localWarp(vec2 uv, float intensity, float freqX, float freqY) {
  float warpX = (freqX > 0.0) ? sin(uv.y * freqX) * intensity * 0.5 : 0.0;
  float warpY = (freqY > 0.0) ? sin(uv.x * freqY) * intensity * 0.4 : 0.0;
  uv.x += warpX;
  uv.y += warpY;
  return uv;
}

// High-frequency hash for film grain
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// 4x4 Bayer Matrix for retro color quantization
float bayer4x4(vec2 coord) {
  mat4 m = mat4(
     0.0/16.0,  8.0/16.0,  2.0/16.0, 10.0/16.0,
    12.0/16.0,  4.0/16.0, 14.0/16.0,  6.0/16.0,
     3.0/16.0, 11.0/16.0,  1.0/16.0,  9.0/16.0,
    15.0/16.0,  7.0/16.0, 13.0/16.0,  5.0/16.0
  );
  int x = int(mod(coord.x, 4.0));
  int y = int(mod(coord.y, 4.0));
  return m[y][x];
}

// Dither color quantizer
vec3 ditherColor(vec3 color, vec2 coord, float levels, float scale) {
  vec2 dc = floor(coord / scale);
  float t = bayer4x4(dc);
  return floor(color * levels + t) / levels;
}

// Rodrigues' rotation around the (1,1,1) luma axis for accurate hue shift
vec3 applyHue(vec3 color, float hueDeg) {
  float angle = radians(hueDeg);
  vec3 k = vec3(0.57735026919);
  float cosA = cos(angle);
  return color * cosA
    + cross(k, color) * sin(angle)
    + k * dot(k, color) * (1.0 - cosA);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  float scale = ditherEnabled ? max(ditherScale * u_scale, 1.0) : 1.0;

  // Snap to dither block centers
  vec2 dbc = floor(fragCoord / scale) * scale + scale * 0.5;
  vec2 blockUV = dbc / u_resolution;
  blockUV = blockUV * 2.0 - 1.0;
  blockUV.x *= u_resolution.x / u_resolution.y;

  // Zoom (higher zoom = larger pattern / zoomed in)
  blockUV /= max(zoom, 0.001);

  // Rotation
  float rotRad = radians(rotation);
  blockUV = mat2(
    cos(rotRad), -sin(rotRad),
    sin(rotRad),  cos(rotRad)
  ) * blockUV;

  // Position offset + horizontal drift/scroll
  blockUV.x += offsetX
    + sin(u_time * speed * 0.15) * 0.5
    + cos(u_time * speed * 0.08) * 0.3;
  blockUV.y += offsetY;

  // Animated warp params
  float animWI = localWarpIntensity + 0.12 * sin(u_time * speed * 0.9);
  float animWW = pow(max(waveWidthMod, 0.001), max(u_time * speed * 0.1, 0.001))
               + 0.25 * sin(u_time * speed * 0.3 + 3.14159265);

  // Wave direction
  float angle = atan(warpDirection.y, warpDirection.x)
              + sin(u_time * speed * 0.1) * 1.5707963;
  vec2 dir = vec2(cos(angle), sin(angle));

  float diag = dot(blockUV, dir);
  float wave = modulatedSquareWave(diag, freq, sharpness, animWW);

  float animAmp = amplitude * (1.5 + 0.4 * sin(u_time * speed * 0.13));
  vec2 warpedUV = blockUV + dir * wave * animAmp;
  warpedUV = localWarp(warpedUV, animWI, localWarpFreqX, localWarpFreqY);

  // Sample color from multi-stop gradient ramp texture
  float gradientT = clamp(warpedUV.y * -0.33 + 0.5, 0.0, 1.0);
  vec3 color = texture2D(u_gradient, vec2(gradientT, 0.5)).rgb;

  // Color adjustments: Hue rotation, contrast, brightness
  color = applyHue(color, hue);
  color = (color - 0.5) * contrast + 0.5;
  color *= brightness;
  color = clamp(color, 0.0, 1.0);

  // Film grain
  if (grainEnabled) {
    float grainSeed = fract(u_time * grainSpeed);
    float grain = hash12(dbc + grainSeed) * 2.0 - 1.0;
    color += grain * grainIntensity;
  }

  // Vignette
  if (vignetteEnabled) {
    vec2 normUV = dbc / u_resolution;
    vec2 feather = smoothstep(0.0, max(vignetteRadius, 0.001), normUV)
                 * smoothstep(0.0, max(vignetteRadius, 0.001), 1.0 - normUV);
    float edgeMask = feather.x * feather.y;
    color = mix(color, color * edgeMask, vignetteIntensity);
  }

  // Bayer dither
  if (ditherEnabled) {
    color = ditherColor(color, fragCoord, ditherLevels, scale);
  }

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;
