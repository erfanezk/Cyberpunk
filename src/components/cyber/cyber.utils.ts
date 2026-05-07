import * as THREE from 'three';
import { WALK_PATH } from './cyber.constants';

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
