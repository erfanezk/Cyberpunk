import styles from './mission-brief-card.module.css';

const OBJECTIVES = [
  'SECTOR_01 // HERO',
  'SECTOR_02 // ABOUT',
  'SECTOR_03 // PROJECTS',
  'SECTOR_04 // ARTICLES',
  'SECTOR_05 // CONTACT',
];

const ACTIONS = [
  { key: 'SPC', label: 'JUMP' },
  { key: 'F', label: 'PUNCH' },
  { key: 'C', label: 'CROUCH' },
  { key: 'B', label: 'ROLL' },
];

export function MissionBriefCard() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.sectionHeader}>
        <span className={styles.missionTag}>MISSION_02</span>
        <span className={styles.sectionTitle}>// OPERATOR_MANUAL</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTopBar}>
          <div className={styles.macDots}>
            <span className={styles.dot} style={{ background: '#ff5f57' }} />
            <span className={styles.dot} style={{ background: '#febc2e' }} />
            <span className={styles.dot} style={{ background: '#28c840' }} />
          </div>
          <span className={styles.fileLabel}>mission_briefing.exe</span>
          <span className={styles.classLabel}>CLASSIFIED</span>
        </div>

        <div className={styles.body}>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>// MOVEMENT</span>
            <div className={styles.wasd}>
              <div className={styles.wasdRow}>
                <kbd className={styles.key}>W</kbd>
              </div>
              <div className={styles.wasdRow}>
                <kbd className={styles.key}>A</kbd>
                <kbd className={styles.key}>S</kbd>
                <kbd className={styles.key}>D</kbd>
              </div>
              <div className={styles.wasdHints}>
                <span>FORWARD / BACKWARD</span>
                <span>TURN LEFT / RIGHT</span>
              </div>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <span className={styles.sectionLabel}>// ACTIONS</span>
            <div className={styles.actionGrid}>
              {ACTIONS.map((a) => (
                <div key={a.key} className={styles.actionRow}>
                  <kbd className={`${styles.key} ${styles.keyWide}`}>{a.key}</kbd>
                  <span className={styles.actionLabel}>{a.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <span className={styles.sectionLabel}>// OBJECTIVES</span>
            <ul className={styles.objectives}>
              {OBJECTIVES.map((obj) => (
                <li key={obj} className={styles.objRow}>
                  <span className={styles.objDot} />
                  <span className={styles.objText}>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.footer}>
          <span className={styles.footerText}>EXPLORE ALL SECTORS TO COMPLETE MISSION</span>
        </div>
      </div>
    </div>
  );
}
