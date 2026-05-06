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
          <img
            src={PROFILE.photo}
            alt={PROFILE.name}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(0,255,245,0.4)',
              flexShrink: 0,
            }}
          />
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
