import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, memo } from 'react';
import * as THREE from 'three';
import { WORLD_CONFIG } from '@/game';
import { NEON_COLORS } from './particles.constants';

function Particles() {
  const count = WORLD_CONFIG.particleCount;
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 200;
      arr[i * 3 + 1] = Math.random() * 100;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 200 - 40;
    }
    return arr;
  }, [count]);

  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const c = NEON_COLORS[i % NEON_COLORS.length];
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const drift = Math.sin(state.clock.elapsedTime * 0.3) * 0.003;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3 + 1] += 0.005;
      arr[i3] += drift;
      if (arr[i3 + 1] > 100) arr[i3 + 1] = 0;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default memo(Particles);
