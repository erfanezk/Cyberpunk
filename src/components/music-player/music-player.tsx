import { useRef, useState } from 'react';
import musicFile from '@/assets/1-02 Extraction Action.mp3';
import styles from './music-player.module.css';

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <audio ref={audioRef} src={musicFile} loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        className={styles.musicToggle}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <title>play</title>
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <title>stop</title>
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>
    </>
  );
}
