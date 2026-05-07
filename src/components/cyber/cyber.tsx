import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import modelUrl from '@/assets/UAL1_Standard.glb?url';
import { game, type ActionName } from '@/game';
import { AnimationsName, JUMP_GRAVITY, JUMP_INITIAL_VY, type JumpPhase } from './cyber.constants';
import type { CyberProps } from './cyber.types';
import { crossfadeTo, playOneShot, updateTransform } from './cyber.utils';

useGLTF.preload(modelUrl);

type JumpState = { phase: JumpPhase; y: number; vy: number };

export function Cyber({ scroll }: CyberProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelUrl);
  const { actions, mixer } = useAnimations(animations, scene);

  const currentAnim = useRef<AnimationsName | null>(null);
  const actionLock = useRef(false);
  const sitting = useRef(false);
  const jump = useRef<JumpState>({ phase: 'idle', y: 0, vy: 0 });

  const prevOffset = useRef(scroll.offset);
  const smoothSpeed = useRef(0);

  // Mixer 'finished' — chain Sitting_Enter→Idle, Jump_Start→Loop, release lock on terminal clips
  useEffect(() => {
    const onFinished = (event: { action: THREE.AnimationAction }) => {
      const clip = event.action.getClip().name as AnimationsName;

      if (clip === AnimationsName.Sitting_Enter) {
        crossfadeTo(AnimationsName.Sitting_Idle_Loop, currentAnim, actions);
        actionLock.current = false;
        return;
      }
      if (clip === AnimationsName.Jump_Start) {
        crossfadeTo(AnimationsName.Jump_Loop, currentAnim, actions);
        jump.current.phase = 'loop';
        return;
      }
      if (clip === AnimationsName.Sitting_Exit) sitting.current = false;
      if (clip === AnimationsName.Jump_Land) jump.current.phase = 'idle';

      actionLock.current = false;
    };
    mixer.addEventListener('finished', onFinished);
    return () => mixer.removeEventListener('finished', onFinished);
  }, [mixer, actions]);

  // Game-action subscription
  useEffect(() => {
    const startJump = () => {
      jump.current = { phase: 'ascend', y: 0, vy: JUMP_INITIAL_VY };
      playOneShot(AnimationsName.Jump_Start, currentAnim, actions);
    };

    const toggleSit = () => {
      if (sitting.current) {
        playOneShot(AnimationsName.Sitting_Exit, currentAnim, actions);
      } else {
        sitting.current = true;
        playOneShot(AnimationsName.Sitting_Enter, currentAnim, actions);
      }
    };

    const handle = (action: ActionName) => {
      if (actionLock.current) return;
      actionLock.current = true;

      switch (action) {
        case 'jump':
          startJump();
          break;
        case 'punch':
          playOneShot(AnimationsName.Punch_Cross, currentAnim, actions, 0.1);
          break;
        case 'leanBack':
          playOneShot(AnimationsName.Hit_Chest, currentAnim, actions);
          break;
        case 'sit':
          toggleSit();
          break;
      }
    };

    return game.subscribe(handle);
  }, [actions]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) {
      mixer.update(delta);
      return;
    }

    // 1. Walk path transform
    const t = THREE.MathUtils.clamp(scroll.offset, 0, 1);
    const pos = updateTransform(group, t);
    game.publishState(group, pos);

    // 2. Jump physics
    const j = jump.current;
    if (j.phase === 'ascend' || j.phase === 'loop') {
      j.y += j.vy * delta;
      j.vy -= JUMP_GRAVITY * delta;
      if (j.y <= 0 && j.vy < 0) {
        j.y = 0;
        j.vy = 0;
        j.phase = 'land';
        playOneShot(AnimationsName.Jump_Land, currentAnim, actions, 0.1);
      }
    }
    if (j.phase !== 'idle') group.position.y += Math.max(0, j.y);

    // 3. Scroll-driven locomotion (Idle/Jog) — gated by actions/sitting
    const moved = Math.abs(scroll.offset - prevOffset.current) > 0.0003;
    prevOffset.current = scroll.offset;
    smoothSpeed.current = moved ? 1 : THREE.MathUtils.lerp(smoothSpeed.current, 0, 0.2);

    if (!actionLock.current && !sitting.current) {
      const next =
        smoothSpeed.current > 0.1 ? AnimationsName.Jog_Fwd_Loop : AnimationsName.Idle_Loop;
      crossfadeTo(next, currentAnim, actions);
    }

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
