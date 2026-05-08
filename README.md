<div align="center">

# ERFAN EZKAT — CYBERPUNK PORTFOLIO

### A real-time 3D game engine. Running in your browser tab.

**[🌐 Live Demo → erfanezk.github.io/portfolio](https://erfanezk.github.io/portfolio)**

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-r184-000000?style=flat-square&logo=threedotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)
![WebGL](https://img.shields.io/badge/WebGL-GLSL_Shaders-990000?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)

</div>

---

## What This Is

Not a portfolio page. A **scroll-driven semi-open world** with an embedded game loop — a fully procedurally generated cyberpunk city that rebuilds itself on every page load. The visitor plays as an investigator dispatched to recover a corrupted operative's fragmented identity. Five memory-carrier NPCs are scattered across the sector. Punch them. Watch them fall. Recover the data.

Live NPCs with autonomous pathfinding and scripted scene choreography, a playable character on a parametric spline with physics-based jump simulation, custom GLSL shaders, and a cinematic post-processing pipeline. All of it running at **60fps inside a React app**, with zero game engine dependencies.

No Unity. No Unreal. No canvas 2D. Pure **Three.js + WebGL + math**.

---

## Game Loop

The portfolio content is gated behind an in-world retrieval mechanic:

```
START SCREEN — Mission briefing
  "An operative's identity is fragmented across the sector"
  Three locked objectives: IDENTITY_FILE.dat / PROJECT_VAULT.exe / INTEL_FEED.log

        ↓  ACCEPT MISSION

TRAVERSE THE WORLD
  Scroll to move through the cyberpunk sector
  5 glowing memory-carrier NPCs placed along the walk path

        ↓  PUNCH (F key) memory NPCs in range

FRAGMENT RECOVERED
  NPC plays Death01 animation and collapses
  Point light extinguishes (intensity → 0, no shader recompile)
  900ms delay → MemoryModal surfaces the recovered data
  HUD memory tracker updates (5 colored dots, N/5 count)

        ↓  RECOVER ALL 5 FRAGMENTS

MISSION COMPLETE
  Last modal auto-dismisses
  GameComplete overlay fades in — operative identity fully restored
```

---

## System Architecture

```
Browser scroll offset  t ∈ [0,1]
         │
         ├──► CatmullRomCurve3.getPointAt(t)   →  Camera position in ℝ³
         ├──► updateTransform(group, t)          →  Character world transform
         ├──► advancePath(state, path, delta)    →  NPC position (constant world-speed)
         ├──► smoothstep(t₀, t₁, t)             →  Section overlay opacity
         ├──► EMA(Δoffset/Δframe)                →  Animation crossfade trigger
         └──► scroll-reactive uniforms           →  Particle density, shader FX

Module load
         │
         └──► generateWorld()   →  walk path (random topology) +
                                    corridor tower pairs +
                                    memory NPC placements (path-perpendicular) +
                                    NPC scene instances (collision-checked)
```

One scalar drives the entire runtime. The city layout is decided once at module load — deterministic per session, unique across refreshes.

---

## Memory Fragment System

Five memory-carrier NPCs are placed at fixed parametric positions along the walk path (`t = 0.15, 0.33, 0.5, 0.67, 0.85`). Each is offset perpendicularly from the path spine, alternating sides:

```ts
const perp = new THREE.Vector3(tan.z, 0, -tan.x);  // XZ perpendicular
const side = i % 2 === 0 ? 1 : -1;
// placed MEMORY_NPC_PATH_OFFSET units off the path, facing inward
```

Each carrier holds one fragment:

| NPC ID | Fragment | Light Color |
|---|---|---|
| `memory-bio` | Identity & background | `#00fff5` cyan |
| `memory-skills` | Skill tree | `#ff00ff` magenta |
| `memory-projects` | Project vault | `#0066ff` blue |
| `memory-articles` | Intel feed | `#ff9900` orange |
| `memory-contact` | Uplink node | `#28c840` green |

### Hit Detection

On every punch input, the controller scans `MEMORY_NPCS` using pre-allocated scratch vectors — no allocations in the hot path:

```ts
const _toNpc    = new THREE.Vector2();
const _forward2 = new THREE.Vector2();
const PUNCH_HIT_RANGE_SQ = 36;  // 6 units squared

for (const npc of MEMORY_NPCS) {
  const dx = nx - px, dz = nz - pz;
  if (dx*dx + dz*dz > PUNCH_HIT_RANGE_SQ) continue;
  _toNpc.set(dx, dz).normalize();
  if (_forward2.dot(_toNpc) > 0.5) {   // within ~60° forward arc
    memory.unlock(info.fragment);
    break;
  }
}
```

### Death Animation — No Shader Recompile

When `memory.unlock` fires, the NPC's `dead` state flips. A dedicated `useEffect([dead])` immediately calls `mixer.stopAllAction()` and plays `Death01` as `LoopOnce / clampWhenFinished` — the NPC collapses and holds the final pose.

The point light is **never removed from the scene graph** — only its `intensity` is zeroed. Removing a light changes `NUM_POINT_LIGHTS`, forcing synchronous GLSL recompile across all lit meshes. Zeroing intensity updates a float uniform in ~0μs.

### Memory Singleton

`src/game/memory.ts` — a minimal pub/sub singleton tracking unlock state:

```ts
class Memory {
  unlock(id: FragmentId): void       // idempotent, fires listeners once
  isUnlocked(id: FragmentId): boolean
  isAllUnlocked(): boolean           // gates GameComplete
  subscribe(fn): () => void          // returns unsubscribe
}
```

No React state on the singleton. Subscribers (NPC, MemoryModal, GameHud, GameComplete) react independently via `useState` triggered from the subscription callbacks.

---

## World Generation — Procedural, Collision-Aware, Runs Once

The entire city spawns in `world-gen.ts` at module load time before the first render. Every reload produces a different, valid layout.

### Step 1 — Walk Path Topology

The character's route is a `CatmullRomCurve3` sampled from one of three randomly selected shape templates:

| Template | Geometry |
|---|---|
| **S-curve** (40% prob) | peak left → peak right, amplitude 28–50 units |
| **C-curve** (32% prob) | single arc staying on one side |
| **Z-shape** (28% prob) | three committed turns, three direction reversals |

```ts
const smooth = (t: number) => t * t * (3 - 2 * t);  // Hermite smoothstep between knots

const xAt = (t: number): number => {
  // piecewise interpolation between shape control points
  for (let i = 0; i < controls.length - 1; i++) {
    const a = controls[i], b = controls[i + 1];
    if (t <= b.t) {
      const lt = (t - a.t) / (b.t - a.t);
      return a.x + (b.x - a.x) * smooth(clamp(lt));
    }
  }
};
```

13 waypoints are sampled from this curve across `z ∈ [65, -242]` — a 307-unit corridor. The curve becomes the shared spine everything else references.

### Step 2 — Tower Corridors

14 tower pairs are placed flanking the path. At each sample point `t`, the right-hand perpendicular in XZ is derived from the path tangent:

```ts
const perp = new THREE.Vector3(tan.z, 0, -tan.x);  // 90° rotation in XZ
const hw   = 16 + Math.random() * 8;                // half-width 16–24 units
```

Left tower at `pt - perp * hw`, right tower at `pt + perp * hw`. Both are immediately pushed into an **occupied circle list** with radius 9 — blocking everything that comes after.

### Step 3 — NPC Scene Placement

All NPC scenes are placed sequentially, each attempting up to 40 random candidates per slot and rejecting any that overlap the occupied list:

```ts
function isClear(x, z, r, occupied): boolean {
  return occupied.every(o => dist2d(x, z, o.x, o.z) > o.r + r);
}
```

Scene generators run in priority order — fights and crimes first (largest exclusion zones), loners last (smallest). The occupied list grows after each successful placement, so early scenes automatically push later ones outward.

---

## NPC System — Autonomous Agents, Eight Scene Archetypes

Every NPC is driven by the same loop: `advancePath → samplePath → mixer.update`. But what makes the crowd feel alive is the scene choreography layer on top.

### Path Following — Constant World-Space Speed

Naïve `t += speed * delta` causes NPCs to sprint through short segments and crawl through long ones. Fix: normalize by segment length each frame.

```ts
function advancePath(state: PathState, path: NpcPath, delta: number): void {
  const { from, to } = getSegment(state.t, path);
  const dist = segmentDist(from, to);
  if (dist > 0) state.t += (path.speed * delta) / dist;  // constant world-space speed
}
```

Two traversal modes — **loop** (wraps segment index, used for circular patrols) and **ping-pong** (folds at both ends, used for back-and-forth routes):

```ts
// Loop: t cycles through all n segments including n-1 → 0 wrap
rawT = ((t % n) + n) % n;

// Ping-pong: t oscillates on period 2*(n-1)
const period = 2 * (n - 1);
const wrapped = ((t % period) + period) % period;
rawT = wrapped <= n - 1 ? wrapped : period - wrapped;
backward = wrapped > n - 1;  // flip heading on reverse pass
```

Heading via `Math.atan2` on segment direction. The `backward` flag adds `Math.PI` on the return pass so the NPC always faces their travel direction.

### GPU Memory — One GLB, Many Agents

All NPCs share a single loaded GLB. Each agent clones it via `SkeletonUtils.clone()` — a deep clone that duplicates the skeleton and skin but **does not re-upload geometry or textures to the GPU**. Each clone gets its own `AnimationMixer`. The shared geometry stays in VRAM once.

```ts
const { scene: source, animations: clips } = useGLTF(modelUrl);  // loaded once
const cloned = useMemo(() => skeletonClone(source), [source]);    // cloned per agent
const mixer  = useMemo(() => new THREE.AnimationMixer(cloned), [cloned]);
```

### Animation Sequencer — Timed FSM per Agent

NPCs aren't just looping a single clip. Each supports a `sequence: AnimStep[]` — a scripted timeline of animations with millisecond-precision transitions:

```ts
// Crime scene victim: idle 4 seconds, then play death clip once and hold final pose
sequence: [
  { animation: 'Spell_Simple_Idle_Loop', holdMs: 4000 },
  { animation: 'Death01', loopOnce: true },
]
```

The sequencer chains steps via `setTimeout` and `mixer.addEventListener('finished')`. One-shot clips (`loopOnce: true`) fire the next step when the `AnimationMixer` emits `'finished'`. Looping clips advance after `holdMs` elapsed. Steps chain indefinitely.

### Scene Archetypes

Eight distinct scene types are scattered throughout the world:

| Scene | Agents | Behavior |
|---|---|---|
| **Memory carrier** | 1 glowing NPC | Idles at path-perpendicular position. Collapses (`Death01`) on punch hit. Drops a data fragment. |
| **Crime scene** | Shooter + Victim | Victim idles → dies on timer. Shooter aims → fires twice → reloads → aims down. |
| **Street fight** | 2 combatants | Facing each other, exchanging `Punch_Jab` / `Punch_Cross` in a loop. |
| **Social cluster** | 3–4 NPCs | Circle facing inward. Random mix of talking, dancing, sitting. |
| **Guard post** | 1 armed NPC | Faces the player path. Pistol idle, reload, or crouch. |
| **Gang patrol** | 2 members | Walk a shared waypoint route, staggered 0.5 path offset apart. |
| **Runner group** | 2–3 sprinters | Sprint/jog side by side on parallel routes (spread via `perp * m * 1.8`). |
| **Loner** | 1 ambient NPC | Sitting, crouching, pushing, idle — scattered throughout. |

---

## Player Character — Playable, Physics Simulated, Scroll Driven

The player isn't just visual. The HUD exposes four actions triggered by keyboard or on-screen buttons:

| Key | Action |
|---|---|
| `Space` | Jump |
| `F` | Punch |
| `C` | Crouch / Stand |
| `R` | Roll |

### Jump Physics — Euler Integration

Jump uses explicit Euler integration of ballistic motion each frame — not a pre-baked animation offset:

```ts
const JUMP_INITIAL_VY = 9;   // m/s upward
const JUMP_GRAVITY    = 22;  // m/s²

// Per frame in useFrame:
j.y  += j.vy * delta;
j.vy -= JUMP_GRAVITY * delta;

if (j.y <= 0 && j.vy < 0) {
  j.y = 0; j.vy = 0;
  j.phase = 'land';
  playOneShot('Jump_Land', ...);
}
```

The character lifts off the spline, follows a true parabolic arc, lands exactly when `y` crosses zero on the downswing.

### Animation State Machine

Four phases: `idle → ascend → loop → land`. The `mixer 'finished'` event chains `Jump_Start → Jump_Loop` automatically. An `actionLock` ref prevents competing inputs mid-clip:

```ts
const onFinished = (event) => {
  const clip = event.action.getClip().name;
  if (clip === 'Jump_Start') {
    crossfadeTo('Jump_Loop', currentAnim, actions);
    jump.current.phase = 'loop';
  }
  if (clip === 'Jump_Land') jump.current.phase = 'idle';
  actionLock.current = false;
};
```

Scroll locomotion (`Idle_Loop ↔ Jog_Fwd_Loop`) is gated on both `actionLock` and `crouching` state so inputs don't interrupt mid-animation.

### Game Bridge — Zero React State in the Hot Path

The hardest architectural problem: React's reconciler runs on the main thread triggered by state changes; the WebGL loop runs at 60fps in `useFrame`. Naïve use of `useState` would trigger **60 full reconciler cycles per second**.

Solution: a **singleton `Game` class**. The character publishes world position and forward vector each frame. The HUD reads it directly, zero React involvement:

```ts
class Game {
  readonly position  = new THREE.Vector3(0, 0, 0);
  readonly direction = new THREE.Vector3(0, 0, -1);

  publishState(group: THREE.Group, pos: THREE.Vector3): void {
    this.position.copy(pos);
    this.direction.set(Math.sin(group.rotation.y), 0, Math.cos(group.rotation.y));
  }

  subscribe(listener: ActionListener): () => void { /* pub/sub for inputs */ }
}
```

Progress state in `App.tsx` is additionally gated: sub-0.001 deltas never reach the reconciler, keeping React overhead near zero across the 60fps loop.

---

## HUD — Live Game State

The `GameHud` overlay shows live character telemetry and fragment recovery progress:

| Region | Content |
|---|---|
| Top-left | `POS X:NNN Z:NNNNN` — world-space coordinates, RAF-polled, throttled to actual changes |
| Top-right | Memory tracker — 5 colored dots (one per fragment, matching NPC light color) + `N/5` count |
| Bottom-left | WASD movement keys |
| Bottom-right | Action buttons — JUMP / PUNCH / CROUCH / ROLL |

Memory dots update via `memory.subscribe` — each unlock triggers a React state update only for that specific dot, no full HUD re-render.

---

## Camera — Spline Kinematics with Arc-Length Parameterization

Camera follows a `CatmullRomCurve3` with 14 control points spanning the full vertical descent from `y=130` (aerial) to `y=6` (street level).

`getPointAt(t)` uses **arc-length parameterization** — `t=0.5` maps to the halfway point of total path length, not the midpoint of the control-point array. Without this, camera speed varies wildly near densely-packed knots.

```ts
const pos     = CAMERA_PATH.getPointAt(t);      // arc-length parameterized
const tangent = CAMERA_PATH.getTangentAt(t);    // C¹ continuous forward direction
```

Smooth lerp via exponential decay — frame-rate independent, physically correct smoothing.

---

## Grid Floor — Anti-Aliased GLSL Shader, No Texture

The ground is a custom GLSL fragment shader — two overlaid grid frequencies computed analytically in screen space on a single 400×400 plane:

```glsl
// Street tiles — 40×40 subdivisions
vec2 dSmall = abs(fract(smallUv - 0.5) - 0.5) / fwidth(smallUv);
float smallLine = 1.0 - min(min(dSmall.x, dSmall.y), 1.0);

// City blocks — 8×8 subdivisions
vec2 dLarge = abs(fract(largeUv - 0.5) - 0.5) / fwidth(largeUv);
float largeLine = 1.0 - min(min(dLarge.x, dLarge.y), 1.0);
```

`fwidth()` — screen-space partial derivatives — gives **analytical anti-aliasing**. Line width is computed in pixels, not UV space. Zero shimmer at any zoom or angle. No MSAA required.

Two animated waves layered on top:

```glsl
float scanPulse = 0.5 + 0.5 * sin(uTime * 1.1 - dist * 16.0);  // concentric wavefronts
float basePulse  = 0.65 + 0.35 * sin(uTime * 0.35);             // global brightness pulse
float pulse = mix(basePulse, scanPulse, 0.65);
```

`dist * 16.0` creates concentric rings radiating from center. Combined with `smoothstep` radial fade — lines dissolve into fog at the horizon.

---

## Post-Processing Pipeline

Full cinematic stack composited in a single `EffectComposer` pass — one draw call for all effects, no extra render targets per effect:

| Effect | Technique |
|---|---|
| **Bloom** | Luminance threshold + dual Kawase blur |
| **Chromatic Aberration** | Per-channel barrel distortion offset |
| **Screen Noise** | Per-frame stochastic grain overlay |
| **Vignette** | Radial edge luminance reduction |
| **Glitch** | Frame-slice displacement triggered at scroll zone boundaries |

---

## Overlay System — Piecewise Smoothstep Zones

Five HTML sections each occupy a scroll interval `[t₀, t₁]`. Opacity computed via cubic Hermite interpolation — zero first derivative at zone boundaries so overlays never pop.

| Section | Scroll Range |
|---|---|
| Hero | 0.00 → 0.17 |
| About | 0.17 → 0.34 |
| Projects | 0.34 → 0.52 |
| Articles | 0.52 → 0.72 |
| Contact | 0.72 → 1.00 |

Overlays return `null` (unmount entirely) when `opacity < 0.01` — no invisible DOM nodes in the render tree.

Game-layer overlays (`MemoryModal`, `GameComplete`) are event-driven — triggered by `memory.subscribe`, not by scroll position.

---

## Atmosphere Systems

| System | Detail |
|---|---|
| **Rain** | Particle system, per-drop velocity integration, Y-floor reset |
| **Flying Vehicles** | Animated traffic on fixed aerial waypoint paths |
| **Data Streams** | Vertical particle columns, scroll-reactive density |
| **Holographic Billboards** | Band-limited noise GLSL for glitch displacement |
| **Neon Towers** | Wireframe boxes with emissive bloom glow, placed via path corridors |
| **Floating Shapes** | Rotating wireframe primitives |
| **Particles** | 1,500 ambient points, scroll-reactive |
| **NPCs** | Autonomous crowd, procedurally placed, independently animated |

All systems run inside `useFrame` hooks — zero React involvement.

---

## Tech Stack

| Layer | Tech |
|---|---|
| UI | React 19, TypeScript 5.8 |
| 3D Engine | Three.js r184, @react-three/fiber, @react-three/drei |
| Shaders | Custom GLSL (vertex + fragment) |
| Post-processing | @react-three/postprocessing — Bloom, Glitch, ChromaticAberration, Noise, Vignette |
| Build | Vite 8 |
| Linting/Format | Biome |
| Deploy | GitHub Pages (`/portfolio` base path) |

---

## Getting Started

```bash
pnpm install
pnpm dev        # → http://localhost:5173/portfolio
```

| Command | Purpose |
|---|---|
| `pnpm dev` | Vite dev server |
| `pnpm build` | Type-check + production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Biome linter check |
| `pnpm lint:fix` | Biome auto-fix |
| `pnpm format` | Biome formatter |
| `pnpm deploy` | Build + deploy to GitHub Pages |

---

## Project Structure

```
src/
  components/
    world/
      cyber/          # Player character — GLB, spline traversal, physics, animation FSM
      npcs/           # NPC agents — path following, SkeletonUtils clone, sequencer, death anim
      grid-floor/     # Custom GLSL two-tier anti-aliased grid shader
      effects/        # EffectComposer post-processing stack
    overlays/
      start-overlay/  # Mission briefing screen — corrupted operative dossier, locked objectives
      game-hud/       # HUD — coordinates, memory tracker dots, action buttons
      memory-modal/   # Fragment recovery popup — surfaces data on NPC punch
      game-complete/  # Mission complete overlay — all 5 fragments recovered
      hero-overlay/   # Scroll-driven section overlays (hero → contact)
  constants/          # Profile, projects, articles, camera path, colors, animations, NPC fragments
  game/
    game.ts           # Singleton bridge — publishes world state, dispatches inputs
    memory.ts         # Fragment unlock tracker — pub/sub, isAllUnlocked gate
  hooks/              # useCameraRig, useScrollProgress
  types/              # Shared types (OverlayProps, section zones, NPC paths)
  utils/              # world-gen.ts (procedural world), random.ts
```

Path alias: `@/` → `src/`

---

## Contact

**Erfan Ezkat**

- Email: erfan.ezkat@gmail.com
- GitHub: [github.com/erfanezk](https://github.com/erfanezk)
- LinkedIn: [linkedin.com/in/erfanezk](https://www.linkedin.com/in/erfanezk/)
