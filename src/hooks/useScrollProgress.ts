import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export function useScrollProgress(onProgress?: (value: number) => void) {
  const scroll = useScroll();
  const lastValue = useRef(0);

  useFrame(() => {
    const value = scroll.offset;
    if (onProgress && Math.abs(lastValue.current - value) > 0.001) {
      lastValue.current = value;
      onProgress(value);
    }
  });
}
