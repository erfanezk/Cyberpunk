import type { AnimationsName } from '@/constants';
import type { Vec3 } from './world.types';

export interface NpcPath {
  waypoints: Vec3[];
  speed: number; // world-units / second
  loop: boolean; // true = cycle | false = ping-pong
}

export type NpcBehavior =
  | { kind: 'idle'; animation: AnimationsName }
  | { kind: 'move'; animation: AnimationsName; path: NpcPath }
  | { kind: 'group'; animation: AnimationsName; groupId: string };

export interface NpcInstance {
  id: string;
  position: Vec3;
  rotationY: number;
  pathOffset: number;
  behavior: NpcBehavior;
}

export type NpcGroup =
  | {
      kind: 'talk';
      id: string;
      center: Vec3;
      count: number;
      radius?: number;
    }
  | {
      kind: 'dance';
      id: string;
      center: Vec3;
      count: number;
      radius?: number;
    }
  | {
      kind: 'fight';
      id: string;
      center: Vec3;
      count: 2;
      gap?: number;
    }
  | {
      kind: 'patrol';
      id: string;
      count: number;
      animation: AnimationsName;
      path: NpcPath;
    }
  | {
      kind: 'solo';
      id: string;
      position: Vec3;
      rotationY: number;
      animation: AnimationsName;
    };
