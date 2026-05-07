import { useProgress } from '@react-three/drei';
import { useEffect, useState, memo } from 'react';

function LoadingScreen() {
  const { progress, active } = useProgress();
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!active && progress >= 100) {
      setOpacity(0);
      const t = setTimeout(() => setVisible(false), 700);
      return () => clearTimeout(t);
    }
  }, [active, progress]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#020209',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity,
        transition: 'opacity 0.7s ease',
        gap: '20px',
        pointerEvents: opacity < 0.05 ? 'none' : 'all',
      }}
    >
      <div
        style={{
          color: '#00fff5',
          fontFamily: 'monospace',
          fontSize: '11px',
          letterSpacing: '6px',
          textTransform: 'uppercase',
          opacity: 0.8,
        }}
      >
        Initializing System
      </div>

      <div
        style={{
          width: '180px',
          height: '1px',
          background: '#0d1117',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${progress}%`,
            background: '#00fff5',
            transition: 'width 0.2s ease',
            boxShadow: '0 0 10px #00fff5, 0 0 20px #00fff544',
          }}
        />
      </div>

      <div
        style={{
          color: '#00fff5',
          fontFamily: 'monospace',
          fontSize: '10px',
          opacity: 0.4,
          letterSpacing: '2px',
        }}
      >
        {Math.round(progress)}%
      </div>
    </div>
  );
}

export default memo(LoadingScreen);
