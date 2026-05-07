import * as THREE from 'three';
import { AnimationsName } from '@/constants/animations.constants';
import type { Vec3, NpcGroup, NpcInstance } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Procedural world layout — runs once at module load.
// Generation order: path → corridor pairs (flanking path) → NPCs (cleared of towers).
// Each page refresh produces a unique but collision-free layout.
// ─────────────────────────────────────────────────────────────────────────────

// ── Walk path ─────────────────────────────────────────────────────────────────

const START_Z = 65;
const END_Z = -242;
const N_WP = 13;

function makeWalkPath(): THREE.CatmullRomCurve3 {
  type Ctrl = { t: number; x: number };

  const amp = () => 28 + Math.random() * 22; // 28–50 units per bend
  const s = Math.random() < 0.5 ? 1 : -1;   // random first-bend direction
  const jit = () => (Math.random() - 0.5) * 0.06; // tiny t jitter for variety

  // Three shape templates — all start/end at x=0
  let controls: Ctrl[];
  const r = Math.random();

  if (r < 0.4) {
    // S-curve: peak left then right (or reverse)
    controls = [
      { t: 0,              x: 0 },
      { t: 0.28 + jit(),   x:  s * amp() },
      { t: 0.68 + jit(),   x: -s * amp() },
      { t: 1,              x: 0 },
    ];
  } else if (r < 0.72) {
    // C-curve: one big arc, stays on one side
    const a = amp();
    controls = [
      { t: 0,              x: 0 },
      { t: 0.2  + jit(),   x: s * a * 0.55 },
      { t: 0.5  + jit(),   x: s * a },
      { t: 0.8  + jit(),   x: s * a * 0.55 },
      { t: 1,              x: 0 },
    ];
  } else {
    // Z-shape: three committed turns
    controls = [
      { t: 0,              x: 0 },
      { t: 0.22 + jit(),   x:  s * amp() },
      { t: 0.5  + jit(),   x: -s * amp() },
      { t: 0.78 + jit(),   x:  s * amp() * 0.65 },
      { t: 1,              x: 0 },
    ];
  }

  // Smoothstep between control points
  const smooth = (t: number) => t * t * (3 - 2 * t);

  const xAt = (t: number): number => {
    for (let i = 0; i < controls.length - 1; i++) {
      const a = controls[i], b = controls[i + 1];
      if (t <= b.t) {
        const lt = (t - a.t) / (b.t - a.t);
        return a.x + (b.x - a.x) * smooth(Math.max(0, Math.min(1, lt)));
      }
    }
    return controls[controls.length - 1].x;
  };

  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < N_WP; i++) {
    const t = i / (N_WP - 1);
    pts.push(new THREE.Vector3(xAt(t), 0, START_Z + (END_Z - START_Z) * t));
  }

  return new THREE.CatmullRomCurve3(pts);
}

// ── Corridor pairs (tower positions flanking path) ────────────────────────────

const N_PAIRS = 14;

function makeCorridorPairs(path: THREE.CatmullRomCurve3): Array<[Vec3, Vec3]> {
  const pairs: Array<[Vec3, Vec3]> = [];

  for (let i = 0; i < N_PAIRS; i++) {
    const t = i / N_PAIRS;
    const pt = path.getPointAt(t);
    const tan = path.getTangentAt(t).normalize();

    // right-hand perpendicular in XZ plane
    const perp = new THREE.Vector3(tan.z, 0, -tan.x);
    const hw = 16 + Math.random() * 8; // half-width 16–24

    pairs.push([
      [+(pt.x - perp.x * hw).toFixed(1), 0, +(pt.z - perp.z * hw).toFixed(1)],
      [+(pt.x + perp.x * hw).toFixed(1), 0, +(pt.z + perp.z * hw).toFixed(1)],
    ]);
  }

  return pairs;
}

// ── Collision helper ──────────────────────────────────────────────────────────

interface Circ {
  x: number;
  z: number;
  r: number;
}

function dist2d(ax: number, az: number, bx: number, bz: number): number {
  return Math.sqrt((ax - bx) ** 2 + (az - bz) ** 2);
}

