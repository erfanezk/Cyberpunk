import { COLORS } from '@/constants';
import type { BillboardConfig } from './holographic-billboards.types';
import { generateId } from '@/utils';

export function generateBillboards(count: number): BillboardConfig[] {
  const neonColors = [COLORS.cyan, COLORS.magenta, COLORS.electricBlue, COLORS.amber];

  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 15 + Math.random() * 60;
    return {
      position: [
        Math.cos(angle) * radius,
        5 + Math.random() * 40,
        Math.sin(angle) * radius - 40,
      ] as [number, number, number],
      rotation: [
        (Math.random() - 0.5) * 0.3,
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.2,
      ] as [number, number, number],
      size: [3 + Math.random() * 5, 5 + Math.random() * 7] as [number, number],
      color: neonColors[Math.floor(Math.random() * neonColors.length)],
      id: generateId(),
    };
  });
}
