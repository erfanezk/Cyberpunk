export { AnimationsName } from '@/constants';
export { WALK_PATH } from '@/utils/world-gen';

export const JUMP_INITIAL_VY = 9;
export const JUMP_GRAVITY = 22;

export type JumpPhase = 'idle' | 'ascend' | 'loop' | 'land';
