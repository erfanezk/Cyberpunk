import { useMemo, memo } from 'react';
import { PROFILE } from '@/constants';
import { SECTION_ZONES } from '@/types';
import type { OverlayProps } from '@/types';
import { smoothstep } from './hero-overlay.utils';
import styles from './hero-overlay.module.css';

function HeroOverlay({ progress }: OverlayProps) {
  const { fadeIn, fadeOut } = SECTION_ZONES.hero;
  const opacity = useMemo(() => {
    const fadeInOp = smoothstep(fadeIn, fadeIn + 0.05, progress);
    const fadeOutOp = 1 - smoothstep(fadeOut - 0.08, fadeOut, progress);
    return fadeInOp * fadeOutOp;
  }, [progress, fadeIn, fadeOut]);

  if (opacity < 0.01) return null;

  return (
    <div className="overlay-layer" style={{ opacity }}>
      <div className={styles.container}>
        <span className={`${styles.corner} ${styles.cornerTL}`} />
        <span className={`${styles.corner} ${styles.cornerTR}`} />
        <span className={`${styles.corner} ${styles.cornerBL}`} />
        <span className={`${styles.corner} ${styles.cornerBR}`} />
        <div className={styles.scanLine} aria-hidden />

        <div className={styles.bootLine}>
          <span className={styles.bootPrompt}>&gt;</span> SYS_ONLINE
          <span className={styles.bootSep}> // </span>v{new Date().getFullYear()}
          <span className={styles.cursor} />
        </div>

        <div className={styles.nameBlock}>
          <h1 className={`${styles.glitchText} ${styles.name}`} data-text={PROFILE.name}>
            {PROFILE.name}
          </h1>
          <div className={styles.nameDivider} />
        </div>

        <p className={styles.title}>{PROFILE.title}</p>
        <p className={styles.tagline}>&ldquo;{PROFILE.tagline}&rdquo;</p>

        <div className={styles.scrollHint}>
          <span className={styles.scrollLabel}>SCROLL TO EXPLORE</span>
          <div className={styles.chevrons}>
            <span className={styles.chev}>&#x25BC;</span>
            <span className={styles.chev}>&#x25BC;</span>
            <span className={styles.chev}>&#x25BC;</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(HeroOverlay);
