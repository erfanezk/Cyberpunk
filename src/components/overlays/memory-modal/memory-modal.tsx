import { useState, useEffect, useCallback, memo } from 'react';
import { memory, type FragmentId } from '@/game';
import { PROFILE, PROJECTS, ARTICLES, CONTACT } from '@/constants';
import styles from './memory-modal.module.css';

const FRAGMENT_TITLES: Record<FragmentId, string> = {
  bio: 'IDENTITY_RECOVERED',
  skills: 'SKILL_TREE_RESTORED',
  projects: 'MISSION_LOG_DECRYPTED',
  articles: 'INTEL_FEED_RESTORED',
  contact: 'UPLINK_ESTABLISHED',
};

const SKILLS = [
  { label: 'PROB SOLVE', value: 92 },
  { label: 'ADAPTABLE', value: 85 },
  { label: 'CURIOSITY', value: 90 },
  { label: 'OWNERSHIP', value: 88 },
  { label: 'COMMS', value: 78 },
  { label: 'CREATIVITY', value: 83 },
];

function FragmentContent({ fragment }: { fragment: FragmentId }) {
  switch (fragment) {
    case 'bio':
      return (
        <div className={styles.fragBio}>
          <div className={styles.fragName}>{PROFILE.name}</div>
          <div className={styles.fragTitle}>{PROFILE.title}</div>
          <p className={styles.fragText}>{PROFILE.bio}</p>
          <p className={styles.fragTagline}>&ldquo;{PROFILE.tagline}&rdquo;</p>
        </div>
      );
    case 'skills':
      return (
        <div className={styles.fragSkills}>
          {SKILLS.map((s) => (
            <div key={s.label} className={styles.skillRow}>
              <span className={styles.skillLabel}>{s.label}</span>
              <div className={styles.skillBar}>
                <div className={styles.skillFill} style={{ width: `${s.value}%` }} />
              </div>
              <span className={styles.skillVal}>{s.value}</span>
            </div>
          ))}
        </div>
      );
    case 'projects':
      return (
        <div className={styles.fragProjects}>
          {PROJECTS.map((p) => (
            <a
              key={p.id}
              href={p.link}
              target="_blank"
              rel="noreferrer"
              className={styles.projRow}
              style={{ '--c': p.color } as React.CSSProperties}
            >
              <span className={styles.projTitle}>{p.title}</span>
              <span className={styles.projDesc}>{p.description}</span>
            </a>
          ))}
        </div>
      );
    case 'articles':
      return (
        <div className={styles.fragArticles}>
          {ARTICLES.map((a) => (
            <div key={a.id} className={styles.articleRow}>
              <span className={styles.articleTitle}>{a.title}</span>
              <span className={styles.articleDate}>{a.date}</span>
              <p className={styles.articleDesc}>{a.description}</p>
              <div className={styles.articleTags}>
                {a.tags.map((t) => (
                  <span key={t} className={styles.tag}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    case 'contact':
      return (
        <div className={styles.fragContact}>
          <a href={`mailto:${CONTACT.email}`} className={styles.contactRow}>
            EMAIL › {CONTACT.email}
          </a>
          <a href={CONTACT.github} target="_blank" rel="noreferrer" className={styles.contactRow}>
            GITHUB › {CONTACT.github}
          </a>
          <a href={CONTACT.linkedin} target="_blank" rel="noreferrer" className={styles.contactRow}>
            LINKEDIN › {CONTACT.linkedin}
          </a>
        </div>
      );
  }
}

function MemoryModal() {
  const [active, setActive] = useState<FragmentId | null>(null);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    return memory.subscribe((id) => {
      const isAll = memory.isAllUnlocked();
      setTimeout(() => {
        setHiding(false);
        setActive(id);
        if (isAll) {
          setTimeout(() => {
            setHiding(true);
            setTimeout(() => setActive(null), 500);
          }, 2200);
        }
      }, 900);
    });
  }, []);

  const dismiss = useCallback(() => {
    setHiding(true);
    setTimeout(() => setActive(null), 500);
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, dismiss]);

  if (!active) return null;

  return (
    <div
      className={`${styles.overlay} ${hiding ? styles.hiding : ''}`}
      onClick={dismiss}
      onKeyDown={(e) => { if (e.key === 'Escape') dismiss(); }}
      role="presentation"
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.header}>
          <span className={styles.tag}>// MEMORY_RECOVERED</span>
          <span className={styles.title}>{FRAGMENT_TITLES[active]}</span>
          <button type="button" className={styles.close} onClick={dismiss}>
            ✕
          </button>
        </div>
        <div className={styles.body}>
          <FragmentContent fragment={active} />
        </div>
        <div className={styles.footer}>
          <span className={styles.hint}>[ESC] or click outside to close</span>
        </div>
      </div>
    </div>
  );
}

export default memo(MemoryModal);
