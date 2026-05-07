import type { ActionName } from '@/game';
import { SECTION_ZONES } from '@/types';

export const ACTIONS = Object.freeze([
  { id: 'jump' as ActionName, label: 'JUMP', key: 'SPC' },
  { id: 'punch' as ActionName, label: 'PUNCH', key: 'F' },
  { id: 'sit' as ActionName, label: 'SIT', key: 'C' },
  { id: 'roll' as ActionName, label: 'ROLL', key: 'B' },
]);

export const DISTRICTS = Object.freeze([
  { fadeIn: SECTION_ZONES.hero.fadeIn, label: 'SPAWN_ZONE', id: '01' },
  { fadeIn: SECTION_ZONES.about.fadeIn, label: 'IDENTITY_CORE', id: '02' },
  { fadeIn: SECTION_ZONES.projects.fadeIn, label: 'ARCHIVE_VAULT', id: '03' },
  { fadeIn: SECTION_ZONES.articles.fadeIn, label: 'INTEL_NET', id: '04' },
  { fadeIn: SECTION_ZONES.contact.fadeIn, label: 'COMM_TOWER', id: '05' },
]);

export function currentDistrict(progress: number) {
  let active = DISTRICTS[0];
  for (const d of DISTRICTS) {
    if (progress >= d.fadeIn) active = d;
  }
  return active;
}
