import { useEffect, useRef, useState, memo } from 'react';
import { game } from '@/game';
import { ACTIONS } from './game-hud.constants';
import styles from './game-hud.module.css';

function GameHud() {
  const [pos, setPos] = useState({ x: 0, z: 0 });
  const posRef = useRef({ x: 0, z: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    const tick = () => {
      const nx = Math.round(game.position.x);
      const nz = Math.round(game.position.z);
      if (nx !== posRef.current.x || nz !== posRef.current.z) {
        posRef.current = { x: nx, z: nz };
        setPos({ x: nx, z: nz });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          game.trigger('jump');
          break;
        case 'KeyF':
          game.trigger('punch');
          break;
        case 'KeyC':
          game.trigger('crouch');
          break;
        case 'KeyB':
          game.trigger('roll');
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={styles.hud} aria-hidden="true">
      <span className={`${styles.corner} ${styles.tl}`} />
      <span className={`${styles.corner} ${styles.tr}`} />
      <span className={`${styles.corner} ${styles.bl}`} />
      <span className={`${styles.corner} ${styles.br}`} />

      <div className={styles.coords}>
        <span className={styles.label}>POS</span>
        <span className={styles.coordValue}>
          X<span className={styles.sep}>:</span>
          {String(pos.x).padStart(4, ' ')} Z<span className={styles.sep}>:</span>
          {String(pos.z).padStart(5, ' ')}
        </span>
      </div>

      <div className={styles.movement}>
        <span className={styles.label}>MOVE</span>
        <div className={styles.moveRow}>
          <span className={`${styles.moveKey} ${styles.empty}`} />
          <span className={styles.moveKey}>W</span>
          <span className={`${styles.moveKey} ${styles.empty}`} />
        </div>
        <div className={styles.moveRow}>
          <span className={styles.moveKey}>A</span>
          <span className={styles.moveKey}>S</span>
          <span className={styles.moveKey}>D</span>
        </div>
      </div>

      <div className={styles.actions}>
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            className={styles.actionBtn}
            onClick={() => game.trigger(a.id)}
          >
            <span className={styles.actionKey}>{a.key}</span>
            <span className={styles.actionLabel}>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(GameHud);
