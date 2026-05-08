import { useMemo, memo } from 'react';
import { PROFILE } from '@/constants';
import { SECTION_ZONES } from '@/types';
import type { OverlayProps } from '@/types';
import { smoothstep } from './character-overlay.utils';
import styles from './character-overlay.module.css';
import SplashWrapper from '@/components/overlays/splash-wrapper';

const SKILLS = [
  { label: 'PROB SOLVE', value: 92 },
  { label: 'ADAPTABLE',  value: 85 },
  { label: 'CURIOSITY',  value: 90 },
  { label: 'OWNERSHIP',  value: 88 },
  { label: 'COMMS',      value: 78 },
  { label: 'CREATIVITY', value: 83 },
];

const MISSIONS = [
  { id: 'M01', label: 'HERO',     desc: 'Enter the sector',     status: 'ACTIVE'  as const },
  { id: 'M02', label: 'IDENTITY', desc: 'Scan the operative',   status: 'LOCKED'  as const },
  { id: 'M03', label: 'PROJECTS', desc: 'Access project vault', status: 'LOCKED'  as const },
  { id: 'M04', label: 'ARTICLES', desc: 'Read intel feed',      status: 'LOCKED'  as const },
  { id: 'M05', label: 'CONTACT',  desc: 'Establish uplink',     status: 'LOCKED'  as const },
];

const ATTRS = [
  { label: 'PWR', value: 88 },
  { label: 'INT', value: 95 },
  { label: 'AGI', value: 82 },
];

const N = SKILLS.length;
const CX = 150;
const CY = 110;
const MAX_R = 58;
const LABEL_R = 82;
const ANGLES = Array.from({ length: N }, (_, i) => -90 + i * 60);

