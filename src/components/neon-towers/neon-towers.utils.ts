import * as THREE from 'three';
import { COLORS } from '@/constants';
import { CORRIDOR_PAIRS } from '@/constants';
import type { TowerData, SegmentData } from './neon-towers.types';
import { generateId } from '@/utils';

function generateSegments(totalHeight: number): SegmentData[] {
  const count = 2 + Math.floor(Math.random() * 3);
  const gapSize = 0.4 + Math.random() * 0.9;
  const totalGap = gapSize * (count - 1);
  const usableHeight = totalHeight - totalGap;
  const baseSegmentHeight = usableHeight / count;

  const segments: SegmentData[] = [];
  let currentY = 0;

  for (let i = 0; i < count; i++) {
    const height = baseSegmentHeight * (0.8 + Math.random() * 0.4);
    segments.push({
      localY: currentY + height / 2,
      height,
      phaseOffset: i * 0.8 + Math.random() * 0.5,
    });
    currentY += height + gapSize;
  }

  return segments;
}

export function generateTowers(backgroundCount: number): TowerData[] {
  const neonColors = [
    new THREE.Color(COLORS.cyan),
    new THREE.Color(COLORS.magenta),
    new THREE.Color(COLORS.electricBlue),
    new THREE.Color(COLORS.amber),
  ];

  const rnd = () => Math.random();
  const pick = () => neonColors[Math.floor(rnd() * neonColors.length)];

  const towers: TowerData[] = [];

  for (const [left, right] of CORRIDOR_PAIRS) {
    towers.push({
      id: generateId(),
      position: left,
      width: 3 + rnd() * 4,
      color: pick(),
      segments: generateSegments(32 + rnd() * 64),
    });
    towers.push({
      id: generateId(),
      position: right,
      width: 3 + rnd() * 4,
      color: pick(),
      segments: generateSegments(32 + rnd() * 64),
    });
  }

  for (let i = 0; i < backgroundCount; i++) {
    const angle = rnd() * Math.PI * 2;
    const radius = 40 + rnd() * 75;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius - 40;
    if (Math.sqrt(x * x + z * z) < 50) continue;
    towers.push({
      id: generateId(),
      position: [x, 0, z],
      width: 1 + rnd() * 4,
      color: pick(),
      segments: generateSegments(10 + rnd() * 65),
    });
  }

  return towers;
}
