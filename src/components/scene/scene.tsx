import CyberWorld from '@/components/world/cyber-world';
import Effects from '@/components/world/effects';
import { useCameraRig } from '@/hooks';
import { WORLD_CONFIG } from '@/game';
import { memo } from 'react';

function Scene() {
  useCameraRig();

  return (
    <>
      <fog attach="fog" args={['#0a0a0f', 60, 260]} />
      <ambientLight intensity={0.12} color="#0a0a1a" />

      <pointLight position={[35, 6, -45]} color="#00fff5" intensity={5} distance={90} />
      <pointLight position={[-28, 5, -70]} color="#ff00ff" intensity={4} distance={80} />

      {[
        { position: [65, 8, -5] as [number, number, number], color: '#0066ff', intensity: 4, distance: 70 },
        { position: [5, 10, -105] as [number, number, number], color: '#00fff5', intensity: 4, distance: 85 },
        { position: [-45, 18, -25] as [number, number, number], color: '#ff9900', intensity: 3, distance: 65 },
        { position: [20, 12, 40] as [number, number, number], color: '#ff00ff', intensity: 3, distance: 60 },
      ].slice(0, WORLD_CONFIG.extraPointLights).map((light) => (
        <pointLight
          key={light.color}
          position={light.position}
          color={light.color}
          intensity={light.intensity}
          distance={light.distance}
        />
      ))}

      <CyberWorld />
      <Effects />
    </>
  );
}

export default memo(Scene);
