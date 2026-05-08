export { AnimationsName } from '@/constants';
export { WALK_PATH } from '@/utils/world-gen';

export const JUMP_INITIAL_VY = 9;
export const JUMP_GRAVITY = 24;
export const RUN_SPEED = 25;
export const TURN_SPEED = 2.5;
export const ROLL_SPEED = 10;

export type JumpPhase = 'idle' | 'ascend' | 'loop' | 'land';
