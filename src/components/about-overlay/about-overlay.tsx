import { useMemo } from 'react';
import { PROFILE } from '@/constants';
import { SECTION_ZONES } from '@/types';
import type { OverlayProps } from '@/types';
import { smoothstep } from './about-overlay.utils';
import styles from './about-overlay.module.css';
import { SplashWrapper } from '@/components/splash-wrapper';

export function AboutOverlay({ progress }: OverlayProps) {
  const { fadeIn, fadeOut } = SECTION_ZONES.about;
  const opacity = useMemo(() => {
    const fadeInOp = smoothstep(fadeIn, fadeIn + 0.06, progress);
    const fadeOutOp = 1 - smoothstep(fadeOut - 0.08, fadeOut, progress);
    return fadeInOp * fadeOutOp;
  }, [progress, fadeIn, fadeOut]);

  if (opacity < 0.01) return null;

  const hasSkills = PROFILE.skills.length > 0;

  return (
    <SplashWrapper progress={progress} fadeIn={SECTION_ZONES.about.fadeIn} color="rgba(168,85,247,0.15)">
      <div className="overlay-layer" style={{ opacity }}>
        <div className={styles.wrapper}>
          <h2 className={styles.title}>ABOUT</h2>

          <div className={`glass-panel ${styles.card}`}>
            <div className={styles.cardHeader}>
              <span className={styles.dot} style={{ background: '#ff5f57' }} />
              <span className={styles.dot} style={{ background: '#febc2e' }} />
              <span className={styles.dot} style={{ background: '#28c840' }} />
              <span className={styles.fileLabel}>identity.sys</span>
              <span className={styles.statusBadge}>
                <span className={styles.statusPulse} />
                ONLINE
              </span>
            </div>

            <div className={styles.body}>
              <div className={styles.identity}>
                <div className={styles.photoFrame}>
                  <span className={styles.bracket} data-pos="tl" />
                  <span className={styles.bracket} data-pos="tr" />
                  <span className={styles.bracket} data-pos="bl" />
                  <span className={styles.bracket} data-pos="br" />
                  <img src={PROFILE.photo} alt={PROFILE.name} className={styles.photo} />
                  <span className={styles.scanline} aria-hidden />
                </div>
                <div className={styles.identityMeta}>
                  <span className={styles.metaLabel}>// USER</span>
                  <h3 className={styles.name}>{PROFILE.name}</h3>
                  <span className={styles.role}>{PROFILE.title}</span>
                </div>
              </div>

              <div className={styles.divider} aria-hidden />

              <div className={styles.content}>
                <div className={styles.bioBlock}>
                  <span className={styles.sectionLabel}>// BIO</span>
                  <p className={styles.bio}>{PROFILE.bio}</p>
                  <p className={styles.tagline}>&ldquo;{PROFILE.tagline}&rdquo;</p>
                </div>

                {hasSkills && (
                  <div className={styles.skillsBlock}>
                    <span className={styles.sectionLabel}>// STACK</span>
                    <div className={styles.skills}>
                      {PROFILE.skills.map((s) => (
                        <span key={s} className={styles.chip}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.footer}>
              <span>
                <span className={styles.kvKey}>LOC</span>
                <span className={styles.kvArrow}> &gt; </span>IRAN
              </span>
              <span className={styles.sep}>|</span>
              <span>
                <span className={styles.kvKey}>TZ</span>
                <span className={styles.kvArrow}> &gt; </span>UTC+03:30
              </span>
              <span className={styles.sep}>|</span>
              <span>
                <span className={styles.kvKey}>STATUS</span>
                <span className={styles.kvArrow}> &gt; </span>AVAILABLE
              </span>
            </div>
          </div>
        </div>
      </div>
    </SplashWrapper>
  );
}
