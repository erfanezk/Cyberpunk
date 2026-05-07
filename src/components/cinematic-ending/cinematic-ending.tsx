import { useMemo } from 'react';
import { PROFILE } from '@/constants';
import type { OverlayProps } from '@/types';
import styles from './cinematic-ending.module.css';

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

const STATS = [
  { label: 'AGENT', value: PROFILE.name.toUpperCase() },
  { label: 'DISTRICTS', value: '5 / 5' },
  { label: 'COMPLETION', value: '100%' },
  { label: 'STATUS', value: 'ACCOMPLISHED', accent: true },
];

export function CinematicEnding({ progress }: OverlayProps) {
  const bars = useMemo(() => smoothstep(0.85, 0.95, progress), [progress]);
  const vignette = useMemo(() => smoothstep(0.86, 0.99, progress), [progress]);
  const textReveal = useMemo(() => smoothstep(0.93, 1.0, progress), [progress]);

  if (bars < 0.001) return null;

  return (
    <div className={styles.root} aria-hidden>
      <div className={styles.vignette} style={{ opacity: vignette }} />
      <div className={styles.scanlines} style={{ opacity: Math.min(vignette * 0.6, 0.5) }} />

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

      {textReveal > 0.01 && (
        <div className={styles.content} style={{ opacity: textReveal }}>
          <div className={styles.glitchWrap}>
            <h1
              className={styles.gameOver}
              data-text="GAME OVER"
            >
              GAME OVER
            </h1>
          </div>

          <div className={styles.separator} />

          <div className={styles.subtitle}>— SESSION TERMINATED —</div>

          <div className={styles.statsBlock}>
            {STATS.map((s) => (
              <div key={s.label} className={styles.statRow}>
                <span className={styles.statLabel}>{s.label}</span>
                <span className={styles.statDots} />
                <span className={`${styles.statValue} ${s.accent ? styles.statAccent : ''}`}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.replay}>
            <span className={styles.replayText}>▶ SCROLL TO TOP TO RESTART</span>
          </div>
        </div>
      )}
    </div>
  );
}
