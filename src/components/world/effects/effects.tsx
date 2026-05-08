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
import type { EffectsProps } from './effects.types';
import { WORLD_CONFIG } from '@/game';
import {
  CHROMATIC_OFFSET,
  DISABLED_GLITCH,
  GLITCH_DURATION,
  GLITCH_STRENGTH,
} from './effects.constants';

function Effects(_: EffectsProps) {
  const glitchRef = useRef<GlitchEffect>(null);

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
