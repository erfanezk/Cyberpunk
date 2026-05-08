import { useState, memo } from 'react';
import { CharacterCard } from '@/components/overlays/character-overlay';
import styles from './start-overlay.module.css';

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
        <CharacterCard />

        <div className={styles.actions}>
          <button type="button" className={styles.startBtn} onClick={handleStart}>
            Start
          </button>
          <span className={styles.hint}>Click to initialize system</span>
        </div>
      </div>
    </div>
  );
}

export default memo(StartOverlay);
