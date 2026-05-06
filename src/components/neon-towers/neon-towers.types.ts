import type * as THREE from 'three';

export interface TowerData {
  position: [number, number, number];
  scale: [number, number, number];
  color: THREE.Color;
  id: string;
}
