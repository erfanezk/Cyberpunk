import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { COLORS } from '@/constants';

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
      {/* main body */}
      <mesh>
        <boxGeometry args={[2.2, 0.5, 2.2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={6} />
      </mesh>
      {/* glow core */}
      <mesh>
        <sphereGeometry args={[0.55, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={10} transparent opacity={0.85} />
      </mesh>
      <pointLight ref={lightRef} color={color} intensity={8} distance={45} decay={2} />
    </group>
  );
}

export function FlyingVehicles() {
  const drones = useMemo<DroneConfig[]>(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: `drone-${i}`,
        radius: 28 + (i % 5) * 16,
        height: 18 + i * 5,
        speed: 0.28 + i * 0.04,   // radians/sec — visible orbital speed
        phase: (i / 10) * Math.PI * 2,
        color: NEON[i % NEON.length],
        zCenter: -60 - (i % 4) * 28,
      })),
    [],
  );

  return (
    <group>
      {drones.map((d) => (
        <Drone key={d.id} {...d} />
      ))}
    </group>
  );
}
