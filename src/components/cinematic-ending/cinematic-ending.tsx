import { useMemo } from 'react';
import type { OverlayProps } from '@/types';
import styles from './cinematic-ending.module.css';

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function CinematicEnding({ progress }: OverlayProps) {
  const bars = useMemo(() => smoothstep(0.85, 0.95, progress), [progress]);
  const vignette = useMemo(() => smoothstep(0.86, 0.98, progress), [progress]);

  if (bars < 0.001) return null;

  return (
    <div className={styles.root} aria-hidden>
      <div className={styles.vignette} style={{ opacity: vignette }} />

      <div
        className={`${styles.bar} ${styles.barTop}`}
        style={{ transform: `translateY(${(bars - 1) * 100}%)` }}
      >
        <div className={styles.barLine} style={{ opacity: bars }} />
      </div>
      <div
        className={`${styles.bar} ${styles.barBottom}`}
        style={{ transform: `translateY(${(1 - bars) * 100}%)` }}
      >
        <div className={styles.barLine} style={{ opacity: bars }} />
      </div>
    </div>
  );
}
