import type * as THREE from 'three';

export const NOISE_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const NOISE_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec2 uv = vUv;
    float noise = random(uv * uTime * 0.1);
    float scanline = sin(uv.y * 100.0 + uTime * 5.0) * 0.04;
    float flicker = step(0.98, random(vec2(uTime * 0.5, 0.0)));
    float alpha = 0.15 + noise * 0.1 + scanline + flicker * 0.3;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export function makeBillboardUniforms(color: THREE.Color) {
  return Object.freeze({
    uTime: { value: 0 },
    uColor: { value: color },
  });
}
