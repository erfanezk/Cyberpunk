import { ScrollControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useRef, useState } from 'react';
import {
  AboutOverlay,
  CinematicEnding,
  GameHud,
  HeroOverlay,
  LoadingScreen,
  MusicPlayer,
  Scene,
} from '@/components';
import { COLORS } from '@/constants';
import { WORLD_CONFIG } from '@/game';

export default function App() {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const scrollToTopRef = useRef<() => void>(() => {});

  const handleProgress = useCallback((value: number) => {
    if (Math.abs(progressRef.current - value) > 0.001) {
      progressRef.current = value;
      setProgress(value);
    }
  }, []);

  return (
    <>
      <div className="scroll-container" style={{ height: '100vh' }}>
        <div className="canvas-wrapper">
          <Canvas
            dpr={[WORLD_CONFIG.dprMin, WORLD_CONFIG.dprMax]}
            gl={{ antialias: WORLD_CONFIG.antialias, alpha: false, powerPreference: 'high-performance' }}
            camera={{ fov: 60, near: 0.1, far: 1000, position: [0, 80, 180] }}
            style={{ background: COLORS.background }}
          >
            <Suspense fallback={null}>
              <ScrollControls pages={7} damping={0.25}>
                <Scene onProgress={handleProgress} scrollToTopRef={scrollToTopRef} />
              </ScrollControls>
            </Suspense>
          </Canvas>
        </div>
      </div>
      <LoadingScreen />
      <GameHud progress={progress} />
      <HeroOverlay progress={progress} />
      <CinematicEnding progress={progress} />
      <AboutOverlay progress={progress} />
      <MusicPlayer />
    </>
  );
}
