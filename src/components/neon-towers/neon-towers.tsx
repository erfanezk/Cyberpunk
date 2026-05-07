import { memo, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks';
import type { TowerData } from './neon-towers.types';
import { generateTowers } from './neon-towers.utils';

const BACKGROUND_COUNT = 10;

function TowerSegment({
  width,
  height,
  color,
  phaseOffset,
  isMobile,
}: {
  width: number;
  height: number;
  color: THREE.Color;
  phaseOffset: number;
  isMobile: boolean;
}) {
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (isMobile || !outerRef.current) return;
    const mat = outerRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity =
      0.15 + 0.35 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 2 + phaseOffset));
  });

  const edgeGeo = useMemo(() => {
    const box = new THREE.BoxGeometry(width, height, width);
    return new THREE.EdgesGeometry(box);
  }, [width, height]);

  const innerWidth = width * 0.65;

  return (
    <group>
      <mesh ref={outerRef}>
        <boxGeometry args={[width, height, width]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.18}
        />
      </mesh>

      <mesh>
        <boxGeometry args={[innerWidth, height, innerWidth]} />
        <meshStandardMaterial color={color} wireframe emissive={color} emissiveIntensity={0.1} />
      </mesh>

      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color={color} />
      </lineSegments>
    </group>
  );
}

function AntennaTip({
  color,
  phaseOffset,
  isMobile,
}: {
  color: THREE.Color;
  phaseOffset: number;
  isMobile: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (isMobile || !meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 3 + 2.5 * Math.abs(Math.sin(clock.elapsedTime * 2.2 + phaseOffset));
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.22, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={4}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

function Tower({ tower, isMobile }: { tower: TowerData; isMobile: boolean }) {
  const topY = useMemo(
    () => Math.max(...tower.segments.map((s) => s.localY + s.height / 2)),
    [tower.segments],
  );
  const antennaH = 1.5 + tower.width * 0.7;

  return (
    <group position={tower.position}>
      {tower.segments.map((seg) => (
        <group key={seg.height + seg.localY + seg.phaseOffset} position={[0, seg.localY, 0]}>
          <TowerSegment
            width={tower.width}
            height={seg.height}
            color={tower.color}
            phaseOffset={seg.phaseOffset}
            isMobile={isMobile}
          />
        </group>
      ))}

      <group position={[0, topY, 0]}>
        <mesh position={[0, antennaH / 2, 0]}>
          <cylinderGeometry args={[0.04, 0.09, antennaH, 4]} />
          <meshStandardMaterial
            color={tower.color}
            emissive={tower.color}
            emissiveIntensity={1.5}
          />
        </mesh>
        <group position={[0, antennaH, 0]}>
          <AntennaTip
            color={tower.color}
            phaseOffset={tower.segments[0].phaseOffset}
            isMobile={isMobile}
          />
        </group>
      </group>
    </group>
  );
}

const NeonTowers = memo(() => {
  const isMobile = useIsMobile();
  const towers = useMemo<TowerData[]>(() => generateTowers(BACKGROUND_COUNT), []);

  return (
    <group>
      {towers.map((tower) => (
        <Tower key={tower.id} tower={tower} isMobile={isMobile} />
      ))}
    </group>
  );
});

export default memo(NeonTowers);
