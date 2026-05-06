import type { Article } from '@/types';
import { generateId } from '@/utils';

export const ARTICLES: Article[] = [
  {
    title: 'Building Immersive 3D Web Experiences',
    description:
      'A deep dive into creating scroll-driven 3D animations with React Three Fiber and Three.js',
    link: '#',
    date: '2024-12',
    tags: ['React', 'Three.js', 'WebGL'],
    id: generateId(),
  },
];
