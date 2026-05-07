import * as THREE from 'three';
import { COLORS } from '@/constants';
import type { TowerData, SegmentData } from './neon-towers.types';
import { generateId } from '@/utils';

function generateSegments(totalHeight: number): SegmentData[] {
  const count = 2 + Math.floor(Math.random() * 3); // 2–4 segments
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

  // ── Street canyon: two parallel rows flanking the camera path
  // Camera flies through x ≈ [−50, 80], z ≈ [−120, 120].
  // Towers at x ≈ ±20–32 create a corridor on both sides.
  const corridorZs = [-105, -85, -65, -48, -32, -15, 0, 18, 35, 55];
  for (const z of corridorZs) {
    const jitter = () => (rnd() - 0.5) * 9;

    towers.push({
      id: generateId(),
      position: [-(21 + rnd() * 13), 0, z + jitter()],
      width: 2.5 + rnd() * 4,
      color: pick(),
      segments: generateSegments(28 + rnd() * 68),
    });

    towers.push({
      id: generateId(),
      position: [(21 + rnd() * 13), 0, z + jitter()],
      width: 2.5 + rnd() * 4,
      color: pick(),
      segments: generateSegments(28 + rnd() * 68),
    });
  }

  // ── Background skyline: scattered at larger radii
  for (let i = 0; i < backgroundCount; i++) {
    const angle = rnd() * Math.PI * 2;
    const radius = 40 + rnd() * 75;
    towers.push({
      id: generateId(),
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius - 40],
      width: 1 + rnd() * 4,
      color: pick(),
      segments: generateSegments(10 + rnd() * 65),
    });
  }

  return towers;
}
