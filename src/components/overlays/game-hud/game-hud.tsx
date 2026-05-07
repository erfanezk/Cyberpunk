import { useEffect, memo } from 'react';
import { WALK_PATH } from '@/components/world/cyber/cyber.constants';
import { game, type ActionName } from '@/game';
import { ACTIONS, currentDistrict, DISTRICTS } from './game-hud.constants';
import type { OverlayProps } from '@/types';
import styles from './game-hud.module.css';

function GameHud({ progress }: OverlayProps) {
  const pos = WALK_PATH.getPointAt(Math.max(0, Math.min(1, progress)));
  const district = currentDistrict(progress);
  const pct = Math.round(progress * 100);

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
          game.trigger('sit');
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
          {pos.x.toFixed(0).padStart(4, ' ')} Z<span className={styles.sep}>:</span>
          {pos.z.toFixed(0).padStart(5, ' ')}
        </span>
      </div>

      <div className={styles.district}>
        <span className={styles.label}>DISTRICT {district.id} / 05</span>
        <span className={styles.districtName}>{district.label}</span>
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

      <div className={styles.traverse}>
        <span className={styles.label}>TRAVERSE</span>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${pct}%` }} />
          {DISTRICTS.map((d) => (
            <div
              key={d.id}
              className={styles.mark}
              style={{ left: `${Math.max(0, d.fadeIn) * 100}%` }}
            />
          ))}
        </div>
        <span className={styles.pct}>{pct}%</span>
      </div>
    </div>
  );
}

export default memo(GameHud);
