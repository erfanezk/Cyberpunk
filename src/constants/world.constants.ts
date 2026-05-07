import { AnimationsName } from './animations.constants';
import type { Vec3, NpcPath, NpcBehavior, NpcInstance, NpcGroup } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Walk path: z 65→25→0→-22→-52→-85→-112→-130→-148→-172→-200→-222→-242
// Tower pairs and NPC groups live here together so spatial conflicts are obvious.
// ─────────────────────────────────────────────────────────────────────────────

// ── Tower corridor pairs ──────────────────────────────────────────────────────
export const CORRIDOR_PAIRS: Array<[Vec3, Vec3]> = [
  [
    [-20, 0, 50],
    [20, 0, 50],
  ], // entry
  [
    [-20, 0, 22],
    [20, 0, 22],
  ],
  [
    [8, 0, -2],
    [-16, 0, -18],
  ], // left turn
  [
    [4, 0, -20],
    [-54, 0, -12],
  ],
  [
    [-38, 0, -46],
    [-78, 0, -40],
  ], // left alley — NPC safe: z≈-57
  [
    [-38, 0, -68],
    [-80, 0, -60],
  ], //              NPC safe: z≈-78
  [
    [-38, 0, -88],
    [-80, 0, -82],
  ],
  [
    [-22, 0, -110],
    [-62, 0, -118],
  ], // curve
  [
    [6, 0, -130],
    [-28, 0, -138],
  ],
  [
    [28, 0, -145],
    [-8, 0, -152],
  ], // right turn
  [
    [52, 0, -165],
    [18, 0, -174],
  ],
  [
    [52, 0, -182],
    [22, 0, -190],
  ], // right alley — NPC safe: x=36
  [
    [52, 0, -202],
    [22, 0, -210],
  ],
  [
    [36, 0, -220],
    [0, 0, -228],
  ], // exit
];

// ── Generator ─────────────────────────────────────────────────────────────────

function faceInward(cx: number, cz: number, px: number, pz: number): number {
  return Math.atan2(cx - px, cz - pz);
}

export function resolveNpcGroups(groups: NpcGroup[]): NpcInstance[] {
  const defs: NpcInstance[] = [];

  for (const g of groups) {
    switch (g.kind) {
      case 'talk': {
        const r = g.radius ?? 3;
        for (let i = 0; i < g.count; i++) {
          const angle = (i / g.count) * Math.PI * 2;
          const px = g.center[0] + Math.cos(angle) * r;
          const pz = g.center[2] + Math.sin(angle) * r;
          defs.push({
            id: `${g.id}-${i}`,
            position: [px, 0, pz],
            rotationY: faceInward(g.center[0], g.center[2], px, pz),
            pathOffset: 0,
            behavior: { kind: 'group', animation: AnimationsName.Idle_Talking_Loop, groupId: g.id },
          });
        }
        break;
      }

      case 'dance': {
        const r = g.radius ?? 4;
        for (let i = 0; i < g.count; i++) {
          const angle = (i / g.count) * Math.PI * 2;
          const px = g.center[0] + Math.cos(angle) * r;
          const pz = g.center[2] + Math.sin(angle) * r;
          defs.push({
            id: `${g.id}-${i}`,
            position: [px, 0, pz],
            rotationY: angle,
            pathOffset: 0,
            behavior: { kind: 'group', animation: AnimationsName.Dance_Loop, groupId: g.id },
          });
        }
        break;
      }

      case 'fight': {
        const gap = g.gap ?? 6;
        const [cx, , cz] = g.center;
        const pairs: [AnimationsName, number][] = [
          [AnimationsName.Punch_Jab, Math.PI / 2], // faces +x toward partner
          [AnimationsName.Punch_Cross, -Math.PI / 2], // faces -x toward partner
        ];
        pairs.forEach(([anim, rot], i) => {
          defs.push({
            id: `${g.id}-${i === 0 ? 'a' : 'b'}`,
            position: [cx + (i === 0 ? -gap / 2 : gap / 2), 0, cz],
            rotationY: rot,
            pathOffset: 0,
            behavior: { kind: 'group', animation: anim, groupId: g.id },
          });
        });
        break;
      }

      case 'patrol': {
        for (let i = 0; i < g.count; i++) {
          defs.push({
            id: `${g.id}-${i}`,
            position: g.path.waypoints[0],
            rotationY: 0,
            pathOffset: g.count > 1 ? i / g.count : 0,
            behavior: { kind: 'move', animation: g.animation, path: g.path },
          });
        }
        break;
      }

      case 'solo': {
        defs.push({
          id: g.id,
          position: g.position,
          rotationY: g.rotationY,
          pathOffset: 0,
          behavior: { kind: 'idle', animation: g.animation },
        });
        break;
      }
    }
  }

  return defs;
}

// ── Scene NPC groups — edit here ──────────────────────────────────────────────

export const NPC_GROUPS: NpcGroup[] = [
  { kind: 'talk', id: 'entry-talk', center: [-12, 0, 36], count: 2 },
  { kind: 'dance', id: 'alley-dance', center: [-52, 0, -57], count: 3 },
  { kind: 'fight', id: 'alley-fight', center: [33, 0, -188], gap: 4, count: 2 },
  { kind: 'talk', id: 'curve-talk', center: [-35, 0, -122], count: 3, radius: 4 },
  {
    kind: 'patrol',
    id: 'left-walkers',
    count: 2,
    animation: AnimationsName.Walk_Loop,
    path: {
      waypoints: [
        [-48, 0, -50],
        [-48, 0, -85],
      ],
      speed: 4,
      loop: false,
    },
  },
  {
    kind: 'patrol',
    id: 'right-jogger',
    count: 1,
    animation: AnimationsName.Jog_Fwd_Loop,
    path: {
      waypoints: [
        [36, 0, -175],
        [36, 0, -208],
      ],
      speed: 7,
      loop: false,
    },
  },
  {
    kind: 'patrol',
    id: 'entry-walker',
    count: 1,
    animation: AnimationsName.Walk_Loop,
    path: {
      waypoints: [
        [12, 0, 48],
        [12, 0, 10],
        [-5, 0, -5],
        [-20, 0, -15],
      ],
      speed: 3.5,
      loop: true,
    },
  },
  {
    kind: 'solo',
    id: 'solo-spell',
    position: [-48, 0, -95],
    rotationY: 2.0,
    animation: AnimationsName.Spell_Simple_Idle_Loop,
  },
  {
    kind: 'solo',
    id: 'solo-crouch',
    position: [-68, 0, -78],
    rotationY: 1.2,
    animation: AnimationsName.Crouch_Idle_Loop,
  },
  {
    kind: 'solo',
    id: 'solo-pistol',
    position: [10, 0, -215],
    rotationY: 3.0,
    animation: AnimationsName.Pistol_Idle_Loop,
  },
];

export const NPC_INSTANCES: NpcInstance[] = resolveNpcGroups(NPC_GROUPS);
