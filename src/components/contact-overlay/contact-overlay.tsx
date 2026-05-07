import { useEffect, useMemo, useState } from 'react';
import { CONTACT } from '@/constants';
import { SECTION_ZONES } from '@/types';
import type { OverlayProps } from '@/types';
import { smoothstep } from './contact-overlay.utils';
import styles from './contact-overlay.module.css';
import { SplashWrapper } from '@/components/splash-wrapper';

interface ContactLine {
  label: string;
  value: string;
  link?: string;
  id: string;
}

const CONTACT_LINES: ContactLine[] = [
  { label: 'email', value: CONTACT.email, link: `mailto:${CONTACT.email}`, id: 'c1' },
  { label: 'github', value: CONTACT.github, link: CONTACT.github, id: 'c2' },
  { label: 'linkedin', value: CONTACT.linkedin, link: CONTACT.linkedin, id: 'c3' },
];

export function ContactOverlay({ progress }: OverlayProps) {
  const { fadeIn, fadeOut } = SECTION_ZONES.contact;
  const opacity = useMemo(() => {
    const fadeInOp = smoothstep(fadeIn, fadeIn + 0.06, progress);
    const fadeOutOp = 1 - smoothstep(fadeOut - 0.03, fadeOut + 0.01, progress);
    return fadeInOp * fadeOutOp;
  }, [progress, fadeIn, fadeOut]);

  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (opacity > 0.5 && visibleLines === 0) {
      CONTACT_LINES.forEach((_, i) => {
        setTimeout(() => setVisibleLines(i + 1), 300 + i * 200);
      });
    }
    if (opacity < 0.1) {
      setVisibleLines(0);
    }
  }, [opacity, visibleLines]);

  if (opacity < 0.01) return null;

  return (
    <SplashWrapper progress={progress} fadeIn={SECTION_ZONES.contact.fadeIn} color="rgba(0,255,150,0.15)">
      <div className="overlay-layer" style={{ opacity }}>
        <div className={styles.wrapper}>
          <h2 className={styles.title}><span className={styles.missionId}>MISSION_04</span> // COMM_TOWER</h2>
          <p className={styles.subtitle}>ESTABLISH_CONNECTION // TRANSMIT</p>
          <div className={`glass-panel ${styles.card}`}>
            <div className={styles.cardHeader}>
              <span className={styles.dot} style={{ background: '#ff5f57' }} />
              <span className={styles.dot} style={{ background: '#febc2e' }} />
              <span className={styles.dot} style={{ background: '#28c840' }} />
              <span style={{ marginLeft: 'auto' }}>terminal</span>
            </div>
            <div className={styles.cardBody}>
              {CONTACT_LINES.slice(0, visibleLines).map((line, i) => (
                <div
                  key={line.id}
                  className={styles.line}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className={styles.prompt}>&gt;$</span>
                  <span className={styles.label}>{line.label}:</span>
                  {line.link ? (
                    <a href={line.link} target="_blank" rel="noopener noreferrer">
                      {line.value}
                    </a>
                  ) : (
                    <span>{line.value}</span>
                  )}
                </div>
              ))}
              {visibleLines >= CONTACT_LINES.length && (
                <div className={styles.line} style={{ animationDelay: `${CONTACT_LINES.length * 0.1}s` }}>
                  <span className={styles.prompt}>&gt;$</span>
                  <span className={styles.cursor} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SplashWrapper>
  );
}
