import { useState, memo } from 'react';
import { PROFILE } from '@/constants';
import styles from './start-overlay.module.css';

const STATS = [
  { label: 'PROBLEM SOLVING', pct: 92, color: '#00fff5' },
  { label: 'COMMUNICATION', pct: 78, color: '#ff00ff' },
  { label: 'ADAPTABILITY', pct: 85, color: '#ff9900' },
  { label: 'ATTENTION TO DETAIL', pct: 88, color: '#00ff88' },
];

interface StartOverlayProps {
  onStart: () => void;
}

function StartOverlay({ onStart }: StartOverlayProps) {
  const [hiding, setHiding] = useState(false);

  const handleStart = () => {
    setHiding(true);
    setTimeout(onStart, 580);
  };

  return (
    <div className={`${styles.overlay} ${hiding ? styles.hiding : ''}`}>
      <div className={styles.scanBeam} />
      <span className={`${styles.corner} ${styles.tl}`} />
      <span className={`${styles.corner} ${styles.tr}`} />
      <span className={`${styles.corner} ${styles.bl}`} />
      <span className={`${styles.corner} ${styles.br}`} />

      <div className={styles.content}>
        <div className={styles.wrapper}>
          <div className={styles.sectionHeader}>
            <span className={styles.missionTag}>MISSION_01</span>
            <span className={styles.sectionTitle}>// IDENTITY_SCAN</span>
            <span className={styles.clearanceTag}>CLEARANCE: LV4</span>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTopBar}>
              <div className={styles.macDots}>
                <span className={styles.dot} style={{ background: '#ff5f57' }} />
                <span className={styles.dot} style={{ background: '#febc2e' }} />
                <span className={styles.dot} style={{ background: '#28c840' }} />
              </div>
              <span className={styles.fileLabel}>dossier_classified.sys</span>
              <span className={styles.statusBadge}>
                <span className={styles.statusPulse} />
                ACTIVE
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
                  <div className={styles.photoScanBeam} aria-hidden />
                  <div className={styles.photoScanline} aria-hidden />
                  <div className={styles.targetRing} aria-hidden />
                </div>
                <div className={styles.identityMeta}>
                  <span className={styles.metaLabel}>// SUBJECT</span>
                  <h3 className={styles.identityName}>{PROFILE.name}</h3>
                  <span className={styles.role}>{PROFILE.title}</span>
                  <div className={styles.lvlBadge}>
                    <span className={styles.lvlLabel}>LVL</span>
                    <span className={styles.lvlVal}>04</span>
                    <span className={styles.lvlClass}>ENGINEER</span>
                  </div>
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.cardContent}>
                <div className={styles.bioBlock}>
                  <span className={styles.sectionLabel}>// BIO</span>
                  <p className={styles.bio}>{PROFILE.bio}</p>
                  <p className={styles.tagline}>&ldquo;{PROFILE.tagline}&rdquo;</p>
                </div>

                <div className={styles.statsBlock}>
                  <span className={styles.sectionLabel}>// ATTRIBUTES</span>
                  {STATS.map((s) => (
                    <div key={s.label} className={styles.statRow}>
                      <span className={styles.statLabel}>{s.label}</span>
                      <div className={styles.statTrack}>
                        <div
                          className={styles.statFill}
                          style={{ '--pct': `${s.pct}%`, '--col': s.color } as React.CSSProperties}
                        />
                      </div>
                      <span className={styles.statVal} style={{ color: s.color }}>
                        {s.pct}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.cardFooter}>
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
                <span className={styles.kvArrow}> &gt; </span>
                <span style={{ color: '#28c840' }}>AVAILABLE</span>
              </span>
            </div>
          </div>
        </div>

        <button type="button" className={styles.startBtn} onClick={handleStart}>
          Start
        </button>

        <span className={styles.hint}>Click to initialize system</span>
      </div>
    </div>
  );
}

export default memo(StartOverlay);
