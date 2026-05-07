import { generateId } from '@/utils';
import type { StreamConfig } from './data-streams.types';

export function generateStreams(count: number): StreamConfig[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 8 + Math.random() * 65;
    return {
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius - 55] as [
        number,
        number,
        number,
      ],
      height: 30 + Math.random() * 70,
      count: 40 + Math.floor(Math.random() * 40),
      id: generateId(),
    };
  });
}