function isClear(x: number, z: number, r: number, occupied: Circ[]): boolean {
  return occupied.every((o) => dist2d(x, z, o.x, o.z) > o.r + r);
}

// ── NPC animation pools ───────────────────────────────────────────────────────

const POINT_ANIMS: AnimationsName[] = [
  AnimationsName.Idle_Talking_Loop,
  AnimationsName.Fixing_Kneeling,
  AnimationsName.Idle_Torch_Loop,
  AnimationsName.Sword_Idle,
  AnimationsName.Push_Loop,
  AnimationsName.Crouch_Idle_Loop,
  AnimationsName.Spell_Simple_Idle_Loop,
  AnimationsName.Sitting_Idle_Loop,
  AnimationsName.Sitting_Talking_Loop,
  AnimationsName.Pistol_Aim_Neutral,
  AnimationsName.Pistol_Aim_Down,
  AnimationsName.Pistol_Idle_Loop,
  AnimationsName.Pistol_Reload,
  AnimationsName.Punch_Jab,
  AnimationsName.Punch_Cross,
  AnimationsName.Idle_Loop,
];

const PATROL_ANIMS: AnimationsName[] = [
  AnimationsName.Walk_Formal_Loop,
  AnimationsName.Walk_Loop,
  AnimationsName.Crouch_Fwd_Loop,
  AnimationsName.Jog_Fwd_Loop,
  AnimationsName.Sprint_Loop,
];

