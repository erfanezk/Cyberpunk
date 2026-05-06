import type { Project } from '@/types';
import { generateId } from '@/utils';

export const PROJECTS: Project[] = [
  {
    title: 'Neural Canvas',
    description: 'AI-powered generative art platform',
    link: '#',
    color: '#00fff5',
    id: generateId(),
  },
  {
    title: 'DataVerse',
    description: 'Immersive data visualization engine',
    link: '#',
    color: '#ff00ff',
    id: generateId(),
  },
  {
    title: 'Quantum UI',
    description: 'Next-gen component library with physics',
    link: '#',
    color: '#0066ff',
    id: generateId(),
  },
  {
    title: 'SynthOS',
    description: 'Retro-futuristic operating system concept',
    link: '#',
    color: '#ff9900',
    id: generateId(),
  },
];
