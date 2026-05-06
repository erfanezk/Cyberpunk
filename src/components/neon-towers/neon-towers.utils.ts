import * as THREE from 'three';
import { COLORS } from '@/constants';
import type { TowerData, SegmentData } from './neon-towers.types';
import { generateId } from '@/utils';

function generateSegments(totalHeight: number): SegmentData[] {
  const count = 3 + Math.floor(Math.random() * 3); // 3–5 segments
  const gapSize = 0.5 + Math.random(); // 0.5–1.5 unit gaps
  const totalGap = gapSize * (count - 1);
  const usableHeight = totalHeight - totalGap;
  const baseSegmentHeight = usableHeight / count;

  const segments: SegmentData[] = [];
  let currentY = 0;

  for (let i = 0; i < count; i++) {
    // Vary segment height slightly (±20%)
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

export function generateTowers(count: number): TowerData[] {
  const neonColors = [
    new THREE.Color(COLORS.cyan),
    new THREE.Color(COLORS.magenta),
    new THREE.Color(COLORS.electricBlue),
  ];

  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 15 + Math.random() * 80;
    const totalHeight = 10 + Math.random() * 70;
    const width = 1 + Math.random() * 4;

    return {
      position: [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius - 40,
      ] as [number, number, number],
      width,
      color: neonColors[Math.floor(Math.random() * neonColors.length)],
      segments: generateSegments(totalHeight),
      id: generateId(),
    };
  });
}