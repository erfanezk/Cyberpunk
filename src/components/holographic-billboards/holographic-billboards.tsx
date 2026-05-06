import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { BillboardConfig } from './holographic-billboards.types';
import { generateBillboards } from './holographic-billboards.utils';

const noiseVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const noiseFragmentShader = `
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

export function HolographicBillboards() {
  const billboards = useMemo<BillboardConfig[]>(() => generateBillboards(5), []);

  return (
    <group>
      {billboards.map((bb) => (
        <HolographicBillboard key={bb.id} {...bb} />
      ))}
    </group>
  );
}

function HolographicBillboard({ position, rotation, size, color }: BillboardConfig) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    }),
    [color],
  );

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <shaderMaterial
        ref={matRef}
        vertexShader={noiseVertexShader}
        fragmentShader={noiseFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
