import { useEffect, useMemo, useState, memo } from 'react';
import { CONTACT } from '@/constants';
import { SECTION_ZONES } from '@/types';
import type { OverlayProps } from '@/types';
import { smoothstep } from './contact-overlay.utils';
import styles from './contact-overlay.module.css';
import SplashWrapper from '@/components/overlays/splash-wrapper';

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

function SignalMeter({ bars }: { bars: number }) {
  return (
    <div className={styles.meter}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={styles.meterBar}
          style={{
            height: `${8 + n * 5}px`,
            animationDelay: `${(n - 1) * 0.15}s`,
            opacity: n <= bars ? 1 : 0.12,
          }}
        />
      ))}
    </div>
  );
}

export function ContactOverlay({ progress }: OverlayProps) {
  const { fadeIn, fadeOut } = SECTION_ZONES.contact;
  const opacity = useMemo(() => {
    const fadeInOp = smoothstep(fadeIn, fadeIn + 0.06, progress);
    const fadeOutOp = 1 - smoothstep(fadeOut - 0.03, fadeOut + 0.01, progress);
    return fadeInOp * fadeOutOp;
  }, [progress, fadeIn, fadeOut]);

  const [visibleLines, setVisibleLines] = useState(0);
  const [uplinkBars, setUplinkBars] = useState(0);

  useEffect(() => {
    if (opacity > 0.5 && visibleLines === 0) {
      // Build signal bars first, then reveal lines
      [1, 2, 3, 4, 5].forEach((n) => {
        setTimeout(() => setUplinkBars(n), n * 120);
      });
      CONTACT_LINES.forEach((_, i) => {
        setTimeout(() => setVisibleLines(i + 1), 800 + i * 250);
      });
    }
    if (opacity < 0.1) {
      setVisibleLines(0);
      setUplinkBars(0);
    }
  }, [opacity, visibleLines]);

  if (opacity < 0.01) return null;

  return (
    <SplashWrapper
      progress={progress}
      fadeIn={SECTION_ZONES.contact.fadeIn}
      color="rgba(0,255,150,0.15)"
    >
      <div className="overlay-layer" style={{ opacity }}>
        <div className={styles.wrapper}>
          <div className={styles.sectionHeader}>
            <span className={styles.missionTag}>MISSION_04</span>
            <span className={styles.sectionTitle}>// COMM_TOWER</span>
          </div>

          {/* Uplink status bar */}
          <div className={styles.uplinkRow}>
            <div className={styles.uplinkLabel}>
              <span className={styles.uplinkDot} style={{ opacity: uplinkBars > 0 ? 1 : 0.2 }} />
              {uplinkBars >= 5 ? 'UPLINK_ESTABLISHED' : uplinkBars > 0 ? 'CONNECTING...' : 'IDLE'}
            </div>
            <SignalMeter bars={uplinkBars} />
            <span className={styles.freqLabel}>435.6 MHz</span>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTopBar}>
              <div className={styles.macDots}>
                <span className={styles.dot} style={{ background: '#ff5f57' }} />
                <span className={styles.dot} style={{ background: '#febc2e' }} />
                <span className={styles.dot} style={{ background: '#28c840' }} />
              </div>
              <span className={styles.fileLabel}>comm_terminal_v3</span>
              <span className={styles.encLabel}>ENC: AES-256</span>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.initLine}>
                <span className={styles.prompt}>&gt;$</span>
                <span className={styles.initText}>ESTABLISH_CONNECTION // TRANSMIT</span>
              </div>

              {CONTACT_LINES.slice(0, visibleLines).map((line, i) => (
                <div
                  key={line.id}
                  className={styles.line}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <span className={styles.prompt}>&gt;$</span>
                  <span className={styles.label}>{line.label}:</span>
                  {line.link ? (
                    <a
                      href={line.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.value}
                    >
                      {line.value}
                    </a>
                  ) : (
                    <span className={styles.value}>{line.value}</span>
                  )}
                </div>
              ))}

              {visibleLines >= CONTACT_LINES.length && (
                <div className={styles.line}>
                  <span className={styles.prompt}>&gt;$</span>
                  <span className={styles.cursor} />
                </div>
              )}
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.footerStat}>
                <span className={styles.footerKey}>PING</span>&nbsp;42ms
              </span>
              <span className={styles.footerSep}>|</span>
              <span className={styles.footerStat}>
                <span className={styles.footerKey}>ENCRYPT</span>&nbsp;ON
              </span>
              <span className={styles.footerSep}>|</span>
              <span className={styles.footerStat} style={{ color: '#28c840' }}>
                SECURE_CHANNEL
              </span>
            </div>
          </div>
        </div>
      </div>
    </SplashWrapper>
  );
}

export default memo(ContactOverlay);
