export interface Zone {
  fadeIn: number;
  fadeOut: number;
}

export const SECTION_ZONES: Record<string, Zone> = {
  hero: { fadeIn: -0.05, fadeOut: 0.17 },
  about: { fadeIn: 0.17, fadeOut: 0.34 },
  projects: { fadeIn: 0.34, fadeOut: 0.52 },
  articles: { fadeIn: 0.52, fadeOut: 0.72 },
  contact: { fadeIn: 0.72, fadeOut: 1 },
};
