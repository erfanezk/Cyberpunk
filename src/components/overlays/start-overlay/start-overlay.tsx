import { useState, memo } from 'react';
import { PROFILE } from '@/constants';
import styles from './start-overlay.module.css';

interface StartOverlayProps {
  onStart: () => void;
}

const OBJECTIVES = [
  {
    id: 'OBJ-01',
    code: 'IDENTITY_FILE',
    ext: '.dat',
    label: 'ABOUT',
    icon: '◈',
    desc: 'Scan the operative — identity, background, capabilities',
  },
  {
    id: 'OBJ-02',
    code: 'PROJECT_VAULT',
    ext: '.exe',
    label: 'PROJECTS',
    icon: '▣',
    desc: 'Access encrypted work archives — real-world deployments',
  },
  {
    id: 'OBJ-03',
    code: 'INTEL_FEED',
    ext: '.log',
    label: 'ARTICLES',
    icon: '▶',
    desc: 'Decrypt transmission logs — knowledge and insights',
  },
];

function StartOverlay({ onStart }: StartOverlayProps) {
  const [hiding, setHiding] = useState(false);

  const handleStart = () => {
    setHiding(true);
    setTimeout(onStart, 580);
  };

  return (
    <div className={`${styles.overlay} ${hiding ? styles.hiding : ''}`}>
      <div className={styles.scanBeam} />
      <div className={styles.gridBg} />
      <span className={`${styles.corner} ${styles.tl}`} />
      <span className={`${styles.corner} ${styles.tr}`} />
      <span className={`${styles.corner} ${styles.bl}`} />
      <span className={`${styles.corner} ${styles.br}`} />

      <div className={styles.broadcastBanner}>
        <span className={styles.liveDot} />
        <span>LIVE TRANSMISSION</span>
        <span className={styles.bannerSep}>◈</span>
        <span>EMERGENCY BROADCAST ACTIVE</span>
        <span className={styles.bannerSep}>◈</span>
        <span>ENCRYPTION BYPASSED</span>
      </div>

      <div className={styles.content}>
        <div className={styles.topRow}>
          {/* Operative file */}
          <div className={styles.operativeSection}>
            <div className={styles.fileHeader}>
              <span>// OPERATIVE_FILE_001</span>
              <span className={styles.fileStatus}>STATUS: DATA_CORRUPTED</span>
            </div>
            <div className={styles.operativeCard}>
              <div className={styles.photoWrap}>
                <img src={PROFILE.photo} alt="Corrupted operative" className={styles.photo} />
                <div className={styles.photoScanlines} />
                <div className={styles.photoCrt} />
                <div className={styles.photoGlitch1} />
                <div className={styles.photoGlitch2} />
                <div className={styles.photoBeam} />
                <div className={styles.photoLabel}>[FACE RECOGNITION: FAILED]</div>
              </div>

              <div className={styles.identity}>
                <div className={styles.idRow}>
                  <span className={styles.idKey}>DESIGNATION</span>
                  <span className={`${styles.idVal} ${styles.corrupted}`}>[CORRUPTED]</span>
                </div>
                <div className={styles.idRow}>
                  <span className={styles.idKey}>ROLE</span>
                  <span className={`${styles.idVal} ${styles.corrupted}`}>[UNKNOWN]</span>
                </div>
                <div className={styles.idRow}>
                  <span className={styles.idKey}>ORIGIN</span>
                  <span className={styles.idVal}>SECTOR: IRAN</span>
                </div>
                <div className={styles.idRow}>
                  <span className={styles.idKey}>THREAT LEVEL</span>
                  <span className={styles.idVal} style={{ color: '#ff0050' }}>
                    UNCLASSIFIED
                  </span>
                </div>
                <div className={styles.idRow}>
                  <span className={styles.idKey}>DATA INTEGRITY</span>
                  <span className={styles.idVal} style={{ color: '#ff6600' }}>
                    7%
                  </span>
                </div>
                <div className={styles.statGrid}>
                  {(['PWR', 'INT', 'AGI', 'EXP'] as const).map((s) => (
                    <div key={s} className={styles.stat}>
                      <span className={styles.statKey}>{s}</span>
                      <span className={styles.statVal}>??</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mission brief */}
          <div className={styles.briefing}>
            <div className={styles.briefHeader}>
              <span>MISSION_BRIEF.exe</span>
              <span className={styles.briefPriority}>PRIORITY: ALPHA</span>
            </div>
            <div className={styles.briefBody}>
              <p className={styles.briefLine}>
                <span className={styles.prompt}>&gt;</span>
                An operative&apos;s neural signature has been detected across the grid. Their
                identity file is fragmented — scattered through the digital sector.
              </p>
              <p className={styles.briefLine}>
                <span className={styles.prompt}>&gt;</span>
                DIRECTIVE: Traverse the cyberpunk world. Recover their data. Piece together who
                they are.
              </p>
              <p className={styles.briefLine}>
                <span className={styles.prompt}>&gt;</span>
                Three data shards detected in the sector. All encrypted. All recoverable.
              </p>
              <p className={styles.briefLine}>
                <span className={styles.prompt}>&gt;</span>
                WARNING: Full sector traversal required. Begin at grid entry point and scroll to
                recover.
              </p>
            </div>
          </div>
        </div>

        {/* Recovery targets */}
        <div className={styles.objectives}>
          <span className={styles.objHeader}>// RECOVERY_TARGETS — SCROLL TO RETRIEVE</span>
          <div className={styles.objGrid}>
            {OBJECTIVES.map((obj, i) => (
              <div
                key={obj.id}
                className={styles.objCard}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className={styles.objTop}>
                  <span className={styles.objId}>{obj.id}</span>
                  <span className={styles.objIcon}>{obj.icon}</span>
                  <span className={styles.objLock}>LOCKED</span>
                </div>
                <div className={styles.objName}>
                  {obj.code}
                  <span className={styles.objExt}>{obj.ext}</span>
                </div>
                <div className={styles.objLabel}>{obj.label}</div>
                <div className={styles.objDesc}>{obj.desc}</div>
                <div className={styles.objBar}>
                  <div className={styles.objBarFill} />
                </div>
                <div className={styles.objPercent}>0% RECOVERED</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.startBtn} onClick={handleStart}>
            ACCEPT MISSION
          </button>
          <span className={styles.hint}>INITIALIZE GRID TRAVERSAL PROTOCOL</span>
        </div>
      </div>
    </div>
  );
}

export default memo(StartOverlay);
