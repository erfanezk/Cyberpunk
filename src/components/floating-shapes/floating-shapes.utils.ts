import { COLORS } from '@/constants';
import type { ShapeConfig, ShapeType } from './floating-shapes.types';
import { generateId } from '@/utils';

export function generateShapes(count: number): ShapeConfig[] {
  const geometries: ShapeType[] = ['icosahedron', 'torusKnot', 'octahedron', 'dodecahedron'];
  const neonColors = [COLORS.cyan, COLORS.magenta, COLORS.electricBlue, COLORS.amber];

  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 20 + Math.random() * 60;
    return {
      position: [
        Math.cos(angle) * radius,
        5 + Math.random() * 50,
        Math.sin(angle) * radius - 40,
      ] as [number, number, number],
      scale: 0.5 + Math.random() * 2.5,
      rotationSpeed: [
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
      ] as [number, number, number],
      geometry: geometries[Math.floor(Math.random() * geometries.length)],
      color: neonColors[Math.floor(Math.random() * neonColors.length)],
      id: generateId(),
    };
  });
}