const CIRCLE_ANIMS: AnimationsName[] = [
  AnimationsName.Idle_Talking_Loop,
  AnimationsName.Dance_Loop,
  AnimationsName.Sitting_Talking_Loop,
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Candidate placement ───────────────────────────────────────────────────────

const PERP_MIN = 8;
const PERP_MAX = 28;
const NPC_R = 4;
const TOWER_R = 9;

function tryCandidate(
  path: THREE.CatmullRomCurve3,
  occupied: Circ[],
  r: number,
): { x: number; z: number; rotY: number } | null {
  for (let a = 0; a < 40; a++) {
    const t = 0.02 + Math.random() * 0.96;
    const pt = path.getPointAt(t);
    const tan = path.getTangentAt(t).normalize();
    const perp = new THREE.Vector3(tan.z, 0, -tan.x);
    const side = Math.random() < 0.5 ? 1 : -1;
    const d = PERP_MIN + Math.random() * (PERP_MAX - PERP_MIN);

    const x = pt.x + perp.x * d * side;
    const z = pt.z + perp.z * d * side;

    if (isClear(x, z, r, occupied)) {
      return { x, z, rotY: Math.atan2(pt.x - x, pt.z - z) };
    }
  }
  return null;
}

// ── NPC groups ────────────────────────────────────────────────────────────────

function makeNpcGroups(
  path: THREE.CatmullRomCurve3,
  corridorPairs: Array<[Vec3, Vec3]>,
): NpcGroup[] {
  const groups: NpcGroup[] = [];
  const occupied: Circ[] = [];
  let uid = 0;
  const nextId = () => `gen-${uid++}`;

  for (const [l, r] of corridorPairs) {
    occupied.push({ x: l[0], z: l[2], r: TOWER_R });
    occupied.push({ x: r[0], z: r[2], r: TOWER_R });
  }

  // circle groups
  for (let i = 0; i < 3; i++) {
    const circR = 3 + Math.random() * 2;
    const count = 3 + Math.floor(Math.random() * 2);
    const c = tryCandidate(path, occupied, circR + NPC_R);
    if (!c) continue;

    groups.push({
      id: nextId(),
      placement: { kind: 'circle', center: [c.x, 0, c.z] as Vec3, count, radius: circR },
      animation: pick(CIRCLE_ANIMS),
    });
    occupied.push({ x: c.x, z: c.z, r: circR + NPC_R + 2 });
  }

  // patrol groups
  for (let i = 0; i < 5; i++) {
    let placed = false;
    for (let a = 0; a < 30 && !placed; a++) {
      const t1 = 0.02 + Math.random() * 0.86;
      const span = 0.05 + Math.random() * 0.1;
      const t2 = Math.min(0.98, t1 + span);

      const p1 = path.getPointAt(t1);
      const p2 = path.getPointAt(t2);
      const tan = path.getTangentAt(t1).normalize();
      const perp = new THREE.Vector3(tan.z, 0, -tan.x);
      const side = Math.random() < 0.5 ? 1 : -1;
      const d = PERP_MIN + Math.random() * (PERP_MAX - PERP_MIN);

      const w1x = p1.x + perp.x * d * side;
      const w1z = p1.z + perp.z * d * side;
      const w2x = p2.x + perp.x * d * side;
      const w2z = p2.z + perp.z * d * side;

      if (isClear(w1x, w1z, NPC_R, occupied) && isClear(w2x, w2z, NPC_R, occupied)) {
        const anim = pick(PATROL_ANIMS);
        const speed =
          anim === AnimationsName.Sprint_Loop ? 10 + Math.random() * 4
          : anim === AnimationsName.Jog_Fwd_Loop ? 6 + Math.random() * 3
          : anim === AnimationsName.Crouch_Fwd_Loop ? 2 + Math.random() * 1.5
          : 3 + Math.random() * 2; // Walk variants

        groups.push({
          id: nextId(),
          placement: {
            kind: 'patrol',
            path: {
              waypoints: [
                [w1x, 0, w1z] as Vec3,
                [w2x, 0, w2z] as Vec3,
              ],
              speed,
              loop: false,
            },
          },
          animation: anim,
        });
        occupied.push({ x: w1x, z: w1z, r: NPC_R });
        occupied.push({ x: w2x, z: w2z, r: NPC_R });
        placed = true;
      }
    }
  }

  // point NPCs
  for (let i = 0; i < 14; i++) {
    const c = tryCandidate(path, occupied, NPC_R);
    if (!c) continue;

    groups.push({
      id: nextId(),
      placement: { kind: 'point', position: [c.x, 0, c.z] as Vec3, rotationY: c.rotY },
      animation: pick(POINT_ANIMS),
    });
    occupied.push({ x: c.x, z: c.z, r: NPC_R });
  }

  return groups;
}

// ── resolveNpcGroups ──────────────────────────────────────────────────────────

function faceInward(cx: number, cz: number, px: number, pz: number): number {
  return Math.atan2(cx - px, cz - pz);
}

export function resolveNpcGroups(groups: NpcGroup[]): NpcInstance[] {
  const instances: NpcInstance[] = [];

  for (const { id, placement, animation } of groups) {
    switch (placement.kind) {
      case 'point':
        instances.push({
          id,
          position: placement.position,
          rotationY: placement.rotationY,
          animation,
          pathOffset: 0,
        });
        break;

      case 'circle': {
        const { center, count, radius = 3 } = placement;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const px = center[0] + Math.cos(angle) * radius;
          const pz = center[2] + Math.sin(angle) * radius;
          instances.push({
            id: `${id}-${i}`,
            position: [px, 0, pz] as Vec3,
            rotationY: faceInward(center[0], center[2], px, pz),
            animation,
            pathOffset: 0,
          });
        }
        break;
      }

      case 'patrol': {
        const { path, count = 1 } = placement;
        for (let i = 0; i < count; i++) {
          instances.push({
            id: count > 1 ? `${id}-${i}` : id,
            position: path.waypoints[0],
            rotationY: 0,
            animation,
            path,
            pathOffset: count > 1 ? i / count : 0,
          });
        }
        break;
      }
    }
  }

  return instances;
}

// ── Single world generation call ──────────────────────────────────────────────

function generateWorld() {
  const walkPath = makeWalkPath();
  const corridorPairs = makeCorridorPairs(walkPath);
  const npcGroups = makeNpcGroups(walkPath, corridorPairs);
  const npcInstances = resolveNpcGroups(npcGroups);
  return { walkPath, corridorPairs, npcGroups, npcInstances };
}

const _world = generateWorld();

export const WALK_PATH = _world.walkPath;
export const CORRIDOR_PAIRS = _world.corridorPairs;
export const NPC_GROUPS = _world.npcGroups;
export const NPC_INSTANCES = _world.npcInstances;
