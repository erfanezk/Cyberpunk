import { useFrame } from '@react-three/fiber';
import { memo, useRef } from 'react';
import * as THREE from 'three';
import { GRID_FRAGMENT_SHADER, GRID_UNIFORMS, GRID_VERTEX_SHADER } from './grid-floor.constants';

const GridFloor = memo(() => {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -40]}>
      <planeGeometry args={[400, 400, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={GRID_VERTEX_SHADER}
        fragmentShader={GRID_FRAGMENT_SHADER}
        uniforms={GRID_UNIFORMS}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
});

export default memo(GridFloor);
