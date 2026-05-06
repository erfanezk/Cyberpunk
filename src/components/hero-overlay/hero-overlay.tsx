import { useMemo } from 'react';
import { PROFILE } from '@/constants';
import { SECTION_ZONES } from '@/types';
import type { OverlayProps } from '@/types';
import { smoothstep } from './hero-overlay.utils';
import styles from './hero-overlay.module.css';

export function HeroOverlay({ progress }: OverlayProps) {
  const { fadeIn, fadeOut } = SECTION_ZONES.hero;
  const opacity = useMemo(() => {
    const fadeInOp = smoothstep(fadeIn, fadeIn + 0.05, progress);
    const fadeOutOp = 1 - smoothstep(fadeOut - 0.08, fadeOut, progress);
    return fadeInOp * fadeOutOp;
  }, [progress, fadeIn, fadeOut]);

  if (opacity < 0.01) return null;

  return (
    <div className="overlay-layer" style={{ opacity }}>
      <div style={{ textAlign: 'center' }}>
        <h1
          className={styles.glitchText}
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 6rem)',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#fff',
            marginBottom: '1rem',
          }}
        >
          {PROFILE.name}
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
            color: 'var(--cyan)',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
          }}
        >
          {PROFILE.title}
        </p>
        <p
          style={{
            fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
            color: 'var(--text-dim)',
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
          {PROFILE.tagline}
        </p>
        <div
          style={{
            marginTop: '3rem',
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            letterSpacing: '0.2em',
            animation: 'blink 2s step-end infinite',
          }}
        >
          SCROLL TO EXPLORE
        </div>
      </div>
    </div>
  );
}
