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
  RUN_SPEED,
  TURN_SPEED,
  WALK_PATH,
  type JumpPhase,
} from './cyber.constants';
import { crossfadeTo, playOneShot } from './cyber.utils';

type JumpState = { phase: JumpPhase; y: number; vy: number };

type ChainEntry = {
  next?: AnimationsName;
  onChain?: () => void;
  releaseLock?: boolean;
};

const CHAIN_MAP: Partial<Record<AnimationsName, ChainEntry>> = {
  [AnimationsName.Jump_Start]: {
    next: AnimationsName.Jump_Loop,
    releaseLock: false,
  },
};

// Character starts at the beginning of the world path
const _initTangent = new THREE.Vector3();
WALK_PATH.getTangentAt(0, _initTangent).normalize();
const INITIAL_POS = WALK_PATH.getPointAt(0);
const INITIAL_ROT_Y = Math.atan2(_initTangent.x, _initTangent.z);

const _forward = new THREE.Vector3();

export function useCyberController() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelUrl);
  const { actions, mixer } = useAnimations(animations, scene);

  const currentAnim = useRef<AnimationsName | null>(null);
  const actionLock = useRef(false);
  const crouching = useRef(false);
  const jump = useRef<JumpState>({ phase: 'idle', y: 0, vy: 0 });
  const punchCombo = useRef<0 | 1>(0);
  const rolling = useRef(false);

  const charPos = useRef(INITIAL_POS.clone());
  const charRotY = useRef(INITIAL_ROT_Y);
  const keysDown = useRef({ forward: false, backward: false, left: false, right: false });

  // Mixer 'finished' — chain clips or clean up terminal clips
  useEffect(() => {
    const terminalCleanup: Partial<Record<AnimationsName, () => void>> = {
      [AnimationsName.Jump_Land]: () => {
        jump.current.phase = 'idle';
      },
      [AnimationsName.Roll]: () => {
        rolling.current = false;
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

    const toggleCrouch = () => {
      crouching.current = !crouching.current;
      crossfadeTo(AnimationsName.Crouch_Idle_Loop, currentAnim, actions);
      actionLock.current = false;
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
      crouch: toggleCrouch,
    };

    const handle = (action: ActionName) => {
      if (actionLock.current) return;
      actionLock.current = true;
      actionHandlers[action]();
    };

    return game.subscribe(handle);
  }, [actions]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keysDown.current.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keysDown.current.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keysDown.current.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keysDown.current.right = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keysDown.current.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keysDown.current.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keysDown.current.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keysDown.current.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const updateFrame = (delta: number) => {
    const group = groupRef.current;
    if (!group) {
      mixer.update(delta);
      return;
    }

    const keys = keysDown.current;

    // 1. Rotation (A/D)
    if (keys.left) charRotY.current += TURN_SPEED * delta;
    if (keys.right) charRotY.current -= TURN_SPEED * delta;

    // 2. Forward movement (W/S) — roll also moves forward
    const speed = rolling.current ? ROLL_SPEED : RUN_SPEED;
    const movingForward = keys.forward || rolling.current;
    if (movingForward || keys.backward) {
      _forward.set(Math.sin(charRotY.current), 0, Math.cos(charRotY.current));
      const dir = movingForward ? 1 : -1;
      charPos.current.addScaledVector(_forward, dir * speed * delta);
    }

    // 3. Apply to group
    group.position.copy(charPos.current);
    group.rotation.y = charRotY.current;

    // 4. Jump physics (Y offset on top of free position)
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

    game.publishState(group, charPos.current);

    // 5. Locomotion animation
    if (!actionLock.current) {
      const moving = keys.forward || keys.backward || rolling.current;
      let next: AnimationsName;
      if (crouching.current) {
        next = moving ? AnimationsName.Crouch_Fwd_Loop : AnimationsName.Crouch_Idle_Loop;
      } else {
        next = moving ? AnimationsName.Jog_Fwd_Loop : AnimationsName.Idle_Loop;
      }
      crossfadeTo(next, currentAnim, actions);
    }

    mixer.update(delta);
  };

  return { scene, groupRef, updateFrame };
}
