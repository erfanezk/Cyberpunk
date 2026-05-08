import { useState, useEffect, useCallback, memo } from 'react';
import { memory, type FragmentId } from '@/game';
import { PROFILE } from '@/constants';
import styles from './game-complete.module.css';

const FRAGMENTS: { id: FragmentId; label: string }[] = [
  { id: 'bio', label: 'IDENTITY_FILE.dat' },
  { id: 'skills', label: 'SKILL_TREE.dat' },
  { id: 'projects', label: 'PROJECT_VAULT.exe' },
  { id: 'articles', label: 'INTEL_FEED.log' },
  { id: 'contact', label: 'UPLINK_NODE.cfg' },
];

function GameComplete() {
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    return memory.subscribe(() => {
      if (memory.isAllUnlocked()) {
        // brief delay so the last MemoryModal shows first
        setTimeout(() => setVisible(true), 3000);
      }
    });
  }, []);

  const dismiss = useCallback(() => {
    setHiding(true);
    setTimeout(() => setVisible(false), 500);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, dismiss]);

  if (!visible) return null;

  return (
    <div
      className={`${styles.overlay} ${hiding ? styles.hiding : ''}`}
      onClick={dismiss}
      onKeyDown={(e) => { if (e.key === 'Escape') dismiss(); }}
      role="presentation"
    >
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Memory restoration complete"
      >
        <div className={styles.scanBeam} />

        <div className={styles.topBar}>
          <span className={styles.topTag}>◈ MISSION_COMPLETE</span>
          <span className={styles.topStatus}>ALL SHARDS RECOVERED</span>
        </div>

        <div className={styles.titleWrap}>
          <div className={styles.glitchTitle} data-text="MEMORY RESTORED">
            MEMORY RESTORED
          </div>
          <div className={styles.titleSub}>— OPERATIVE IDENTITY RECOVERED —</div>
        </div>

        <div className={styles.separator} />

        <div className={styles.operativeRow}>
          <span className={styles.opKey}>OPERATIVE</span>
          <span className={styles.opVal}>{PROFILE.name}</span>
        </div>
        <div className={styles.operativeRow}>
          <span className={styles.opKey}>DESIGNATION</span>
          <span className={styles.opVal}>{PROFILE.title.toUpperCase()}</span>
        </div>
        <div className={styles.operativeRow}>
          <span className={styles.opKey}>FRAGMENTS</span>
          <span className={styles.opVal} style={{ color: '#28c840' }}>
            5 / 5 RESTORED
          </span>
        </div>

        <div className={styles.separator} />

        <div className={styles.fragmentList}>
          {FRAGMENTS.map((f, i) => (
            <div key={f.id} className={styles.fragmentRow} style={{ animationDelay: `${i * 0.08}s` }}>
              <span className={styles.fragCheck}>✓</span>
              <span className={styles.fragName}>{f.label}</span>
              <span className={styles.fragStatus}>RECOVERED</span>
            </div>
          ))}
        </div>

        <div className={styles.separator} />

        <div className={styles.footer}>
          <button type="button" className={styles.closeBtn} onClick={dismiss}>
            [ CLOSE DOSSIER ]
          </button>
          <span className={styles.hint}>[ESC] or click outside to dismiss</span>
        </div>
      </div>
    </div>
  );
}

export default memo(GameComplete);
