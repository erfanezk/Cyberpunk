import * as THREE from 'three';

// Post-processing glitch effect constants
export const CHROMATIC_OFFSET = Object.freeze(new THREE.Vector2(0.002, 0.002));
export const DISABLED_GLITCH = Object.freeze(new THREE.Vector2(999999, 999999));
export const ENABLED_GLITCH_DELAY = Object.freeze(new THREE.Vector2(0, 0));
export const GLITCH_DURATION = Object.freeze(new THREE.Vector2(0.2, 0.4));
export const GLITCH_STRENGTH = Object.freeze(new THREE.Vector2(0.2, 0.4));
