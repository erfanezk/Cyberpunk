import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Glitch,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, GlitchMode, type GlitchEffect } from 'postprocessing';
import { useRef, memo, type ReactElement } from 'react';
import * as THREE from 'three';
import type { EffectsProps } from './effects.types';
import { WORLD_CONFIG } from '@/game';
import {
  CHROMATIC_OFFSET,
  DISABLED_GLITCH,
  GLITCH_DURATION,
  GLITCH_STRENGTH,
} from './effects.constants';

function Effects({ scroll }: EffectsProps) {
  const glitchRef = useRef<GlitchEffect>(null);
  const lastZone = useRef(0);

  useFrame(() => {
    if (!glitchRef.current || !scroll || !WORLD_CONFIG.glitch) return;
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

  const effects: ReactElement[] = [
    <Bloom
      key="bloom"
      luminanceThreshold={WORLD_CONFIG.bloomLuminanceThreshold}
      luminanceSmoothing={0.9}
      intensity={WORLD_CONFIG.bloomIntensity}
      {...(WORLD_CONFIG.bloomMipmapBlur ? { mipmapBlur: true } : {})}
    />,
  ];

  if (WORLD_CONFIG.chromaticAberration) {
    effects.push(
      <ChromaticAberration
        key="ca"
        offset={CHROMATIC_OFFSET}
        blendFunction={BlendFunction.NORMAL}
      />,
    );
  }

  if (WORLD_CONFIG.noiseOverlay) {
    effects.push(<Noise key="noise" opacity={0.05} blendFunction={BlendFunction.OVERLAY} />);
  }

  effects.push(<Vignette key="vignette" offset={0.3} darkness={0.7} />);

  if (WORLD_CONFIG.glitch) {
    effects.push(
      <Glitch
        key="glitch"
        ref={glitchRef}
        delay={DISABLED_GLITCH}
        duration={GLITCH_DURATION}
        strength={GLITCH_STRENGTH}
        mode={GlitchMode.SPORADIC}
        active
      />,
    );
  }

  return <EffectComposer>{effects}</EffectComposer>;
}

export default memo(Effects);
