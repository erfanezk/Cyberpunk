import type { ActionName } from '@/game';

export const ACTIONS = Object.freeze([
  { id: 'jump' as ActionName, label: 'JUMP', key: 'SPC' },
  { id: 'punch' as ActionName, label: 'PUNCH', key: 'F' },
  { id: 'crouch' as ActionName, label: 'CROUCH', key: 'C' },
  { id: 'roll' as ActionName, label: 'ROLL', key: 'B' },
]);
