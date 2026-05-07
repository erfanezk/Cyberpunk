import * as THREE from 'three';
import { AnimationsName } from '@/constants/animations.constants';
import type { AnimStep, Vec3, NpcGroup, NpcInstance, NpcPath } from '@/types';

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
  const s = Math.random() < 0.5 ? 1 : -1; // random first-bend direction
  const jit = () => (Math.random() - 0.5) * 0.06; // tiny t jitter for variety

  // Three shape templates — all start/end at x=0
  let controls: Ctrl[];
  const r = Math.random();

  if (r < 0.4) {
    // S-curve: peak left then right (or reverse)
    controls = [
      { t: 0, x: 0 },
      { t: 0.28 + jit(), x: s * amp() },
      { t: 0.68 + jit(), x: -s * amp() },
      { t: 1, x: 0 },
    ];
  } else if (r < 0.72) {
    // C-curve: one big arc, stays on one side
    const a = amp();
    controls = [
      { t: 0, x: 0 },
      { t: 0.2 + jit(), x: s * a * 0.55 },
      { t: 0.5 + jit(), x: s * a },
      { t: 0.8 + jit(), x: s * a * 0.55 },
      { t: 1, x: 0 },
    ];
  } else {
    // Z-shape: three committed turns
    controls = [
      { t: 0, x: 0 },
      { t: 0.22 + jit(), x: s * amp() },
      { t: 0.5 + jit(), x: -s * amp() },
      { t: 0.78 + jit(), x: s * amp() * 0.65 },
      { t: 1, x: 0 },
    ];
  }

  // Smoothstep between control points
  const smooth = (t: number) => t * t * (3 - 2 * t);

  const xAt = (t: number): number => {
    for (let i = 0; i < controls.length - 1; i++) {
      const a = controls[i],
        b = controls[i + 1];
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function faceTo(fx: number, fz: number, tx: number, tz: number): number {
  return Math.atan2(tx - fx, tz - fz);
}

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

let _uid = 0;
const nid = (tag: string) => `${tag}-${_uid++}`;

// ── Scene: Crime (shooter + dying victim) ─────────────────────────────────────

function makeCrimeScenes(path: THREE.CatmullRomCurve3, occupied: Circ[]): NpcInstance[] {
  const out: NpcInstance[] = [];

  for (let i = 0; i < 4; i++) {
    const c = tryCandidate(path, occupied, NPC_R + 4);
    if (!c) continue;

    const angle = Math.random() * Math.PI * 2;
    const sx = c.x + Math.cos(angle) * (3 + Math.random());
    const sz = c.z + Math.sin(angle) * (3 + Math.random());
    const shooterRotY = faceTo(sx, sz, c.x, c.z);
    const victimRotY = shooterRotY + Math.PI + (Math.random() - 0.5) * 0.4;

    out.push({
      id: nid('crime-victim'),
      position: [c.x, 0, c.z] as Vec3,
      rotationY: victimRotY,
      animation: AnimationsName.Spell_Simple_Idle_Loop,
      sequence: [
        { animation: AnimationsName.Spell_Simple_Idle_Loop, holdMs: 4000 },
        { animation: AnimationsName.Death01, loopOnce: true },
      ],
      pathOffset: 0,
    });

    out.push({
      id: nid('crime-shooter'),
      position: [sx, 0, sz] as Vec3,
      rotationY: shooterRotY,
      animation: AnimationsName.Pistol_Idle_Loop,
      sequence: [
        { animation: AnimationsName.Pistol_Idle_Loop, holdMs: 2000 },
        { animation: AnimationsName.Pistol_Shoot, loopOnce: true },
        { animation: AnimationsName.Pistol_Reload, loopOnce: true },
        { animation: AnimationsName.Pistol_Shoot, loopOnce: true },
        { animation: AnimationsName.Pistol_Aim_Down },
      ],
      pathOffset: 0,
    });

    occupied.push({ x: c.x, z: c.z, r: NPC_R });
    occupied.push({ x: sx, z: sz, r: NPC_R });
  }

  return out;
}

// ── Scene: Street fight (two NPCs slugging each other) ────────────────────────

function makeStreetFights(path: THREE.CatmullRomCurve3, occupied: Circ[]): NpcInstance[] {
  const out: NpcInstance[] = [];

  for (let i = 0; i < 2; i++) {
    const c = tryCandidate(path, occupied, NPC_R + 3);
    if (!c) continue;

    const angle = Math.random() * Math.PI * 2;
    const gap = 1.8;
    const ax = c.x + Math.cos(angle) * gap;
    const az = c.z + Math.sin(angle) * gap;
    const bx = c.x - Math.cos(angle) * gap;
    const bz = c.z - Math.sin(angle) * gap;

    out.push({
      id: nid('fight-a'),
      position: [ax, 0, az] as Vec3,
      rotationY: faceTo(ax, az, bx, bz),
      animation: AnimationsName.Punch_Jab,
      pathOffset: 0,
    });
    out.push({
      id: nid('fight-b'),
      position: [bx, 0, bz] as Vec3,
      rotationY: faceTo(bx, bz, ax, az),
      animation: AnimationsName.Punch_Cross,
      pathOffset: 0,
    });

    occupied.push({ x: c.x, z: c.z, r: NPC_R + 3 });
  }

  return out;
}

// ── Scene: Social cluster (talking / dancing circle) ─────────────────────────

function makeSocialClusters(path: THREE.CatmullRomCurve3, occupied: Circ[]): NpcInstance[] {
  const out: NpcInstance[] = [];
  const TALK_ANIMS = [
    AnimationsName.Idle_Talking_Loop,
    AnimationsName.Sitting_Talking_Loop,
    AnimationsName.Dance_Loop,
    AnimationsName.Sitting_Idle_Loop,
  ];

  for (let i = 0; i < 3; i++) {
    const c = tryCandidate(path, occupied, NPC_R + 5);
    if (!c) continue;

    const count = 3 + Math.floor(Math.random() * 2); // 3-4 NPCs
    const radius = 2.5 + Math.random() * 1.5;

    for (let j = 0; j < count; j++) {
      const angle = (j / count) * Math.PI * 2;
      const px = c.x + Math.cos(angle) * radius;
      const pz = c.z + Math.sin(angle) * radius;
      out.push({
        id: nid('social'),
        position: [px, 0, pz] as Vec3,
        rotationY: faceTo(px, pz, c.x, c.z), // face center
        animation: pick(TALK_ANIMS),
        pathOffset: 0,
      });
    }

    occupied.push({ x: c.x, z: c.z, r: radius + NPC_R + 1 });
  }

  return out;
}

// ── Scene: Guard post (armed NPCs watching the street) ───────────────────────

function makeGuardPosts(path: THREE.CatmullRomCurve3, occupied: Circ[]): NpcInstance[] {
  const out: NpcInstance[] = [];
  const GUARD_ANIMS = [
    AnimationsName.Pistol_Idle_Loop,
    AnimationsName.Pistol_Reload,
    AnimationsName.Crouch_Idle_Loop,
  ];

  for (let i = 0; i < 3; i++) {
    const c = tryCandidate(path, occupied, NPC_R);
    if (!c) continue;

    // Guard faces inward toward path (c.rotY already points at path)
    out.push({
      id: nid('guard'),
      position: [c.x, 0, c.z] as Vec3,
      rotationY: c.rotY,
      animation: pick(GUARD_ANIMS),
      pathOffset: 0,
    });

    occupied.push({ x: c.x, z: c.z, r: NPC_R });
  }

  return out;
}

// ── Scene: Gang patrol (2-3 NPCs walking the same route) ─────────────────────

function makeGangPatrols(path: THREE.CatmullRomCurve3, occupied: Circ[]): NpcInstance[] {
  const out: NpcInstance[] = [];

  for (let i = 0; i < 3; i++) {
    let placed = false;
    for (let a = 0; a < 30 && !placed; a++) {
      const t1 = 0.02 + Math.random() * 0.86;
      const t2 = Math.min(0.98, t1 + 0.06 + Math.random() * 0.1);
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

      if (!isClear(w1x, w1z, NPC_R, occupied) || !isClear(w2x, w2z, NPC_R, occupied)) continue;

      // 2 gang members walk the same route, staggered
      const gangAnim =
        Math.random() < 0.5 ? AnimationsName.Walk_Loop : AnimationsName.Walk_Formal_Loop;
      const speed = 3 + Math.random() * 2;
      const npcPath: NpcPath = {
        waypoints: [[w1x, 0, w1z] as Vec3, [w2x, 0, w2z] as Vec3],
        speed,
        loop: false,
      };

      for (let m = 0; m < 2; m++) {
        out.push({
          id: nid('gang'),
          position: npcPath.waypoints[0],
          rotationY: 0,
          animation: gangAnim,
          path: npcPath,
          pathOffset: m * 0.5,
        });
      }

      occupied.push({ x: w1x, z: w1z, r: NPC_R });
      occupied.push({ x: w2x, z: w2z, r: NPC_R });
      placed = true;
    }
  }

  return out;
}

// ── Scene: Runner groups (2-3 NPCs sprinting / jogging together) ─────────────

function makeRunners(path: THREE.CatmullRomCurve3, occupied: Circ[]): NpcInstance[] {
  const out: NpcInstance[] = [];

  for (let i = 0; i < 2; i++) {
    let placed = false;
    for (let a = 0; a < 30 && !placed; a++) {
      const t1 = 0.02 + Math.random() * 0.8;
      const t2 = Math.min(0.98, t1 + 0.15 + Math.random() * 0.1);
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

      if (!isClear(w1x, w1z, NPC_R * 2, occupied) || !isClear(w2x, w2z, NPC_R * 2, occupied))
        continue;

      const anim = Math.random() < 0.5 ? AnimationsName.Sprint_Loop : AnimationsName.Jog_Fwd_Loop;
      const speed =
        anim === AnimationsName.Sprint_Loop ? 10 + Math.random() * 4 : 6 + Math.random() * 3;

      const groupSize = 2 + Math.floor(Math.random() * 2); // 2 or 3
      for (let m = 0; m < groupSize; m++) {
        // Spread runners slightly side-by-side (perpendicular) so they don't stack
        const spread = (m - (groupSize - 1) / 2) * 1.8;
        const sx = w1x + perp.x * spread;
        const sz = w1z + perp.z * spread;
        const ex = w2x + perp.x * spread;
        const ez = w2z + perp.z * spread;

        const npcPath: NpcPath = {
          waypoints: [[sx, 0, sz] as Vec3, [ex, 0, ez] as Vec3],
          speed,
          loop: false,
        };

        out.push({
          id: nid('runner'),
          position: npcPath.waypoints[0],
          rotationY: 0,
          animation: anim,
          path: npcPath,
          pathOffset: m * 0.15,
        });
      }

      occupied.push({ x: w1x, z: w1z, r: NPC_R * 2 });
      occupied.push({ x: w2x, z: w2z, r: NPC_R * 2 });
      placed = true;
    }
  }

  return out;
}

// ── Scene: Loners (single NPCs doing something interesting) ──────────────────

function makeLoners(path: THREE.CatmullRomCurve3, occupied: Circ[]): NpcInstance[] {
  const out: NpcInstance[] = [];
  const LONER_ANIMS = [
    AnimationsName.Sitting_Idle_Loop,
    AnimationsName.Spell_Simple_Idle_Loop,
    AnimationsName.Push_Loop,
    AnimationsName.Idle_Loop,
    AnimationsName.Crouch_Idle_Loop,
  ];

  for (let i = 0; i < 6; i++) {
    const c = tryCandidate(path, occupied, NPC_R);
    if (!c) continue;
    out.push({
      id: nid('loner'),
      position: [c.x, 0, c.z] as Vec3,
      rotationY: c.rotY,
      animation: pick(LONER_ANIMS),
      pathOffset: 0,
    });
    occupied.push({ x: c.x, z: c.z, r: NPC_R });
  }

  return out;
}

// ── World assembly ────────────────────────────────────────────────────────────

export function resolveNpcGroups(_groups: NpcGroup[]): NpcInstance[] {
  return [];
}

function generateWorld() {
  const walkPath = makeWalkPath();
  const corridorPairs = makeCorridorPairs(walkPath);

  const occupied: Circ[] = [];
  for (const [l, r] of corridorPairs) {
    occupied.push({ x: l[0], z: l[2], r: TOWER_R });
    occupied.push({ x: r[0], z: r[2], r: TOWER_R });
  }

  const npcInstances: NpcInstance[] = [
    ...makeStreetFights(walkPath, occupied), // 2 × (puncher + puncher)
    ...makeSocialClusters(walkPath, occupied), // 3 × (3-4 talking/dancing circle)
    ...makeGuardPosts(walkPath, occupied), // 3 armed guards facing path
    ...makeGangPatrols(walkPath, occupied), // 3 × 2-man patrol routes
    ...makeRunners(walkPath, occupied), // 2 solo sprinters/joggers
    ...makeLoners(walkPath, occupied), // 6 solo ambient NPCs
    ...makeCrimeScenes(walkPath, occupied), // 2 × (shooter + victim)
  ];

  return { walkPath, corridorPairs, npcGroups: [] as NpcGroup[], npcInstances };
}

const _world = generateWorld();

export const WALK_PATH = _world.walkPath;
export const CORRIDOR_PAIRS = _world.corridorPairs;
export const NPC_GROUPS = _world.npcGroups;
export const NPC_INSTANCES = _world.npcInstances;
