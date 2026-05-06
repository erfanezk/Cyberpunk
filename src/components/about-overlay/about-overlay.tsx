import { useMemo } from 'react';
import { PROFILE } from '@/constants';
import { SECTION_ZONES } from '@/types';
import type { OverlayProps } from '@/types';
import { smoothstep } from './about-overlay.utils';
import styles from './about-overlay.module.css';

export function AboutOverlay({ progress }: OverlayProps) {
  const { fadeIn, fadeOut } = SECTION_ZONES.about;
  const opacity = useMemo(() => {
    const fadeInOp = smoothstep(fadeIn, fadeIn + 0.06, progress);
    const fadeOutOp = 1 - smoothstep(fadeOut - 0.08, fadeOut, progress);
    return fadeInOp * fadeOutOp;
  }, [progress, fadeIn, fadeOut]);

  if (opacity < 0.01) return null;

  return (
    <div className="overlay-layer" style={{ opacity }}>
      <div
        className="glass-panel"
        style={{
          padding: 'clamp(1.5rem, 4vw, 3rem)',
          maxWidth: '700px',
          width: '90%',
        }}
      >
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0,255,245,0.3), rgba(255,0,255,0.3))',
              border: '2px solid rgba(0,255,245,0.4)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              color: 'var(--cyan)',
            }}
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2
              style={{
                fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                color: 'var(--cyan)',
                marginBottom: '0.75rem',
                letterSpacing: '0.1em',
              }}
            >
              ABOUT.exe
            </h2>
            <p
              style={{
                fontSize: 'clamp(0.8rem, 1.2vw, 0.95rem)',
                lineHeight: 1.7,
                color: 'var(--text)',
              }}
            >
              {PROFILE.bio}
            </p>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {PROFILE.skills.map((skill) => (
            <span key={skill} className={styles.dataChip}>
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
