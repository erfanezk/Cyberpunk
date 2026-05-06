import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { TowerData } from './neon-towers.types';
import { generateTowers } from './neon-towers.utils';

const count = 18;

function TowerSegment({
  width,
  height,
  color,
  phaseOffset,
}: {
  width: number;
  height: number;
  color: THREE.Color;
  phaseOffset: number;
}) {
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (outerRef.current) {
      const mat = outerRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity =
        0.15 + 0.35 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 2 + phaseOffset));
    }
  });

  const edgeGeo = useMemo(() => {
    const box = new THREE.BoxGeometry(width, height, width);
    return new THREE.EdgesGeometry(box);
  }, [width, height]);

  const innerWidth = width * 0.65;

  return (
    <group>
      {/* Outer shell — translucent, animated pulse */}
      <mesh ref={outerRef}>
        <boxGeometry args={[width, height, width]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Inner frame — wireframe, constant subtle glow */}
      <mesh>
        <boxGeometry args={[innerWidth, height, innerWidth]} />
        <meshStandardMaterial color={color} wireframe emissive={color} emissiveIntensity={0.1} />
      </mesh>

      {/* Edge lines — constant bright neon */}
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color={color} />
      </lineSegments>
    </group>
  );
}

function Tower({ tower }: { tower: TowerData }) {
  return (
    <group position={tower.position}>
      {tower.segments.map((seg) => (
        <group key={seg.height + seg.localY + seg.phaseOffset} position={[0, seg.localY, 0]}>
          <TowerSegment
            width={tower.width}
            height={seg.height}
            color={tower.color}
            phaseOffset={seg.phaseOffset}
          />
        </group>
      ))}
    </group>
  );
}

export function NeonTowers() {
  const towers = useMemo<TowerData[]>(() => generateTowers(count), []);

  return (
    <group>
      {towers.map((tower) => (
        <Tower key={tower.id} tower={tower} />
      ))}
    </group>
  );
}
