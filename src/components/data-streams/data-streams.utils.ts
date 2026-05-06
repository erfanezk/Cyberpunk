import { generateId } from '@/utils';
import type { StreamConfig } from './data-streams.types';

export function generateStreams(count: number): StreamConfig[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 10 + Math.random() * 70;
    return {
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius - 40] as [
        number,
        number,
        number,
      ],
      height: 20 + Math.random() * 60,
      count: 30 + Math.floor(Math.random() * 30),
      id: generateId(),
    };
  });
}
