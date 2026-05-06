import { useMemo } from 'react';
import { PROJECTS } from '@/constants';
import { SECTION_ZONES } from '@/types';
import type { OverlayProps } from '@/types';
import type { Project } from '@/types';
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
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          padding: '1rem',
          maxWidth: '900px',
        }}
      >
        <h2
          style={{
            width: '100%',
            textAlign: 'center',
            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
            color: 'var(--cyan)',
            letterSpacing: '0.15em',
            marginBottom: '0.5rem',
          }}
        >
          PROJECTS.dat
        </h2>
        {PROJECTS.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        width: 'clamp(180px, 40%, 200px)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '80px',
          borderRadius: '4px',
          marginBottom: '1rem',
          background: `linear-gradient(135deg, ${project.color}22, ${project.color}44)`,
          border: `1px solid ${project.color}55`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          fontWeight: 700,
          color: project.color,
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>
      <h3
        style={{
          fontSize: '0.95rem',
          color: project.color,
          marginBottom: '0.4rem',
          letterSpacing: '0.05em',
        }}
      >
        {project.title}
      </h3>
      <p
        style={{
          fontSize: '0.75rem',
          color: 'var(--text-dim)',
          marginBottom: '1rem',
          lineHeight: 1.5,
        }}
      >
        {project.description}
      </p>
      <a
        href={project.link}
        className={styles.glowBtn}
        style={{ fontSize: '0.75rem', padding: '6px 16px' }}
      >
        View Project
      </a>
    </div>
  );
}
