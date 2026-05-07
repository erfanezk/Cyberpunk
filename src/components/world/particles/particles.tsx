import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, memo } from 'react';
import * as THREE from 'three';
import { COLORS } from '@/constants';
import { useIsMobile } from '@/hooks';

function Particles() {
  const isMobile = useIsMobile();
  const pointsRef = useRef<THREE.Points>(null);
  const count = isMobile ? 400 : 1500;

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const neonColors = [
      new THREE.Color(COLORS.cyan),
      new THREE.Color(COLORS.magenta),
      new THREE.Color(COLORS.electricBlue),
      new THREE.Color('#ffffff'),
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200 - 40;

      const color = neonColors[Math.floor(Math.random() * neonColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.elapsedTime;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const drift = Math.sin(time * 0.3) * 0.003;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3 + 1] += 0.005;
      arr[i3] += drift;
      if (arr[i3 + 1] > 100) {
        arr[i3 + 1] = 0;
      }
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
