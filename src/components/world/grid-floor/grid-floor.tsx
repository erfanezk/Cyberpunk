import { useFrame } from '@react-three/fiber';
import { memo, useRef } from 'react';
import * as THREE from 'three';
import { COLORS } from '@/constants';
import { GRID_FRAGMENT_SHADER, GRID_VERTEX_SHADER } from './grid-floor.constants';

const GridFloor = memo(() => {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniformsRef = useRef<{
    uTime: { value: number };
    uColor: { value: THREE.Color };
  } | null>(null);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  // Lazily initialize so the Color object is created once and reused
  if (!uniformsRef.current) {
    uniformsRef.current = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(COLORS.cyan) },
    };
  }

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -40]}>
      <planeGeometry args={[400, 400, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={GRID_VERTEX_SHADER}
        fragmentShader={GRID_FRAGMENT_SHADER}
        uniforms={uniformsRef.current}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
});

export default memo(GridFloor);
