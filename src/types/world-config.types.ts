export type QualityTier = 'low' | 'medium' | 'high';

export interface WorldConfig {
  tier: QualityTier;

  // Particles
  rainCount: number;
  particleCount: number;
  dataStreamCount: number;

  // Scene objects
  droneCount: number;
  floatingShapeCount: number;
  neonTowerCount: number;
  billboardCount: number;

  // Canvas
  dprMin: number;
  dprMax: number;
  antialias: boolean;

  // Lighting
  extraPointLights: number; // 0 | 2 | 4 — appended to the 2 always-on scene lights
  droneLights: boolean; // pointLight under each drone mesh

  // Post-processing
  bloomIntensity: number;
  bloomLuminanceThreshold: number;
  bloomMipmapBlur: boolean;
  chromaticAberration: boolean;
  noiseOverlay: boolean;
  glitch: boolean;

  // NPC scale (0.0–1.0 multiplier applied per group)
  npcScale: number;
}
