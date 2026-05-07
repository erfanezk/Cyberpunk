import * as THREE from 'three';
import { COLORS } from '@/constants';

export const GRID_UNIFORMS = Object.freeze({
  uTime: { value: 0 },
  uColor: { value: new THREE.Color(COLORS.cyan) },
});

export const GRID_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const GRID_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec2 smallUv = vUv * 40.0;
    vec2 dSmall = abs(fract(smallUv - 0.5) - 0.5) / fwidth(smallUv);
    float smallLine = 1.0 - min(min(dSmall.x, dSmall.y), 1.0);

    vec2 largeUv = vUv * 8.0;
    vec2 dLarge = abs(fract(largeUv - 0.5) - 0.5) / fwidth(largeUv);
    float largeLine = 1.0 - min(min(dLarge.x, dLarge.y), 1.0);

    float line = max(smallLine * 0.45, largeLine * 0.95);

    float dist = length(vUv - 0.5);
    float scanPulse = 0.5 + 0.5 * sin(uTime * 1.1 - dist * 16.0);
    float basePulse  = 0.65 + 0.35 * sin(uTime * 0.35);
    float pulse = mix(basePulse, scanPulse, 0.65);

    float fade = 1.0 - smoothstep(0.05, 0.5, dist);

    float alpha = line * pulse * fade * 0.75;
    vec3 color = mix(uColor * 0.7, uColor * 1.6, largeLine);

    gl_FragColor = vec4(color, alpha);
  }
`;
