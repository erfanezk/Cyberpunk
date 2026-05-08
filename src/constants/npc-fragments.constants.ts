import type { FragmentId } from '@/game';

export interface MemoryFragmentInfo {
  fragment: FragmentId;
  color: string;
}

export const MEMORY_FRAGMENT_MAP: Record<string, MemoryFragmentInfo> = {
  'memory-bio': { fragment: 'bio', color: '#00fff5' },
  'memory-skills': { fragment: 'skills', color: '#ff00ff' },
  'memory-projects': { fragment: 'projects', color: '#0066ff' },
  'memory-articles': { fragment: 'articles', color: '#ff9900' },
  'memory-contact': { fragment: 'contact', color: '#28c840' },
};
