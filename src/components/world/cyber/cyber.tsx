import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { memo } from 'react';
import modelUrl from '@/assets/UAL1_Standard.glb?url';
import { useCyberController } from './use-cyber-controller';

useGLTF.preload(modelUrl);

function Cyber() {
  const { scene, groupRef, updateFrame } = useCyberController();

  useFrame((_, delta) => updateFrame(delta));

  return (
    <>
      <directionalLight position={[0, 10, 5]} intensity={3} />
      <group ref={groupRef} scale={3}>
        <primitive object={scene} />
      </group>
    </>
  );
}

export default memo(Cyber);
