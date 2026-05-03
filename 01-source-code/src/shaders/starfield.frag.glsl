uniform float time;
varying float vAlpha;
varying vec3 vColor;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float l = length(c);
  if (l > 0.5) discard;

  gl_FragColor = vec4(vColor, vAlpha * 0.8);
  gl_FragColor.rgb *= 1.0 - l * 1.5;
}
