import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { AnimationsName } from './cyber.constants';
import type { CyberProps } from './cyber.types';
import { updateTransform } from './cyber.utils';
import modelUrl from '@/assets/UAL1_Standard.glb?url';
import { game } from '@/game';

useGLTF.preload(modelUrl);

type Actions = ReturnType<typeof useAnimations>['actions'];

function crossfadeTo(
  target: AnimationsName,
  current: { current: AnimationsName | null },
  actions: Actions,
): void {
  if (target === current.current) return;
  const prev = current.current ? actions[current.current] : null;
  const next = actions[target];
  if (!next) return;
  next.reset().setEffectiveWeight(1);
  if (prev) next.crossFadeFrom(prev, 0.4, true);
  next.play();
  current.current = target;
}

export function Cyber({ scroll }: CyberProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelUrl);
  const { actions, mixer } = useAnimations(animations, scene);
  const currentAnim = useRef<AnimationsName | null>(null);
  const prevOffset = useRef(scroll.offset);
  const smoothSpeed = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const t = THREE.MathUtils.clamp(scroll.offset, 0, 1);
    const pos = updateTransform(groupRef.current, t);

    game.publishState(groupRef.current, pos);

    const moved = Math.abs(scroll.offset - prevOffset.current) > 0.0003;
    prevOffset.current = scroll.offset;
    smoothSpeed.current = moved ? 1 : THREE.MathUtils.lerp(smoothSpeed.current, 0, 0.2);

    const targetAnim =
      smoothSpeed.current > 0.1 ? AnimationsName.Jog_Fwd_Loop : AnimationsName.Idle_Loop;
    crossfadeTo(targetAnim, currentAnim, actions);

    mixer.update(delta);
  });

  return (
    <>
      <directionalLight position={[0, 10, 5]} intensity={3} />
      <group ref={groupRef} scale={3}>
        <primitive object={scene} />
      </group>
    </>
  );
}
