import { useScroll } from '@react-three/drei';
import CyberWorld from '@/components/cyber-world';
import Effects from '@/components/effects';
import { useCameraRig, useIsMobile, useScrollProgress } from '@/hooks';
import { useEffect, memo } from 'react';

interface SceneProps {
  onProgress?: (value: number) => void;
  scrollToTopRef?: React.MutableRefObject<() => void>;
}

function Scene({ onProgress, scrollToTopRef }: SceneProps) {
  const isMobile = useIsMobile();
  const scroll = useScroll();
  useCameraRig(scroll);
  useScrollProgress(onProgress);

  useEffect(() => {
    if (scrollToTopRef) {
      scrollToTopRef.current = () => {
        scroll.el?.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }
  }, [scroll, scrollToTopRef]);

  return (
    <>
      <fog attach="fog" args={['#0a0a0f', 60, 260]} />
      <ambientLight intensity={0.12} color="#0a0a1a" />

      <pointLight position={[35, 6, -45]} color="#00fff5" intensity={5} distance={90} />
      <pointLight position={[-28, 5, -70]} color="#ff00ff" intensity={4} distance={80} />
      {!isMobile && (
        <>
          <pointLight position={[65, 8, -5]} color="#0066ff" intensity={4} distance={70} />
          <pointLight position={[5, 10, -105]} color="#00fff5" intensity={4} distance={85} />
          <pointLight position={[-45, 18, -25]} color="#ff9900" intensity={3} distance={65} />
          <pointLight position={[20, 12, 40]} color="#ff00ff" intensity={3} distance={60} />
        </>
      )}

      <CyberWorld scroll={scroll} />
      <Effects scroll={scroll} />
    </>
  );
}

export default memo(Scene);
