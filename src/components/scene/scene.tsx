import CyberWorld from '@/components/world/cyber-world';
import Effects from '@/components/world/effects';
import { useCameraRig } from '@/hooks';
import { WORLD_CONFIG } from '@/game';
import { memo } from 'react';

const OPTIONAL_LIGHTS: { position: [number, number, number]; color: string; intensity: number; distance: number }[] = [
  { position: [ 20, 4,  55], color: '#e08030', intensity: 4, distance: 55 },
  { position: [-18, 4,  10], color: '#e08030', intensity: 4, distance: 55 },
  { position: [ 25, 4, -50], color: '#e08030', intensity: 4, distance: 55 },
  { position: [-22, 4, -110], color: '#e08030', intensity: 4, distance: 55 },
  { position: [ 20, 4, -160], color: '#e08030', intensity: 4, distance: 55 },
  { position: [-18, 4, -210], color: '#e08030', intensity: 4, distance: 55 },
];

function Scene() {
  useCameraRig();

  return (
    <>
      <fog attach="fog" args={['#080812', 20, 220]} />

      {/* Sky/ground fill */}
      <ambientLight intensity={0.2} color="#1a2035" />
      <hemisphereLight args={['#1a2a5a', '#0a080e', 0.55]} />

      {/* Dominant overhead key — cool moonlight from front-right */}
      <directionalLight position={[15, 40, 30]} intensity={1.8} color="#c0cce8" />

      {/* Subtle back-fill so rear of character isn't fully black */}
      <directionalLight position={[-8, 10, -20]} intensity={0.4} color="#8090c0" />

      {/* Street-lamp warmth along path, gated by quality tier */}
      {OPTIONAL_LIGHTS.slice(0, WORLD_CONFIG.extraPointLights).map((l) => (
        <pointLight
          key={`${l.position[2]}`}
          position={l.position}
          color={l.color}
          intensity={l.intensity}
          distance={l.distance}
          decay={2}
        />
      ))}

      <CyberWorld />
      <Effects />
    </>
  );
}

export default memo(Scene);
