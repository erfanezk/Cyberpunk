import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Glitch,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, GlitchMode } from 'postprocessing';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { EffectsProps } from './effects.types';

export function Effects({ scroll }: EffectsProps) {
  const glitchRef = useRef<any>(null);
  const lastZone = useRef(0);

  const chromaticOffset = useMemo(() => new THREE.Vector2(0.002, 0.002), []);
  const glitchDelay = useMemo(() => new THREE.Vector2(999999, 999999), []);
  const glitchDuration = useMemo(() => new THREE.Vector2(0.2, 0.4), []);
  const glitchStrength = useMemo(() => new THREE.Vector2(0.2, 0.4), []);

  useFrame(() => {
    if (!glitchRef.current || !scroll) return;
    const t = scroll.offset;
    const currentZone = Math.floor(t * 4);
    if (currentZone !== lastZone.current) {
      glitchRef.current.delay = new THREE.Vector2(0, 0);
      glitchRef.current.duration = new THREE.Vector2(0.2, 0.4);
      glitchRef.current.strength = new THREE.Vector2(0.2, 0.4);
      lastZone.current = currentZone;
      setTimeout(() => {
        if (glitchRef.current) {
          glitchRef.current.delay = new THREE.Vector2(999999, 999999);
        }
      }, 400);
    }
  });

  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} mipmapBlur />
      <ChromaticAberration offset={chromaticOffset} blendFunction={BlendFunction.NORMAL} />
      <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={0.3} darkness={0.7} />
      <Glitch
        ref={glitchRef}
        delay={glitchDelay}
        duration={glitchDuration}
        strength={glitchStrength}
        mode={GlitchMode.SPORADIC}
        active
      />
    </EffectComposer>
  );
}
