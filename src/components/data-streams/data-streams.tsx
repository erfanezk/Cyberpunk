import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { COLORS } from '@/constants';
import type { StreamConfig } from './data-streams.types';
import { generateStreams } from './data-streams.utils';

export function DataStreams() {
  const streams = useMemo<StreamConfig[]>(() => generateStreams(8), []);

  return (
    <group>
      {streams.map((stream) => (
        <DataStream key={stream.id} {...stream} />
      ))}
    </group>
  );
}

function DataStream({ position, height, count }: StreamConfig) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = Math.random() * height;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return { positions };
  }, [count, height]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      posAttr.array[i * 3 + 1] += 0.05 + Math.random() * 0.02;
      if (posAttr.array[i * 3 + 1] > height) {
        posAttr.array[i * 3 + 1] = 0;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color={COLORS.cyan}
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
