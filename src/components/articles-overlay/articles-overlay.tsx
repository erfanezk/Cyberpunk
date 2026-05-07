import { useMemo } from 'react';
import { ARTICLES } from '@/constants';
import { SECTION_ZONES } from '@/types';
import type { OverlayProps } from '@/types';
import type { Article } from '@/types';
import { smoothstep } from './articles-overlay.utils';
import styles from './articles-overlay.module.css';
import { SplashWrapper } from '@/components/splash-wrapper';

const SIGNAL_LEVELS = [5, 4, 5, 3, 4];
const CLASS_LABELS = ['CLASSIFIED', 'RESTRICTED', 'CONFIDENTIAL', 'CLASSIFIED'];

function SignalBars({ level }: { level: number }) {
  return (
    <div className={styles.signal} title={`SIGNAL: ${level}/5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={styles.signalBar}
          style={{ opacity: n <= level ? 1 : 0.18, height: `${6 + n * 2}px` }}
        />
      ))}
    </div>
  );
}

export function ArticlesOverlay({ progress }: OverlayProps) {
  const { fadeIn, fadeOut } = SECTION_ZONES.articles;
  const opacity = useMemo(() => {
    const fadeInOp = smoothstep(fadeIn, fadeIn + 0.06, progress);
    const fadeOutOp = 1 - smoothstep(fadeOut - 0.08, fadeOut, progress);
    return fadeInOp * fadeOutOp;
  }, [progress, fadeIn, fadeOut]);

  if (opacity < 0.01) return null;

  return (
    <SplashWrapper
      progress={progress}
      fadeIn={SECTION_ZONES.articles.fadeIn}
      color="rgba(255,200,0,0.15)"
    >
      <div className="overlay-layer" style={{ opacity }}>
        <div className={styles.wrapper}>
          <div className={styles.sectionHeader}>
            <span className={styles.missionTag}>MISSION_03</span>
            <span className={styles.sectionTitle}>// INTEL_NET</span>
            <span className={styles.freqTag}>FREQ: 435.6 MHz</span>
          </div>

          <div className={styles.list}>
            {ARTICLES.map((article, i) => (
              <ArticleCard
                key={article.id}
                article={article}
                index={i}
                signal={SIGNAL_LEVELS[i % SIGNAL_LEVELS.length]}
                classification={CLASS_LABELS[i % CLASS_LABELS.length]}
              />
            ))}
          </div>
        </div>
      </div>
    </SplashWrapper>
  );
}

function ArticleCard({
  article,
  index,
  signal,
  classification,
}: {
  article: Article;
  index: number;
  signal: number;
  classification: string;
}) {
  const packetId = `PKT-${String(index + 1).padStart(3, '0')}`;

  return (
    <a href={article.link} target="_blank" rel="noopener noreferrer" className={styles.article}>
      <div className={styles.articleCornerTR} />

      <div className={styles.articleTopRow}>
        <span className={styles.packetId}>{packetId}</span>
        <span className={styles.classBadge}>[{classification}]</span>
        <span className={styles.articleDate}>{article.date}</span>
        <SignalBars level={signal} />
      </div>

      <div className={styles.articleHeader}>
        <span className={styles.interceptLabel}>INTERCEPTED&nbsp;▶</span>
        <span className={styles.articleTitle}>{article.title}</span>
      </div>

      <p className={styles.articleDesc}>{article.description}</p>

      <div className={styles.articleBottom}>
        <div className={styles.articleTags}>
          {article.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        <span className={styles.readLink}>READ_REPORT&nbsp;&#x2192;</span>
      </div>
    </a>
  );
}
