import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import {
  GameHud,
  LoadingScreen,
  MemoryModal,
  MusicPlayer,
  Scene,
  StartOverlay,
} from '@/components';
import { COLORS } from '@/constants';
import { game, WORLD_CONFIG } from '@/game';

export default function App() {
  const [started, setStarted] = useState(false);

  const handleStart = () => {
    game.started = true;
    setStarted(true);
  };

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
      {started && <GameHud />}
      {started && <MemoryModal />}
      <MusicPlayer started={started} />
      {!started && <StartOverlay onStart={handleStart} />}
    </>
  );
}
