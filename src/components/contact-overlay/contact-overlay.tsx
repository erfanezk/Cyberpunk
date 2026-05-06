import { useEffect, useMemo, useState } from 'react';
import { CONTACT } from '@/constants';
import { SECTION_ZONES } from '@/types';
import type { OverlayProps } from '@/types';
import type { TerminalLine } from './contact-overlay.types';
import { smoothstep } from './contact-overlay.utils';
import { generateId } from '@/utils';
import styles from './contact-overlay.module.css';

const TERMINAL_LINES: TerminalLine[] = [
  { text: '> CONTACT.exe', delay: 0, id: generateId() },
  { text: '> ──────────────────────────────', delay: 200, id: generateId() },
  {
    text: `> email: ${CONTACT.email}`,
    delay: 400,
    link: `mailto:${CONTACT.email}`,
    id: generateId(),
  },
  {
    text: `> github: ${CONTACT.github}`,
    delay: 600,
    link: `https://${CONTACT.github}`,
    id: generateId(),
  },
  {
    text: `> linkedin: ${CONTACT.linkedin}`,
    delay: 800,
    link: CONTACT.linkedin,
    id: generateId(),
  },
  { text: '> ──────────────────────────────', delay: 1200, id: generateId() },

  { text: '> _', delay: 1400, id: generateId() },
];

export function ContactOverlay({ progress }: OverlayProps) {
  const { fadeIn, fadeOut } = SECTION_ZONES.contact;
  const opacity = useMemo(() => {
    const fadeInOp = smoothstep(fadeIn, fadeIn + 0.06, progress);
    const fadeOutOp = 1 - smoothstep(fadeOut - 0.03, fadeOut + 0.01, progress);
    return fadeInOp * fadeOutOp;
  }, [progress, fadeIn, fadeOut]);

  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    if (opacity > 0.5 && visibleLines === 0) {
      TERMINAL_LINES.forEach((line, i) => {
        setTimeout(() => setVisibleLines(i + 1), line.delay);
      });
    }
    if (opacity < 0.1) {
      setVisibleLines(0);
    }
  }, [opacity, visibleLines]);

  if (opacity < 0.01) return null;

  return (
    <div className="overlay-layer" style={{ opacity }}>
      <div
        className="glass-panel"
        style={{
          padding: 'clamp(1.5rem, 3vw, 2.5rem)',
          maxWidth: '500px',
          width: '90%',
          background: 'rgba(5, 5, 15, 0.85)',
          borderColor: 'rgba(0, 255, 245, 0.3)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
            <div
              key={line.id}
              style={{
                fontSize: 'clamp(0.8rem, 1.2vw, 0.95rem)',
                lineHeight: 2,
                color: i === 0 ? 'var(--cyan)' : 'var(--text)',
              }}
            >
              {line.link ? (
                <>
                  {line.text.split(':')[0]}:{' '}
                  <a
                    href={line.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--cyan)',
                      textDecoration: 'none',
                      borderBottom: '1px solid rgba(0,255,245,0.3)',
                    }}
                  >
                    {line.text.split(':').slice(1).join(':')}
                  </a>
                </>
              ) : (
                line.text
              )}
              {i === visibleLines - 1 && i === TERMINAL_LINES.length - 1 && (
                <span className={styles.cursor} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
