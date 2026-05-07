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

  // ── Street canyon: tower pairs flanking the full winding adventure path
  const corridorPairs: Array<[[number, number, number], [number, number, number]]> = [
    // Entry straight (path x≈0, z: 65→25)
    [[-20, 0, 50], [20, 0, 50]],
    [[-20, 0, 22], [20, 0, 22]],
    // Drift + left turn (path x: 0→-36, z: 5→-22)
    [[8, 0, -2],   [-16, 0, -18]],
    [[4, 0, -20],  [-54, 0, -12]],
    // Deep left alley (path x≈-58, z: -52→-85)
    [[-38, 0, -46], [-78, 0, -40]],
    [[-38, 0, -68], [-80, 0, -60]],
    [[-38, 0, -88], [-80, 0, -82]],
    // Alley curve right (path x: -60→-10, z: -112→-130)
    [[-22, 0, -110], [-62, 0, -118]],
    [[6,   0, -130], [-28, 0, -138]],
    // Hard right turn (path x: 10→50, z: -148→-172)
    [[28, 0, -145], [-8, 0, -152]],
    [[52, 0, -165], [18, 0, -174]],
    // Deep right alley (path x≈50, z: -172→-200)
    [[52, 0, -182], [22, 0, -190]],
    [[52, 0, -202], [22, 0, -210]],
    // Curve back + exit (path x: 48→0, z: -222→-242)
    [[36, 0, -220], [0, 0, -228]],
  ];

  for (const [left, right] of corridorPairs) {
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

  // ── Background skyline: scattered at larger radii
  for (let i = 0; i < backgroundCount; i++) {
    const angle = rnd() * Math.PI * 2;
    const radius = 40 + rnd() * 75;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius - 40;
    // keep background towers away from path center area
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
