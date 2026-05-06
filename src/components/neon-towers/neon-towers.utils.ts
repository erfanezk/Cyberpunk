import * as THREE from 'three';
import { COLORS } from '@/constants';
import type { TowerData } from './neon-towers.types';
import { generateId } from '@/utils';

export function generateTowers(count: number): TowerData[] {
  const neonColors = [
    new THREE.Color(COLORS.cyan),
    new THREE.Color(COLORS.magenta),
    new THREE.Color(COLORS.electricBlue),
  ];

  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 15 + Math.random() * 80;
    const height = 10 + Math.random() * 70;
    const width = 1 + Math.random() * 4;

    return {
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius - 40] as [
        number,
        number,
        number,
      ],
      scale: [width, height, width] as [number, number, number],
      color: neonColors[Math.floor(Math.random() * neonColors.length)],
      id: generateId(),
    };
  });
}
