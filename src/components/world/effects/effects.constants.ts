import * as THREE from 'three';

// Module-level instances — created once at load, mutated in-place by useFrame
// (Object.freeze is NOT used — Vector2 props are mutated by postprocessing refs)
export const CHROMATIC_OFFSET = new THREE.Vector2(0.002, 0.002);
export const DISABLED_GLITCH = new THREE.Vector2(999999, 999999);
export const ENABLED_GLITCH_DELAY = new THREE.Vector2(0, 0);
export const GLITCH_DURATION = new THREE.Vector2(0.2, 0.4);
export const GLITCH_STRENGTH = new THREE.Vector2(0.2, 0.4);
