import { useMemo } from 'react';
import type { TowerData } from './neon-towers.types';
import { generateTowers } from './neon-towers.utils';

const count = 25;

export function NeonTowers() {
  const towers = useMemo<TowerData[]>(() => generateTowers(count), []);

  return (
    <group>
      {towers.map((tower) => (
        <mesh key={tower.id} position={tower.position} scale={tower.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={tower.color}
            wireframe
            emissive={tower.color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}
