import { useMemo } from 'react';
import { PROJECTS } from '@/constants';
import { SECTION_ZONES } from '@/types';
import type { OverlayProps, Project } from '@/types';
import { smoothstep } from './projects-overlay.utils';
import styles from './projects-overlay.module.css';

export function ProjectsOverlay({ progress }: OverlayProps) {
  const { fadeIn, fadeOut } = SECTION_ZONES.projects;
  const opacity = useMemo(() => {
    const fadeInOp = smoothstep(fadeIn, fadeIn + 0.06, progress);
    const fadeOutOp = 1 - smoothstep(fadeOut - 0.08, fadeOut, progress);
    return fadeInOp * fadeOutOp;
  }, [progress, fadeIn, fadeOut]);

  if (opacity < 0.01) return null;

  return (
    <div className="overlay-layer" style={{ opacity }}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>PROJECTS</h2>
        <div className={styles.grid}>
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
        <span className={styles.scrollHint}>&#8592; SWIPE TO EXPLORE &#8594;</span>
      </div>
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <div className={`glass-panel ${styles.card}`}>
      <div className={styles.cardImageWrapper}>
        <img src={project.image} alt={project.title} className={styles.cardImage} />
        <div className={styles.cardImageOverlay} />
        <span className={styles.cardIndex} style={{ color: project.color }}>
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle} style={{ color: project.color }}>
          {project.title}
        </h3>
        <p className={styles.cardDesc}>{project.description}</p>
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.glowBtn}
        >
          VIEW PROJECT
        </a>
      </div>
    </div>
  );
}
