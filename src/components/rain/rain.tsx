import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks';

const SPREAD_X = 220;
const SPREAD_Z = 320;
const HEIGHT = 90;
const Z_OFFSET = -100;

export function Rain() {
  const isMobile = useIsMobile();
  const COUNT = isMobile ? 800 : 4000;
  const linesRef = useRef<THREE.LineSegments>(null);

  const { positions, speeds, lengths } = useMemo(() => {
    const positions = new Float32Array(COUNT * 2 * 3);
    const speeds = new Float32Array(COUNT);
    const lengths = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const x = (Math.random() - 0.5) * SPREAD_X;
      const y = Math.random() * HEIGHT;
      const z = Math.random() * SPREAD_Z + Z_OFFSET;
      const len = 0.6 + Math.random() * 0.8;

      positions[i * 6] = x;
      positions[i * 6 + 1] = y;
      positions[i * 6 + 2] = z;
      positions[i * 6 + 3] = x;
      positions[i * 6 + 4] = y - len;
      positions[i * 6 + 5] = z;

      speeds[i] = 0.55 + Math.random() * 0.7;
      lengths[i] = len;
    }

    return { positions, speeds, lengths };
  }, []);

  useFrame(() => {
    if (!linesRef.current) return;
    const posAttr = linesRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < COUNT; i++) {
      arr[i * 6 + 1] -= speeds[i];
      arr[i * 6 + 4] -= speeds[i];

      if (arr[i * 6 + 4] < -1) {
        const x = (Math.random() - 0.5) * SPREAD_X;
        const z = Math.random() * SPREAD_Z + Z_OFFSET;
        arr[i * 6] = x;
        arr[i * 6 + 1] = HEIGHT + Math.random() * 20;
        arr[i * 6 + 2] = z;
        arr[i * 6 + 3] = x;
        arr[i * 6 + 4] = arr[i * 6 + 1] - lengths[i];
        arr[i * 6 + 5] = z;
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        color="#99ddff"
        transparent
        opacity={0.22}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}
