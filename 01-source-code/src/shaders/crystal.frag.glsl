uniform float u_time;
uniform vec2 u_mouse;
uniform float u_intensity;
varying vec2 vUv;
varying vec3 vPosition;

const vec3 EDGE_COLOR = vec3(0.5, 0.8, 1.0);
const vec3 BAND_COLOR = vec3(0.2, 0.5, 0.9);
const vec3 CAUSTIC_COLOR = vec3(0.8, 0.9, 1.0);

void main() {
  vec2 center = vec2(0.5);
  vec2 uv = vUv;

  uv += (u_mouse - 0.5) * 0.05 * sin(u_time + vPosition.x * 2.0);

  float dist = length(uv - center);

  float edge = smoothstep(0.35, 0.5, dist) * smoothstep(0.5, 0.35, dist);
  float glow = (1.0 - smoothstep(0.0, 0.5, dist)) * 0.1;

  vec2 causticUv = uv * 3.0 + vec2(sin(u_time * 0.5 + dist * 5.0) * 0.1);

  vec3 refractedColor = mix(vec3(0.05, 0.05, 0.1), EDGE_COLOR, edge * 0.8);
  refractedColor += vec3(0.8, 0.9, 1.0) * glow;

  vec3 finalColor = refractedColor;
  float alpha = 0.6 + edge * 0.3;

  finalColor += BAND_COLOR * edge * 0.4 * u_intensity;
  finalColor += CAUSTIC_COLOR * glow * u_intensity;

  gl_FragColor = vec4(finalColor, alpha);
}
