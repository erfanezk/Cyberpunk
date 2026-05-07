import { Html, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ARTICLES, CONTACT, PROFILE, PROJECTS } from '@/constants';
import { SECTION_ZONES } from '@/types';
import { WALK_PATH } from '@/utils/world-gen';
import styles from './world-panels.module.css';

// ── helpers ───────────────────────────────────────────────────────────────────

function ss(a: number, b: number, t: number) {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

// Camera is 12 units behind character, FOV=72° (half=36°).
// Pure perpendicular offset puts panel at ~90° = outside FOV.
// Combine forward (along path) + perpendicular so panel is ~30° off-center.
const FWD = 14; // units forward along path from character position
const SIDE = 10; // units perpendicular to path

function panelTransform(t: number, side: 1 | -1) {
  const ct = Math.max(0.01, Math.min(0.99, t));
  const pt = WALK_PATH.getPointAt(ct);
  const tan = WALK_PATH.getTangentAt(ct).normalize();
  const perp = new THREE.Vector3(tan.z, 0, -tan.x);

  const px = pt.x + tan.x * FWD + perp.x * SIDE * side;
  const pz = pt.z + tan.z * FWD + perp.z * SIDE * side;

  // Face backward along path so the approaching character sees the panel front
  const ry = Math.atan2(-tan.x, -tan.z);
  return { position: [px, 8, pz] as [number, number, number], rotationY: ry };
}

// ── WorldPanel wrapper ────────────────────────────────────────────────────────

const STATS = [
  { label: 'FRONTEND', pct: 94, color: '#00fff5' },
  { label: 'BACKEND', pct: 40, color: '#ff00ff' },
  { label: 'DEVOPS', pct: 45, color: '#ff9900' },
  { label: 'UX / DESIGN', pct: 76, color: '#00ff88' },
];

const CLASS_LABELS = ['CLASSIFIED', 'RESTRICTED', 'CONFIDENTIAL', 'CLASSIFIED'];

interface PanelProps {
  zoneKey: keyof typeof SECTION_ZONES;
  t: number;
  side: 1 | -1;
  width: number;
  children: React.ReactNode;
}

function WorldPanel({ zoneKey, t, side, width, children }: PanelProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const scroll = useScroll();
  const { position, rotationY } = useMemo(() => panelTransform(t, side), [t, side]);
  const zone = SECTION_ZONES[zoneKey];
  console.log('position', position);

  useFrame(() => {
    if (!wrapRef.current) return;
    const o = scroll.offset;
    const fi = ss(zone.fadeIn, zone.fadeIn + 0.05, o);
    const fo = 1 - ss(zone.fadeOut - 0.06, zone.fadeOut, o);
    const op = fi * fo;
    if (wrapRef.current.style.opacity !== String(op)) {
      wrapRef.current.style.opacity = String(op);
    }
  });

  return (
    <Html
      transform
      position={position}
      rotation={[0, rotationY, 0]}
      distanceFactor={25}
      zIndexRange={[100, 0]}
    >
      {/* opacity unset — useFrame controls it imperatively */}
      <div ref={wrapRef} style={{ width, pointerEvents: 'auto' }}>
        {children}
      </div>
    </Html>
  );
}

// ── Panel header ──────────────────────────────────────────────────────────────

function PanelHeader({ mission, title, tag }: { mission: string; title: string; tag?: string }) {
  return (
    <div className={styles.header}>
      <span className={styles.missionTag}>{mission}</span>
      <span className={styles.sectionTitle}>{title}</span>
      {tag && <span className={styles.headerTag}>{tag}</span>}
    </div>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────

function AboutPanel() {
  return (
    <div className={styles.panel} id="about">
      <span className={`${styles.corner} ${styles.cornerTL}`} />
      <span className={`${styles.corner} ${styles.cornerTR}`} />
      <span className={`${styles.corner} ${styles.cornerBL}`} />
      <span className={`${styles.corner} ${styles.cornerBR}`} />

      <PanelHeader mission="MISSION_01" title="// IDENTITY_SCAN" tag="CLEARANCE: LV4" />

      <div className={styles.aboutBody}>
        <div className={styles.photoWrap}>
          <img src={PROFILE.photo} alt={PROFILE.name} className={styles.photo} />
          <div className={styles.photoScan} />
        </div>
        <div className={styles.aboutInfo}>
          <div>
            <div className={styles.label}>// SUBJECT</div>
            <div className={styles.name}>{PROFILE.name}</div>
            <div className={styles.role}>{PROFILE.title}</div>
          </div>
          <p className={styles.bio}>{PROFILE.bio}</p>
        </div>
      </div>

      <div className={styles.statsBlock}>
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
  );
}

// ── Projects ──────────────────────────────────────────────────────────────────

function ProjectsPanel() {
  return (
    <div className={styles.panel}>
      <span className={`${styles.corner} ${styles.cornerTL}`} />
      <span className={`${styles.corner} ${styles.cornerTR}`} />
      <span className={`${styles.corner} ${styles.cornerBL}`} />
      <span className={`${styles.corner} ${styles.cornerBR}`} />

      <PanelHeader
        mission="MISSION_02"
        title="// ARCHIVE_VAULT"
        tag={`${PROJECTS.length}_ENTRIES`}
      />

      <div className={styles.projectsGrid}>
        {PROJECTS.slice(0, 4).map((project, i) => (
          <div key={project.id} className={styles.projectCard}>
            <img src={project.image} alt={project.title} className={styles.projectImg} />
            <div className={styles.projectMeta}>
              <span className={styles.projectIdx} style={{ color: project.color }}>
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <div className={styles.projectTitle}>{project.title}</div>
            <p className={styles.projectDesc}>{project.description}</p>
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.projectLink}
              style={{ '--btn-color': project.color } as React.CSSProperties}
            >
              ACCESS &#x2192;
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Articles ──────────────────────────────────────────────────────────────────

function ArticlesPanel() {
  return (
    <div className={styles.panel}>
      <span className={`${styles.corner} ${styles.cornerTL}`} />
      <span className={`${styles.corner} ${styles.cornerTR}`} />
      <span className={`${styles.corner} ${styles.cornerBL}`} />
      <span className={`${styles.corner} ${styles.cornerBR}`} />

      <PanelHeader mission="MISSION_03" title="// INTEL_NET" tag="FREQ: 435.6 MHz" />

      <div className={styles.articlesList}>
        {ARTICLES.map((article, i) => (
          <a
            key={article.id}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.articleRow}
          >
            <div className={styles.articleMeta}>
              <span className={styles.articlePkt}>PKT-{String(i + 1).padStart(3, '0')}</span>
              <span className={styles.articleDate}>{article.date}</span>
              <span className={styles.articleClass}>[{CLASS_LABELS[i % CLASS_LABELS.length]}]</span>
            </div>
            <div className={styles.articleTitle}>{article.title}</div>
            <p className={styles.articleDesc}>{article.description}</p>
            <div className={styles.articleTags}>
              {article.tags.slice(0, 4).map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Contact ───────────────────────────────────────────────────────────────────

function ContactPanel() {
  return (
    <div className={styles.panel}>
      <span className={`${styles.corner} ${styles.cornerTL}`} />
      <span className={`${styles.corner} ${styles.cornerTR}`} />
      <span className={`${styles.corner} ${styles.cornerBL}`} />
      <span className={`${styles.corner} ${styles.cornerBR}`} />

      <PanelHeader mission="MISSION_04" title="// COMM_TOWER" />

      <div className={styles.contactBody}>
        <div className={styles.termLine}>
          <span className={styles.prompt}>&gt;$</span>
          <span className={styles.termLabel}>email:</span>
          <a href={`mailto:${CONTACT.email}`} className={styles.termValue}>
            {CONTACT.email}
          </a>
        </div>
        <div className={styles.termLine}>
          <span className={styles.prompt}>&gt;$</span>
          <span className={styles.termLabel}>github:</span>
          <a
            href={CONTACT.github}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.termValue}
          >
            {CONTACT.github.replace('https://', '')}
          </a>
        </div>
        <div className={styles.termLine}>
          <span className={styles.prompt}>&gt;$</span>
          <span className={styles.termLabel}>linkedin:</span>
          <a
            href={CONTACT.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.termValue}
          >
            {CONTACT.linkedin.replace('https://www.', '')}
          </a>
        </div>
        <div className={styles.termLine}>
          <span className={styles.prompt}>&gt;$</span>
          <span className={styles.cursor} />
        </div>

        <div className={styles.contactFooter}>
          <span>
            <span className={styles.footerKey}>PING</span> 42ms
          </span>
          <span>
            <span className={styles.footerKey}>ENC</span> AES-256
          </span>
          <span style={{ color: '#28c840' }}>SECURE_CHANNEL</span>
        </div>
      </div>
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export function WorldPanels() {
  return (
    <>
      <WorldPanel zoneKey="about" t={1} side={-1} width={500}>
        <AboutPanel />
      </WorldPanel>

      <WorldPanel zoneKey="projects" t={0.43} side={1} width={660}>
        <ProjectsPanel />
      </WorldPanel>

      <WorldPanel zoneKey="articles" t={0.62} side={-1} width={560}>
        <ArticlesPanel />
      </WorldPanel>

      <WorldPanel zoneKey="contact" t={0.78} side={1} width={420}>
        <ContactPanel />
      </WorldPanel>
    </>
  );
}
