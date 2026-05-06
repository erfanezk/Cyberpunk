import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { ShapeConfig } from './floating-shapes.types';
import { generateShapes } from './floating-shapes.utils';

export function FloatingShapes() {
  const shapes = useMemo<ShapeConfig[]>(() => generateShapes(12), []);

  return (
    <group>
      {shapes.map((shape) => (
        <FloatingShape key={shape.id} {...shape} />
      ))}
    </group>
  );
}

function FloatingShape({ position, scale, rotationSpeed, geometry, color }: ShapeConfig) {
  const meshRef = useRef<THREE.Mesh>(null);
  const colorObj = useMemo(() => new THREE.Color(color), [color]);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += rotationSpeed[0];
    meshRef.current.rotation.y += rotationSpeed[1];
    meshRef.current.rotation.z += rotationSpeed[2];
    meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.003;
  });

  const GeometryComponent = () => {
    switch (geometry) {
      case 'icosahedron':
        return <icosahedronGeometry args={[1, 1]} />;
      case 'torusKnot':
        return <torusKnotGeometry args={[0.6, 0.2, 64, 16]} />;
      case 'octahedron':
        return <octahedronGeometry args={[1, 0]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[1, 0]} />;
      default:
        return <icosahedronGeometry args={[1, 1]} />;
    }
  };

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <GeometryComponent />
      <meshStandardMaterial
        color={colorObj}
        wireframe
        emissive={colorObj}
        emissiveIntensity={0.4}
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}
