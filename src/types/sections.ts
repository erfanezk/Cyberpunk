export interface Zone {
  fadeIn: number;
  fadeOut: number;
}

export const SECTION_ZONES: Record<string, Zone> = {
  hero: { fadeIn: -0.05, fadeOut: 0.2 },
  about: { fadeIn: 0.2, fadeOut: 0.45 },
  projects: { fadeIn: 0.45, fadeOut: 0.7 },
  contact: { fadeIn: 0.7, fadeOut: 1 },
};
