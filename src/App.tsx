import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { GameHud, LoadingScreen, MusicPlayer, Scene } from '@/components';
import { COLORS } from '@/constants';
import { WORLD_CONFIG } from '@/game';

export default function App() {
  return (
    <>
      <div className="canvas-wrapper">
        <Canvas
          dpr={[WORLD_CONFIG.dprMin, WORLD_CONFIG.dprMax]}
          gl={{
            antialias: WORLD_CONFIG.antialias,
            alpha: false,
            powerPreference: 'high-performance',
          }}
          camera={{ fov: 60, near: 0.1, far: 1000, position: [0, 80, 180] }}
          style={{ background: COLORS.background }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
      <LoadingScreen />
      <GameHud />
      <MusicPlayer />
    </>
  );
}
