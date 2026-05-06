import { useScroll } from '@react-three/drei';
import { CyberWorld } from '@/components/cyber-world';
import { Effects } from '@/components/effects';
import { useCameraRig, useScrollProgress } from '@/hooks';
import { memo } from 'react';

interface SceneProps {
  onProgress?: (value: number) => void;
}

function Scene({ onProgress }: SceneProps) {
  const scroll = useScroll();
  useCameraRig(scroll);
  useScrollProgress(onProgress);

  return (
    <>
      <fog attach="fog" args={['#0a0a0f', 50, 250]} />
      <ambientLight intensity={0.1} color="#0a0a1a" />
      <CyberWorld scroll={scroll} />
      <Effects scroll={scroll} />
    </>
  );
}

export default memo(Scene);
