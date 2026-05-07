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
import { useRef, memo } from 'react';
import * as THREE from 'three';
import type { EffectsProps } from './effects.types';
import { useIsMobile } from '@/hooks';
import {
  CHROMATIC_OFFSET,
  DISABLED_GLITCH,
  GLITCH_DURATION,
  GLITCH_STRENGTH,
} from './effects.constants';

function Effects({ scroll }: EffectsProps) {
  const isMobile = useIsMobile();
  const glitchRef = useRef<any>(null);
  const lastZone = useRef(0);

  useFrame(() => {
    if (!glitchRef.current || !scroll || isMobile) return;
    const currentZone = Math.floor(scroll.offset * 4);
    if (currentZone !== lastZone.current) {
      // Create fresh Vector2 instances — postprocessing mutates .x/.y in-place
      glitchRef.current.delay = new THREE.Vector2(0, 0);
      glitchRef.current.duration = new THREE.Vector2(0.2, 0.4);
      glitchRef.current.strength = new THREE.Vector2(0.2, 0.4);
      lastZone.current = currentZone;
      setTimeout(() => {
        if (glitchRef.current) glitchRef.current.delay = DISABLED_GLITCH;
      }, 400);
    }
  });

  if (isMobile) {
    return (
      <EffectComposer>
        <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} intensity={0.8} />
        <Vignette offset={0.3} darkness={0.7} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} mipmapBlur />
      <ChromaticAberration offset={CHROMATIC_OFFSET} blendFunction={BlendFunction.NORMAL} />
      <Noise opacity={0.05} blendFunction={BlendFunction.OVERLAY} />
      <Vignette offset={0.3} darkness={0.7} />
      <Glitch
        ref={glitchRef}
        delay={DISABLED_GLITCH}
        duration={GLITCH_DURATION}
        strength={GLITCH_STRENGTH}
        mode={GlitchMode.SPORADIC}
        active
      />
    </EffectComposer>
  );
}

export default memo(Effects);
