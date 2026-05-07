import * as THREE from 'three';

export { AnimationsName } from '@/constants';

export const WALK_PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 65),
  new THREE.Vector3(0, 0, 25),
  new THREE.Vector3(-12, 0, 5),
  new THREE.Vector3(-36, 0, -22),
  new THREE.Vector3(-58, 0, -52),
  new THREE.Vector3(-60, 0, -85),
  new THREE.Vector3(-44, 0, -112),
  new THREE.Vector3(-10, 0, -130),
  new THREE.Vector3(24, 0, -148),
  new THREE.Vector3(50, 0, -172),
  new THREE.Vector3(48, 0, -200),
  new THREE.Vector3(20, 0, -222),
  new THREE.Vector3(0, 0, -242),
]);
