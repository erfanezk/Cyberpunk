import type { useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import type { AnimationsName } from './cyber.constants';
import { WALK_PATH } from './cyber.constants';

export type Actions = ReturnType<typeof useAnimations>['actions'];
export type AnimRef = { current: AnimationsName | null };

const _tan = new THREE.Vector3();

export function updateTransform(group: THREE.Group, t: number): THREE.Vector3 {
  const pos = WALK_PATH.getPointAt(t);
  group.position.copy(pos);

  WALK_PATH.getTangentAt(t, _tan).normalize();
  const targetY = Math.atan2(_tan.x, _tan.z);
  let dy = targetY - group.rotation.y;
  if (dy > Math.PI) dy -= Math.PI * 2;
  if (dy < -Math.PI) dy += Math.PI * 2;
  group.rotation.y += dy * 0.08;

  return pos;
}

export function crossfadeTo(
  target: AnimationsName,
  current: AnimRef,
  actions: Actions,
  fadeIn = 0.4,
): void {
  if (target === current.current) return;
  const next = actions[target];
  if (!next) return;
  const prev = current.current ? actions[current.current] : null;
  next.reset().setLoop(THREE.LoopRepeat, Infinity);
  next.clampWhenFinished = false;
  next.setEffectiveWeight(1);
  if (prev) next.crossFadeFrom(prev, fadeIn, true);
  next.play();
  current.current = target;
}

export function playOneShot(
  target: AnimationsName,
  current: AnimRef,
  actions: Actions,
  fadeIn = 0.15,
): THREE.AnimationAction | null {
  const next = actions[target];
  if (!next) return null;
  const prev = current.current ? actions[current.current] : null;
  next.reset().setLoop(THREE.LoopOnce, 1);
  next.clampWhenFinished = true;
  next.setEffectiveWeight(1);
  if (prev) next.crossFadeFrom(prev, fadeIn, true);
  next.play();
  current.current = target;
  return next;
}
