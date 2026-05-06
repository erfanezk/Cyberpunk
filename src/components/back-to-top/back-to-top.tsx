import styles from './back-to-top.module.css';

interface BackToTopProps {
  progress: number;
  onScrollToTop: () => void;
}

export function BackToTop({ progress, onScrollToTop }: BackToTopProps) {
  if (progress < 0.9) return null;

  return (
    <button type="button" className={styles.backToTop} onClick={onScrollToTop}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <title>Back to top</title>
        <polyline points="18,15 12,9 6,15" />
      </svg>
    </button>
  );
}
