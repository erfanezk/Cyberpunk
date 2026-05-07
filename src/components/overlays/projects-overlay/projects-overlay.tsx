import { useMemo, memo } from 'react';
import { PROJECTS } from '@/constants';
import { SECTION_ZONES } from '@/types';
import type { OverlayProps, Project } from '@/types';
import { smoothstep } from './projects-overlay.utils';
import styles from './projects-overlay.module.css';
import SplashWrapper from '@/components/overlays/splash-wrapper';

const PRIORITY = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const PRIORITY_COL = ['#ff3366', '#ff9900', '#00fff5', '#00ff88'];

function ProjectsOverlay({ progress }: OverlayProps) {
  const { fadeIn, fadeOut } = SECTION_ZONES.projects;
  const opacity = useMemo(() => {
    const fadeInOp = smoothstep(fadeIn, fadeIn + 0.06, progress);
    const fadeOutOp = 1 - smoothstep(fadeOut - 0.08, fadeOut, progress);
    return fadeInOp * fadeOutOp;
  }, [progress, fadeIn, fadeOut]);

  if (opacity < 0.01) return null;

  return (
    <SplashWrapper
      progress={progress}
      fadeIn={SECTION_ZONES.projects.fadeIn}
      color="rgba(255,0,128,0.15)"
    >
      <div className="overlay-layer" style={{ opacity }}>
        <div className={styles.wrapper}>
          <div className={styles.sectionHeader}>
            <span className={styles.missionTag}>MISSION_02</span>
            <span className={styles.sectionTitle}>// ARCHIVE_VAULT</span>
            <span className={styles.countTag}>{PROJECTS.length}_ENTRIES</span>
          </div>

          <div className={styles.grid}>
            {PROJECTS.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>

          <span className={styles.scrollHint}>&#8592;&nbsp;SWIPE TO EXPLORE&nbsp;&#8594;</span>
        </div>
      </div>
    </SplashWrapper>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const pri = PRIORITY[index % PRIORITY.length];
  const priCol = PRIORITY_COL[index % PRIORITY_COL.length];

  return (
    <div className={styles.card}>
      <div className={styles.cardCornerTR} />

      <div className={styles.cardImageWrapper}>
        <img src={project.image} alt={project.title} className={styles.cardImage} />
        <div className={styles.cardImageOverlay} />
        <div className={styles.cardTopMeta}>
          <span className={styles.cardIndex} style={{ color: project.color }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span
            className={styles.priorityBadge}
            style={{ color: priCol, borderColor: `${priCol}55` }}
          >
            &#9650;&nbsp;{pri}
          </span>
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.objectiveLabel}>
          <span className={styles.objPrefix}>OBJ</span>
          <span className={styles.objSep}>::</span>
        </div>
        <h3 className={styles.cardTitle} style={{ color: project.color }}>
          {project.title}
        </h3>
        <p className={styles.cardDesc}>{project.description}</p>

        <div className={styles.cardFooter}>
          <span className={styles.statusBadge}>
            <span
              className={styles.statusDot}
              style={{ background: '#28c840', boxShadow: '0 0 4px #28c840' }}
            />
            DEPLOYED
          </span>
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.accessBtn}
            style={{ '--btn-color': project.color } as React.CSSProperties}
          >
            ACCESS&nbsp;&#x2192;
          </a>
        </div>
      </div>
    </div>
  );
}

export default memo(ProjectsOverlay);
