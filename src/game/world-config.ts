import type { QualityTier, WorldConfig } from '@/types';

const TIER_CONFIGS: Record<QualityTier, Omit<WorldConfig, 'tier'>> = {
  low: {
    rainCount: 800,
    particleCount: 400,
    dataStreamCount: 8,
    droneCount: 4,
    floatingShapeCount: 3,
    neonTowerCount: 6,
    billboardCount: 0,
    dprMin: 0.75,
    dprMax: 1.0,
    antialias: false,
    extraPointLights: 0,
    droneLights: false,
    bloomIntensity: 0.8,
    bloomLuminanceThreshold: 0.3,
    bloomMipmapBlur: false,
    chromaticAberration: false,
    noiseOverlay: false,
    glitch: false,
    npcScale: 0.5,
  },
  medium: {
    rainCount: 2000,
    particleCount: 900,
    dataStreamCount: 16,
    droneCount: 7,
    floatingShapeCount: 7,
    neonTowerCount: 8,
    billboardCount: 3,
    dprMin: 0.85,
    dprMax: 1.25,
    antialias: true,
    extraPointLights: 2,
    droneLights: true,
    bloomIntensity: 1.0,
    bloomLuminanceThreshold: 0.2,
    bloomMipmapBlur: true,
    chromaticAberration: false,
    noiseOverlay: false,
    glitch: false,
    npcScale: 0.75,
  },
  high: {
    rainCount: 4000,
    particleCount: 1500,
    dataStreamCount: 28,
    droneCount: 10,
    floatingShapeCount: 12,
    neonTowerCount: 10,
    billboardCount: 5,
    dprMin: 1.0,
    dprMax: 1.5,
    antialias: true,
    extraPointLights: 4,
    droneLights: true,
    bloomIntensity: 1.5,
    bloomLuminanceThreshold: 0.2,
    bloomMipmapBlur: true,
    chromaticAberration: true,
    noiseOverlay: true,
    glitch: true,
    npcScale: 1.0,
  },
};

function detectTier(): QualityTier {
  const mobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
  if (mobile) return 'low';
  const cores = navigator.hardwareConcurrency ?? 8;
  const ram = (navigator as any).deviceMemory ?? 8;
  if (cores <= 4 || ram <= 4) return 'medium';
  return 'high';
}

export const QUALITY_TIER: QualityTier = detectTier();

export const WORLD_CONFIG: WorldConfig = Object.freeze({
  tier: QUALITY_TIER,
  ...TIER_CONFIGS[QUALITY_TIER],
});
console.log('WORLD_CONFIG', QUALITY_TIER);
