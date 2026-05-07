import type { AnimationsName } from '@/constants';
import type { Vec3 } from './world.types';

export interface NpcPath {
  waypoints: Vec3[];
  speed: number; // world-units / second
  loop: boolean; // true = cycle | false = ping-pong
}

export type Placement =
  | { kind: 'point'; position: Vec3; rotationY: number }
  | { kind: 'circle'; center: Vec3; radius?: number; count: number }
  | { kind: 'patrol'; path: NpcPath; count?: number };

export interface NpcGroup {
  id: string;
  placement: Placement;
  animation: AnimationsName;
}

export interface AnimStep {
  animation: AnimationsName;
  loopOnce?: boolean; // play once then advance; omit = loop until holdMs
  holdMs?: number;    // for looping steps: advance after this many ms
}

export interface NpcInstance {
  id: string;
  position: Vec3;
  rotationY: number;
  animation: AnimationsName;
  sequence?: AnimStep[]; // if present, plays steps in order ignoring animation/loopOnce
  path?: NpcPath;
  pathOffset: number;
  loopOnce?: boolean;
}
