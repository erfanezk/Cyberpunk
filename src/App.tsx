import { ScrollControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useCallback, useRef, useState } from 'react';
import { AboutOverlay, ArticlesOverlay, BackToTop, CinematicEnding, ContactOverlay, HeroOverlay, MusicPlayer, ProjectsOverlay, Scene } from '@/components';
import { COLORS } from '@/constants';

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
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            camera={{ fov: 60, near: 0.1, far: 1000, position: [0, 80, 180] }}
            style={{ background: COLORS.background }}
          >
            <ScrollControls pages={7} damping={0.25}>
              <Scene onProgress={handleProgress} scrollToTopRef={scrollToTopRef} />
            </ScrollControls>
          </Canvas>
        </div>
      </div>
      <HeroOverlay progress={progress} />
      <AboutOverlay progress={progress} />
      <ProjectsOverlay progress={progress} />
      <ArticlesOverlay progress={progress} />
      <ContactOverlay progress={progress} />
      <CinematicEnding progress={progress} />
      <MusicPlayer />
      <BackToTop progress={progress} onScrollToTop={() => scrollToTopRef.current()} />
    </>
  );
}
