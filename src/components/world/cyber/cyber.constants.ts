export { AnimationsName } from '@/constants';
export { WALK_PATH } from '@/utils/world-gen';

export const CYBER_COLOR_BODY = '#22619b';
export const CYBER_COLOR_JOINTS = '#ffffff';
export const CYBER_ROUGHNESS = 0.25;
export const CYBER_METALNESS = 0.68;

export const JUMP_INITIAL_VY = 10;
export const JUMP_GRAVITY = 20;
export const RUN_SPEED = 24;
export const CROUCH_SPEED = 8;
export const ROLL_SPEED = 23;
export const TURN_SPEED = 2.5;

export type JumpPhase = 'idle' | 'ascend' | 'loop' | 'land';
