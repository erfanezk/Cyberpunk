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
      {/* Key — matches scene moonlight direction */}
      <directionalLight position={[15, 40, 30]} intensity={3} color="#c0cce8" />
      {/* Fill — soft from left so shadows aren't pure black */}
      <directionalLight position={[-8, 10, 10]} intensity={0.8} color="#8090c0" />
      <group ref={groupRef} scale={3}>
        <primitive object={scene} />
      </group>
    </>
  );
}

export default memo(Cyber);
