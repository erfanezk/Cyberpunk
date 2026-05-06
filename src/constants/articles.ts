import type { Article } from '@/types';
import { generateId } from '@/utils';

export const ARTICLES: Article[] = [
  {
    title: 'Building Immersive 3D Web Experiences',
    description: 'A deep dive into creating scroll-driven 3D animations with React Three Fiber and Three.js',
    link: '#',
    date: '2024-12',
    tags: ['React', 'Three.js', 'WebGL'],
    id: generateId(),
  },
  {
    title: 'Performance Optimization for R3F',
    description: 'Techniques for achieving 60fps in complex React Three Fiber scenes',
    link: '#',
    date: '2024-10',
    tags: ['Performance', 'React', 'Three.js'],
    id: generateId(),
  },
  {
    title: 'State Management in Large React Apps',
    description: 'Comparing Redux, Zustand, and Jotai for scalable frontend architecture',
    link: '#',
    date: '2024-08',
    tags: ['React', 'Redux', 'Zustand'],
    id: generateId(),
  },
  {
    title: 'Modern CSS Techniques for Cyberpunk UIs',
    description: 'Glassmorphism, scanlines, and neon glows — building futuristic interfaces with pure CSS',
    link: '#',
    date: '2024-06',
    tags: ['CSS', 'Design', 'UI'],
    id: generateId(),
  },
];
