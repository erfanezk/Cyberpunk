import { useFrame } from '@react-three/fiber';
import { useRef, memo } from 'react';
import * as THREE from 'three';
import { WORLD_CONFIG } from '@/game';
import type { BillboardConfig } from './holographic-billboards.types';
import { generateBillboards } from './holographic-billboards.utils';
import {
  makeBillboardUniforms,
  NOISE_FRAGMENT_SHADER,
  NOISE_VERTEX_SHADER,
} from './holographic-billboards.constants';

function HolographicBillboards() {
  const billboards = generateBillboards(WORLD_CONFIG.billboardCount);

  if (billboards.length === 0) return null;

  return (
    <group>
      {billboards.map((bb) => (
        <HolographicBillboard key={bb.id} {...bb} />
      ))}
    </group>
  );
}

export default memo(HolographicBillboards);

function HolographicBillboard({ position, rotation, size, color }: BillboardConfig) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

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
        vertexShader={NOISE_VERTEX_SHADER}
        fragmentShader={NOISE_FRAGMENT_SHADER}
        uniforms={makeBillboardUniforms(new THREE.Color(color))}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
