import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, memo } from 'react';
import type * as THREE from 'three';
import { COLORS } from '@/constants';
import { useIsMobile } from '@/hooks';

const NEON = [COLORS.cyan, COLORS.magenta, COLORS.electricBlue, COLORS.amber];

interface DroneConfig {
  id: string;
  radius: number;
  height: number;
  speed: number;
  phase: number;
  color: string;
  zCenter: number;
}

function Drone({ radius, height, speed, phase, color, zCenter }: DroneConfig) {
  const isMobile = useIsMobile();
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + phase;
    if (groupRef.current) {
      groupRef.current.position.set(Math.cos(t) * radius, height, Math.sin(t) * radius + zCenter);
    }
    if (lightRef.current) {
      lightRef.current.intensity = 6 + Math.sin(clock.elapsedTime * 5 + phase) * 2;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry args={[2.2, 0.5, 2.2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={6} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.55, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={10}
          transparent
          opacity={0.85}
        />
      </mesh>
      {!isMobile && (
        <pointLight ref={lightRef} color={color} intensity={8} distance={45} decay={2} />
      )}
    </group>
  );
}

export function FlyingVehicles() {
  const isMobile = useIsMobile();
  const droneCount = isMobile ? 4 : 10;

  const drones = useMemo<DroneConfig[]>(
    () =>
      Array.from({ length: droneCount }, (_, i) => ({
        id: `drone-${i}`,
        radius: 28 + (i % 5) * 16,
        height: 18 + i * 5,
        speed: 0.28 + i * 0.04,
        phase: (i / droneCount) * Math.PI * 2,
        color: NEON[i % NEON.length],
        zCenter: -60 - (i % 4) * 28,
      })),
    [droneCount],
  );

  return (
    <group>
      {drones.map((d) => (
        <Drone key={d.id} {...d} />
      ))}
    </group>
  );
}

export default memo(FlyingVehicles);
