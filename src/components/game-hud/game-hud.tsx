import { useEffect, useMemo } from 'react';
import { WALK_PATH } from '@/components/cyber/cyber.constants';
import { game, type ActionName } from '@/game';
import { SECTION_ZONES } from '@/types';
import type { OverlayProps } from '@/types';
import styles from './game-hud.module.css';

const ACTIONS: { id: ActionName; label: string; key: string }[] = [
  { id: 'jump', label: 'JUMP', key: 'SPC' },
  { id: 'punch', label: 'PUNCH', key: 'F' },
  { id: 'sit', label: 'SIT', key: 'C' },
  { id: 'leanBack', label: 'LEAN', key: 'B' },
];

const DISTRICTS = [
  { fadeIn: SECTION_ZONES.hero.fadeIn, label: 'SPAWN_ZONE', id: '01' },
  { fadeIn: SECTION_ZONES.about.fadeIn, label: 'IDENTITY_CORE', id: '02' },
  { fadeIn: SECTION_ZONES.projects.fadeIn, label: 'ARCHIVE_VAULT', id: '03' },
  { fadeIn: SECTION_ZONES.articles.fadeIn, label: 'INTEL_NET', id: '04' },
  { fadeIn: SECTION_ZONES.contact.fadeIn, label: 'COMM_TOWER', id: '05' },
];

function currentDistrict(progress: number) {
  let active = DISTRICTS[0];
  for (const d of DISTRICTS) {
    if (progress >= d.fadeIn) active = d;
  }
  return active;
}

export function GameHud({ progress }: OverlayProps) {
  const pos = useMemo(() => {
    const t = Math.max(0, Math.min(1, progress));
    return WALK_PATH.getPointAt(t);
  }, [progress]);

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
          game.trigger('leanBack');
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const district = currentDistrict(progress);
  const pct = Math.round(progress * 100);

  return (
    <div className={styles.hud} aria-hidden="true">
      {/* Screen corners */}
      <span className={`${styles.corner} ${styles.tl}`} />
      <span className={`${styles.corner} ${styles.tr}`} />
      <span className={`${styles.corner} ${styles.bl}`} />
      <span className={`${styles.corner} ${styles.br}`} />

      {/* Top-left — position */}
      <div className={styles.coords}>
        <span className={styles.label}>POS</span>
        <span className={styles.coordValue}>
          X<span className={styles.sep}>:</span>
          {pos.x.toFixed(0).padStart(4, ' ')} Z<span className={styles.sep}>:</span>
          {pos.z.toFixed(0).padStart(5, ' ')}
        </span>
      </div>

      {/* Top-right — district */}
      <div className={styles.district}>
        <span className={styles.label}>DISTRICT {district.id} / 05</span>
        <span className={styles.districtName}>{district.label}</span>
      </div>

      {/* Action buttons */}
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

      {/* Bottom — traverse bar */}
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
