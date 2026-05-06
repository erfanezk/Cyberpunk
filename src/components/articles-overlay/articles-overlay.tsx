import { useMemo } from 'react';
import { ARTICLES } from '@/constants';
import { SECTION_ZONES } from '@/types';
import type { OverlayProps } from '@/types';
import type { Article } from '@/types';
import { smoothstep } from './articles-overlay.utils';
import styles from './articles-overlay.module.css';

export function ArticlesOverlay({ progress }: OverlayProps) {
  const { fadeIn, fadeOut } = SECTION_ZONES.articles;
  const opacity = useMemo(() => {
    const fadeInOp = smoothstep(fadeIn, fadeIn + 0.06, progress);
    const fadeOutOp = 1 - smoothstep(fadeOut - 0.08, fadeOut, progress);
    return fadeInOp * fadeOutOp;
  }, [progress, fadeIn, fadeOut]);

  if (opacity < 0.01) return null;

  return (
    <div className="overlay-layer" style={{ opacity }}>
      <div className={styles.wrapper}>
        <h2 className={styles.title}>ARTICLES</h2>
        <div className={styles.list}>
          {ARTICLES.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <div className={`glass-panel ${styles.article}`}>
      <div className={styles.articleHeader}>
        <span className={styles.articleTitle}>{article.title}</span>
        <span className={styles.articleDate}>{article.date}</span>
      </div>
      <p className={styles.articleDesc}>{article.description}</p>
      <div className={styles.articleTags}>
        {article.tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
      <span className={styles.articleArrow}>→</span>
    </div>
  );
}
