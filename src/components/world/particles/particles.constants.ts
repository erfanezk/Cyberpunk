import * as THREE from 'three';
import { COLORS } from '@/constants';

// Stable color objects shared across all Particles instances
export const NEON_COLORS = Object.freeze([
  new THREE.Color(COLORS.cyan),
  new THREE.Color(COLORS.magenta),
  new THREE.Color(COLORS.electricBlue),
  new THREE.Color('#ffffff'),
] as const);
