export const flutedGlassShader = `
precision highp float;

uniform sampler2D tDiffuse;
uniform vec2 u_resolution;
uniform float distortion;
uniform float fluteSections;
uniform float blur;
uniform vec3 lightPosition;
uniform int style; // 0 = fractal, 1 = frosted, 2 = fluted

const float PI = 3.14159265359;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  if (style == 2 || style == 0) {
    // Fluted / Fractal Glass
    float fluteCount = fluteSections > 0.0 ? fluteSections : 25.0;
    float flutePosition = fract(uv.x * fluteCount + 0.5);

    vec3 normal = vec3(0.0);
    normal.x = cos(flutePosition * PI * 2.0) * PI * 0.15;
    normal.y = 0.0;
    normal.z = sqrt(max(0.0, 1.0 - normal.x * normal.x));
    normal = normalize(normal);

    vec3 lightDir = normalize(lightPosition);
    float diffuse = max(dot(normal, lightDir), 0.0);
    float specular = pow(max(dot(reflect(-lightDir, normal), vec3(0.0, 0.0, 1.0)), 0.0), 32.0);

    vec2 distortedUV = uv + normal.xy * distortion * 0.2;

    float blurSize = 0.004 * blur;
    const float sigma = 20.0;
    float totalWeight = 0.0;
    float colorR = 0.0;
    float colorG = 0.0;
    float colorB = 0.0;

    for (int i = -3; i <= 3; i++) {
      for (int j = -3; j <= 3; j++) {
        vec2 offset = vec2(float(i), float(j)) * blurSize;
        float weight = exp(-float(i * i + j * j) / (2.0 * sigma * sigma));
        vec2 sampleUV = distortedUV + offset;

        colorR += texture2D(tDiffuse, sampleUV + vec2(distortion * 0.015, 0.0)).r * weight;
        colorG += texture2D(tDiffuse, sampleUV).g * weight;
        colorB += texture2D(tDiffuse, sampleUV - vec2(distortion * 0.015, 0.0)).b * weight;
        totalWeight += weight;
      }
    }

    vec3 color = vec3(colorR, colorG, colorB) / max(totalWeight, 0.001);
    float ambient = 0.9;
    color *= (ambient + diffuse * 0.4);
    color += specular * 0.08;

    gl_FragColor = vec4(color, 1.0);
  } else {
    // Frosted noise glass
    float noiseVal1 = random(uv * 5.0) * 2.0 - 1.0;
    float noiseVal2 = random((uv + vec2(0.5)) * 5.0) * 2.0 - 1.0;
    vec2 distortedUV = uv + vec2(noiseVal1, noiseVal2) * distortion * 0.03;

    float r = texture2D(tDiffuse, distortedUV + vec2(distortion * 0.01, 0.0)).r;
    float g = texture2D(tDiffuse, distortedUV).g;
    float b = texture2D(tDiffuse, distortedUV - vec2(distortion * 0.01, 0.0)).b;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
}
`;
