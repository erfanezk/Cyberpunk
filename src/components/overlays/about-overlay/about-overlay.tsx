import { useMemo, memo } from 'react';
import { PROFILE } from '@/constants';
import { SECTION_ZONES } from '@/types';
import type { OverlayProps } from '@/types';
import { smoothstep } from './about-overlay.utils';
import styles from './about-overlay.module.css';
import SplashWrapper from '@/components/overlays/splash-wrapper';

const SKILLS = [
  { label: 'PROB SOLVE', value: 92 },
  { label: 'ADAPTABLE',  value: 85 },
  { label: 'CURIOSITY',  value: 90 },
  { label: 'OWNERSHIP',  value: 88 },
  { label: 'COMMS',      value: 78 },
  { label: 'CREATIVITY', value: 83 },
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
      {ANGLES.map((a, i) => {
        const o = pt(a, MAX_R);
        return (
          <line
            key={a}
            x1={CX}
            y1={CY}
            x2={o.x}
            y2={o.y}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
          />
        );
      })}

      {gridLevels.map((lvl) => {
        const pts = ANGLES.map((a) => {
          const p = pt(a, MAX_R * lvl);
          return `${p.x},${p.y}`;
        }).join(' ');
        return (
          <polygon
            key={lvl}
            points={pts}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.75"
          />
        );
      })}

      <polygon
        points={dataPath}
        fill="rgba(255,153,0,0.18)"
        stroke="#ff9900"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {SKILLS.map((s, i) => {
        const p = pt(ANGLES[i], MAX_R * (s.value / 100));
        return (
          <circle key={s.value} cx={p.x} cy={p.y} r="3.5" fill="#ff9900" filter="url(#glow)" />
        );
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
          <g key={s.value}>
            <text
              x={p.x}
              y={baseY}
              textAnchor={anchor}
              fill="rgba(255,255,255,0.4)"
              fontSize="8.5"
              letterSpacing="0.8"
              fontFamily="'Courier New',monospace"
            >
              {s.label}
            </text>
            <text
              x={p.x}
              y={baseY + 12}
              textAnchor={anchor}
              fill="#ff9900"
              fontSize="11"
              fontWeight="700"
              fontFamily="'Courier New',monospace"
            >
              {s.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function AboutDossierCard() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.sectionHeader}>
        <span className={styles.missionTag}>PLAYER_ONE</span>
        <span className={styles.sectionTitle}>// CHARACTER_FILE</span>
        <span className={styles.classTag}>CLASS: ENGINEER</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTopBar}>
          <div className={styles.macDots}>
            <span className={styles.dot} style={{ background: '#ff5f57' }} />
            <span className={styles.dot} style={{ background: '#febc2e' }} />
            <span className={styles.dot} style={{ background: '#28c840' }} />
          </div>
          <span className={styles.fileLabel}>origin_story.exe</span>
          <span className={styles.statusBadge}>
            <span className={styles.statusPulse} />
            ONLINE
          </span>
        </div>

        <div className={styles.body}>
          {/* ── Left: portrait column ── */}
          <div className={styles.portraitCol}>
            <div className={styles.photoFrame}>
              <span className={styles.bracket} data-pos="tl" />
              <span className={styles.bracket} data-pos="tr" />
              <span className={styles.bracket} data-pos="bl" />
              <span className={styles.bracket} data-pos="br" />
              <img src={PROFILE.photo} alt={PROFILE.name} className={styles.photo} />
              <div className={styles.scanBeam} aria-hidden />
              <div className={styles.photoScanline} aria-hidden />
              <div className={styles.targetRing} aria-hidden />
            </div>
            <div className={styles.identityMeta}>
              <span className={styles.playerTag}>// OPERATOR</span>
              <h3 className={styles.name}>{PROFILE.name}</h3>
              <span className={styles.classBadge}>{PROFILE.title}</span>
              <div className={styles.xpRow}>
                <div className={styles.xpLabel}>
                  <span>EXP</span>
                  <span className={styles.xpVal}>6 YRS</span>
                </div>
                <div className={styles.xpTrack}>
                  <div className={styles.xpFill} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: radar + origin story ── */}
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
        </div>

        <div className={styles.footer}>
          <span>
            <span className={styles.kvKey}>ORIGIN</span>
            <span className={styles.kvArrow}> &gt; </span>IRAN
          </span>
          <span className={styles.sep}>|</span>
          <span>
            <span className={styles.kvKey}>FACTION</span>
            <span className={styles.kvArrow}> &gt; </span>OPEN_SOURCE
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
  );
}

function AboutOverlay({ progress }: OverlayProps) {
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
        <AboutDossierCard />
      </div>
    </SplashWrapper>
  );
}

export default memo(AboutOverlay);
