import type * as THREE from 'three';

export interface SegmentData {
  localY: number;
  height: number;
  phaseOffset: number;
}

export interface TowerData {
  position: [number, number, number];
  width: number;
  color: THREE.Color;
  segments: SegmentData[];
  id: string;
}