function pt(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function SkillRadar() {
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const dataPath = SKILLS.map((s, i) => {
    const p = pt(ANGLES[i], MAX_R * (s.value / 100));
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 300 220" className={styles.radar} aria-label="Skill radar">
      {ANGLES.map((a) => {
        const o = pt(a, MAX_R);
        return (
          <line key={a} x1={CX} y1={CY} x2={o.x} y2={o.y}
            stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        );
      })}
      {gridLevels.map((lvl) => {
        const pts = ANGLES.map((a) => {
          const p = pt(a, MAX_R * lvl);
          return `${p.x},${p.y}`;
        }).join(' ');
        return (
          <polygon key={lvl} points={pts} fill="none"
            stroke="rgba(255,255,255,0.08)" strokeWidth="0.75" />
        );
      })}
      <polygon points={dataPath} fill="rgba(255,153,0,0.18)"
        stroke="#ff9900" strokeWidth="2" strokeLinejoin="round" />
      {SKILLS.map((s, i) => {
        const p = pt(ANGLES[i], MAX_R * (s.value / 100));
        return <circle key={s.label} cx={p.x} cy={p.y} r="3.5" fill="#ff9900" filter="url(#glow)" />;
      })}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {SKILLS.map((s, i) => {
        const p = pt(ANGLES[i], LABEL_R);
        const anchor = p.x < CX - 8 ? 'end' : p.x > CX + 8 ? 'start' : 'middle';
        const baseY = p.y < CY - 8 ? p.y - 2 : p.y > CY + 8 ? p.y + 2 : p.y;
        return (
          <g key={s.label + '-lbl'}>
            <text x={p.x} y={baseY} textAnchor={anchor} fill="rgba(255,255,255,0.4)"
              fontSize="8.5" letterSpacing="0.8" fontFamily="'Courier New',monospace">
              {s.label}
            </text>
            <text x={p.x} y={baseY + 12} textAnchor={anchor} fill="#ff9900"
              fontSize="11" fontWeight="700" fontFamily="'Courier New',monospace">
              {s.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function CharacterCard() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.sectionHeader}>
        <span className={styles.missionTag}>PLAYER_ONE</span>
        <span className={styles.sectionTitle}>// CHARACTER_FILE</span>
        <span className={styles.classTag}>CLASS: ENGINEER</span>
      </div>

      <div className={styles.card}>
        {/* ── Top bar ── */}
        <div className={styles.cardTopBar}>
          <span className={styles.topBarLeft}>◈ CHAR_FILE_001</span>
          <span className={styles.topBarCenter}>── CHARACTER SELECT ──</span>
          <span className={styles.topBarRight}>
            <span className={styles.statusPulse} />
            SYS_ONLINE
          </span>
        </div>

        <div className={styles.body}>

          {/* ── Col 1: Portrait ── */}
          <div className={styles.portraitCol}>
            <div className={styles.photoFrame}>
              <span className={styles.bracket} data-pos="tl" />
              <span className={styles.bracket} data-pos="tr" />
              <span className={styles.bracket} data-pos="bl" />
              <span className={styles.bracket} data-pos="br" />
              <img src={PROFILE.photo} alt={PROFILE.name} className={styles.photo} />
              <div className={styles.photoGlitch} aria-hidden />
              <div className={styles.scanBeam} aria-hidden />
              <div className={styles.photoScanline} aria-hidden />
              <div className={styles.targetRing} aria-hidden />
              <div className={styles.levelBadge}>
                <span className={styles.levelLabel}>LVL</span>
                <span className={styles.levelNum}>07</span>
              </div>
            </div>

            <div className={styles.identityMeta}>
              <span className={styles.playerTag}>// OPERATOR</span>
              <h3 className={styles.name}>{PROFILE.name}</h3>
              <span className={styles.classBadge}>{PROFILE.title}</span>
              <span className={styles.rankBadge}>◈ SENIOR OPERATIVE</span>
            </div>

            <div className={styles.xpSection}>
              <div className={styles.xpLabelRow}>
                <span className={styles.xpKey}>EXP</span>
                <span className={styles.xpVal}>6 YRS</span>
              </div>
              <div className={styles.xpTrack}>
                <div className={styles.xpFill} />
                {[10,20,30,40,50,60,70,80,90].map((pct) => (
                  <span key={pct} className={styles.xpTick} style={{ left: `${pct}%` }} />
                ))}
              </div>
            </div>

            <div className={styles.attrList}>
              {ATTRS.map((a) => (
                <div key={a.label} className={styles.attrRow} style={{ animationDelay: `${0.5 + ATTRS.indexOf(a) * 0.1}s` }}>
                  <span className={styles.attrLabel}>{a.label}</span>
                  <div className={styles.attrTrack}>
                    <div
                      className={styles.attrFill}
                      style={{ '--val': `${a.value}%` } as React.CSSProperties}
                    />
                  </div>
                  <span className={styles.attrVal}>{a.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Col 2: Radar + Origin ── */}
          <div className={styles.infoCol}>
            <div className={styles.radarSection}>
              <span className={styles.sectionLabel}>// SKILL_TREE</span>
              <SkillRadar />
            </div>
            <div className={styles.divider} />
            <div className={styles.originSection}>
              <span className={styles.sectionLabel}>// ORIGIN_STORY</span>
              <span className={styles.transmitLine}>[INCOMING TRANSMISSION — SECTOR: IRAN]</span>
              <p className={styles.bio}>{PROFILE.bio}</p>
              <p className={styles.tagline}>&ldquo;{PROFILE.tagline}&rdquo;</p>
            </div>
          </div>

          {/* ── Col 3: Mission Log ── */}
          <div className={styles.missionCol}>
            <span className={styles.sectionLabel}>// MISSION_LOG</span>
            <div className={styles.missionList}>
              {MISSIONS.map((m, i) => (
                <div
                  key={m.id}
                  className={`${styles.missionEntry} ${m.status === 'ACTIVE' ? styles.missionActive : styles.missionLocked}`}
                  style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                >
                  <div className={styles.missionEntryTop}>
                    <span className={styles.missionId}>{m.id}</span>
                    <span className={styles.missionName}>{m.label}</span>
                    <span className={`${styles.missionDot} ${m.status === 'ACTIVE' ? styles.missionDotActive : ''}`} />
                  </div>
                  <span className={styles.missionDesc}>{m.desc}</span>
                  <span className={`${styles.missionStatusTag} ${m.status === 'ACTIVE' ? styles.missionStatusActive : ''}`}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <span>
            <span className={styles.kvKey}>ORIGIN</span>
            <span className={styles.kvArrow}> › </span>IRAN
          </span>
          <span className={styles.sep}>◈</span>
          <span>
            <span className={styles.kvKey}>FACTION</span>
            <span className={styles.kvArrow}> › </span>OPEN_SOURCE
          </span>
          <span className={styles.sep}>◈</span>
          <span>
            <span className={styles.kvKey}>STATUS</span>
            <span className={styles.kvArrow}> › </span>
            <span style={{ color: '#28c840' }}>AVAILABLE_FOR_HIRE</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function CharacterOverlay({ progress }: OverlayProps) {
  const { fadeIn, fadeOut } = SECTION_ZONES.about;
  const opacity = useMemo(() => {
    const fadeInOp = smoothstep(fadeIn, fadeIn + 0.06, progress);
    const fadeOutOp = 1 - smoothstep(fadeOut - 0.08, fadeOut, progress);
    return fadeInOp * fadeOutOp;
  }, [progress, fadeIn, fadeOut]);

  if (opacity < 0.01) return null;

  return (
    <SplashWrapper
      progress={progress}
      fadeIn={SECTION_ZONES.about.fadeIn}
      color="rgba(168,85,247,0.15)"
    >
      <div className="overlay-layer" style={{ opacity }}>
        <CharacterCard />
      </div>
    </SplashWrapper>
  );
}

export default memo(CharacterOverlay);
