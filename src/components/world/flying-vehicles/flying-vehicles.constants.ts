import { COLORS } from '@/constants';

export const NEON_COLORS = Object.freeze([
  COLORS.cyan,
  COLORS.magenta,
  COLORS.electricBlue,
  COLORS.amber,
] as const);

export const DRONE_COUNT_MOBILE = 4;
export const DRONE_COUNT_DESKTOP = 10;

export const DRONE_COLORS = NEON_COLORS;
