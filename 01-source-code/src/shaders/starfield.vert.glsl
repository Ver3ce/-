uniform float time;
varying float vAlpha;
varying vec3 vColor;

vec3 getYpos(float x, float amp, float freq, float t) {
  float sx = x * freq + t;
  float y = sin(sx);
  float c = cos(sx);
  return vec3(x, y + amp * c * 0.3, c * 0.1);
}

void main() {
  vec3 pos = position;
  float amp, freq, speed;

  if (pos.z < 0.0) {
    amp = 20.0;
    freq = 0.03;
    speed = 2.0;
    vColor = vec3(0.35, 0.55, 1.0);
  } else {
    amp = 30.0;
    freq = 0.02;
    speed = 1.5;
    vColor = vec3(0.7, 0.4, 0.9);
  }

  float y = getYpos(pos.x, amp, freq, time * speed).y;
  float y2 = getYpos(pos.x, amp + 10.0, freq + 0.01, (time + 5.0) * speed).z;

  pos.y += y;
  pos.z += y2;
  pos.y -= 40.0;

  float life = fract(pos.x / 400.0 + time * 0.02);
  vAlpha = smoothstep(0.0, 0.1, life) * smoothstep(1.0, 0.9, life);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = 2.0 * (150.0 / -mvPosition.z);
}
