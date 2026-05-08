export { AnimationsName } from '@/constants';
export { WALK_PATH } from '@/utils/world-gen';

export const JUMP_INITIAL_VY = 9;
export const JUMP_GRAVITY = 24;
export const RUN_SPEED = 24;
export const CROUCH_SPEED = 8;
export const ROLL_SPEED = 23;
export const TURN_SPEED = 2.5;

export type JumpPhase = 'idle' | 'ascend' | 'loop' | 'land';
