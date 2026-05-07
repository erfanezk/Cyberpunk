import { useAnimations, useGLTF } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import modelUrl from '@/assets/UAL1_Standard.glb?url';
import { game, type ActionName } from '@/game';
import {
  AnimationsName,
  JUMP_GRAVITY,
  JUMP_INITIAL_VY,
  ROLL_SPEED,
  WALK_PATH,
  type JumpPhase,
} from './cyber.constants';
import type { CyberProps } from './cyber.types';
import { crossfadeTo, playOneShot, updateTransform } from './cyber.utils';

type JumpState = { phase: JumpPhase; y: number; vy: number };

type ChainEntry = {
  next?: AnimationsName;
  onChain?: () => void;
  releaseLock?: boolean;
};

const CHAIN_MAP: Partial<Record<AnimationsName, ChainEntry>> = {
  [AnimationsName.Sitting_Enter]: {
    next: AnimationsName.Sitting_Idle_Loop,
    releaseLock: true,
  },
  [AnimationsName.Jump_Start]: {
    next: AnimationsName.Jump_Loop,
    onChain: undefined,
    releaseLock: false,
  },
};

export function useCyberController(scroll: CyberProps['scroll']) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelUrl);
  const { actions, mixer } = useAnimations(animations, scene);

  const currentAnim = useRef<AnimationsName | null>(null);
  const actionLock = useRef(false);
  const sitting = useRef(false);
  const jump = useRef<JumpState>({ phase: 'idle', y: 0, vy: 0 });
  const punchCombo = useRef<0 | 1>(0);
  const rolling = useRef(false);

  const prevOffset = useRef(scroll.offset);
  const smoothSpeed = useRef(0);

  // Mixer 'finished' — chain clips or clean up terminal clips
  useEffect(() => {
    const terminalCleanup: Partial<Record<AnimationsName, () => void>> = {
      [AnimationsName.Sitting_Exit]: () => {
        sitting.current = false;
      },
      [AnimationsName.Jump_Land]: () => {
        jump.current.phase = 'idle';
      },
      [AnimationsName.Roll]: () => {
        rolling.current = false;
        smoothSpeed.current = 0;
      },
    };

    const onFinished = (event: { action: THREE.AnimationAction }) => {
      const clip = event.action.getClip().name as AnimationsName;

      const chain = CHAIN_MAP[clip];
      if (chain) {
        if (chain.next) crossfadeTo(chain.next, currentAnim, actions);
        if (chain.onChain) chain.onChain();
        if (clip === AnimationsName.Jump_Start) jump.current.phase = 'loop';
        if (chain.releaseLock !== false) actionLock.current = false;
        return;
      }

      terminalCleanup[clip]?.();
      actionLock.current = false;
    };

    mixer.addEventListener('finished', onFinished);
    return () => mixer.removeEventListener('finished', onFinished);
  }, [mixer, actions]);

  // Action handlers — OCP: add new actions by extending this map
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

    const actionHandlers: Record<ActionName, () => void> = {
      jump: startJump,
      punch: () => {
        const anim =
          punchCombo.current === 0 ? AnimationsName.Punch_Jab : AnimationsName.Punch_Cross;
        punchCombo.current = punchCombo.current === 0 ? 1 : 0;
        playOneShot(anim, currentAnim, actions, 0.1);
      },
      roll: () => {
        rolling.current = true;
        playOneShot(AnimationsName.Roll, currentAnim, actions, 0.1);
      },
      sit: toggleSit,
    };

    const handle = (action: ActionName) => {
      if (actionLock.current) return;
      actionLock.current = true;
      actionHandlers[action]();
    };

    return game.subscribe(handle);
  }, [actions]);

  const updateFrame = (delta: number) => {
    const group = groupRef.current;
    if (!group) {
      mixer.update(delta);
      return;
    }

    // 1. Walk path transform
    const t = THREE.MathUtils.clamp(scroll.offset, 0, 1);
    const pos = updateTransform(group, t);

    // Roll: advance scroll along path
    if (rolling.current && scroll.el) {
      const scrollable = scroll.el.scrollHeight - scroll.el.clientHeight;
      scroll.el.scrollTop += ((ROLL_SPEED * delta) / WALK_PATH.getLength()) * scrollable;
    }

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

    // 3. Scroll-driven locomotion (Idle/Jog)
    const moved = Math.abs(scroll.offset - prevOffset.current) > 0.0003;
    prevOffset.current = scroll.offset;
    smoothSpeed.current = moved ? 1 : THREE.MathUtils.lerp(smoothSpeed.current, 0, 0.2);

    if (!actionLock.current && !sitting.current) {
      const next =
        smoothSpeed.current > 0.1 ? AnimationsName.Jog_Fwd_Loop : AnimationsName.Idle_Loop;
      crossfadeTo(next, currentAnim, actions);
    }

    mixer.update(delta);
  };

  return { scene, groupRef, updateFrame };
}
