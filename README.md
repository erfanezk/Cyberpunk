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

Not a portfolio page. A **scroll-driven semi-open world** — live NPCs with autonomous pathfinding, a playable character on a parametric spline, custom GLSL shaders, and a cinematic post-processing pipeline. All of it running at **60fps inside a React app**, with zero game engine dependencies.

No Unity. No Unreal. No canvas 2D. Pure **Three.js + WebGL + math**.

---

## Architecture Overview

```
Browser scroll offset  t ∈ [0,1]
         │
         ├──► CatmullRomCurve3.getPointAt(t)  →  Camera position in ℝ³
         ├──► updateTransform(group, t)         →  Character world transform
         ├──► smoothstep(t₀, t₁, t)            →  Section overlay opacity
         ├──► EMA(Δoffset/Δframe)               →  Animation crossfade trigger
         └──► scroll-reactive uniforms          →  Particle density, shader FX
```

One scalar. Entire world state derived deterministically every frame.

---

## Systems Deep Dive

### 1. Camera — Spline Kinematics

Camera follows a **`CatmullRomCurve3`** — a piecewise cubic spline in ℝ³ with 12 control points.

```ts
const pos     = WALK_PATH.getPointAt(t);      // arc-length parameterized
const tangent = WALK_PATH.getTangentAt(t);    // forward direction
```

`getPointAt(t)` uses **arc-length parameterization** — `t=0.5` always maps to the halfway point of total path length, not the halfway index in the control point array. Without this, camera speed would vary wildly near densely-packed control points.

Smooth lerp via exponential decay: `α = 1 - e^(-λΔt)` — physically-based smoothing, frame-rate independent.

---

### 2. Character — Tangent-Space Rotation Controller

Player heading computed from spline tangent each frame:

```ts
WALK_PATH.getTangentAt(t, _tan).normalize();
const targetY = Math.atan2(_tan.x, _tan.z);

let dy = targetY - group.rotation.y;
if (dy >  Math.PI) dy -= Math.PI * 2;   // wrap to [-π, π]
if (dy < -Math.PI) dy += Math.PI * 2;
group.rotation.y += dy * 0.08;           // proportional controller
```

Angular delta clamped to `[-π, π]` — prevents the character from spinning the long way around at the `±π` discontinuity. The `0.08` gain produces lag that makes turns feel physical.

Animation crossfade (`Idle_Loop` ↔ `Jog_Fwd_Loop`) triggered by scroll velocity EMA:

```ts
next.crossFadeFrom(prev, fadeIn, true);  // time-sync'd blend
```

---

### 3. NPC System — Autonomous Agents With Constant-Speed Parameterization

Every NPC navigates an independent waypoint path. Crowd is fully procedural — no scripted animations, no teleportation.

**The core problem:** naive `t += speed * delta` causes NPCs to sprint through short segments and crawl through long ones. Fix: normalize by segment length.

```ts
function advancePath(state: PathState, path: NpcPath, delta: number): void {
  const { from, to } = getSegment(state.t, path);
  const dist = segmentDist(from, to);
  if (dist > 0) state.t += (path.speed * delta) / dist;  // constant world-space speed
}
```

Two path modes — **loop** and **ping-pong**:

```ts
// Loop: t cycles through all n segments with wrap-around
rawT = ((t % n) + n) % n;

// Ping-pong: t folds at both ends of the path
const period = 2 * (n - 1);
const wrapped = ((t % period) + period) % period;
rawT = wrapped <= n - 1 ? wrapped : period - wrapped;
```

Heading via `Math.atan2` on segment direction. `backward` flag flips heading on reverse pass.

Each NPC gets a `pathOffset` seed — staggers crowd start positions so agents don't clump.

**Memory:** all NPCs share one loaded GLB via `SkeletonUtils.clone()` — geometry stays on GPU once. Each agent owns an independent `AnimationMixer`.

---

### 4. Grid Floor — Anti-Aliased Two-Tier GLSL Shader

The ground is not a texture. It's a **custom GLSL fragment shader** — two overlaid grid frequencies computed analytically in screen space.

```glsl
// Street tiles — 40×40 subdivisions
vec2 smallUv = vUv * 40.0;
vec2 dSmall  = abs(fract(smallUv - 0.5) - 0.5) / fwidth(smallUv);
float smallLine = 1.0 - min(min(dSmall.x, dSmall.y), 1.0);

// City blocks — 8×8 subdivisions
vec2 largeUv = vUv * 8.0;
vec2 dLarge  = abs(fract(largeUv - 0.5) - 0.5) / fwidth(largeUv);
float largeLine = 1.0 - min(min(dLarge.x, dLarge.y), 1.0);
```

`fwidth()` — screen-space partial derivatives — gives **analytical anti-aliasing**. Line width computed in pixels, not UV space. Zero shimmer at any zoom or angle.

Traveling radial pulse wave:

```glsl
float scanPulse = 0.5 + 0.5 * sin(uTime * 1.1 - dist * 16.0);
```

Phase `uTime` advances in time. `dist * 16.0` creates concentric wavefronts radiating outward. Combined with `smoothstep` radial fade — lines dissolve into fog at the horizon.

---

### 5. Post-Processing Pipeline

Full cinematic stack in a single `EffectComposer` pass:

| Effect | Technique |
|---|---|
| **Bloom** | Luminance threshold + dual Kawase blur |
| **Chromatic Aberration** | Per-channel barrel distortion offset |
| **Screen Noise** | Per-frame stochastic grain overlay |
| **Vignette** | Radial edge luminance reduction |
| **Glitch** | Frame-slice displacement at scroll zone boundaries |

One draw call for all effects. No extra render targets per effect.

---

### 6. React/WebGL Decoupling — The Singleton Game Bridge

The hardest architectural problem: React's reconciler runs on the main thread, triggered by state changes. The WebGL loop runs at 60fps in `useFrame`. Storing 3D world state as React state would trigger **60 full reconciler cycles per second**.

Solution: a **singleton `game` bridge**. Character publishes world position + forward vector each frame — HUD reads it directly without touching React state.

Progress state gated in `App.tsx`:

```ts
if (Math.abs(newProgress - progressRef.current) >= 0.001) {
  progressRef.current = newProgress;
  setProgress(newProgress);
}
```

Sub-0.001 deltas never reach the reconciler. Scroll momentum never causes re-renders. Overlays unmount entirely below `opacity < 0.01`.

Result: React overhead across the 60fps loop is **near zero**.

---

### 7. Overlay System — Piecewise Smoothstep Zones

Five HTML sections each occupy a scroll interval `[t₀, t₁]`. Opacity computed via cubic Hermite interpolation — zero first derivative at zone boundaries, so overlays never pop.

| Section | Scroll Range |
|---|---|
| Hero | 0.00 → 0.17 |
| About | 0.17 → 0.34 |
| Projects | 0.34 → 0.52 |
| Articles | 0.52 → 0.72 |
| Contact | 0.72 → 1.00 |

---

## Atmosphere Systems

| System | Detail |
|---|---|
| **Rain** | Particle system, per-drop velocity integration, Y-floor reset |
| **Flying Vehicles** | Animated traffic on fixed aerial waypoint paths |
| **Data Streams** | Vertical particle columns, scroll-reactive density |
| **Holographic Billboards** | Band-limited noise GLSL for glitch displacement |
| **Neon Towers** | Wireframe boxes with emissive bloom glow |
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
  components/         # One folder per component (tsx, types, utils, module.css, index.ts)
    cyber/            # Player character — GLB, spline traversal, animation FSM
    npcs/             # NPC agents — path following, SkeletonUtils clone, mixer
    grid-floor/       # Custom GLSL two-tier anti-aliased grid shader
    effects/          # EffectComposer post-processing stack
    game-hud/         # HUD overlay — reads game singleton, zero React state
    ...
  constants/          # Profile, projects, articles, camera path, colors
  hooks/              # useCameraRig, useScrollProgress
  game/               # game.ts — singleton bridge, publishes world state each frame
  types/              # Shared types (OverlayProps, section zones, NPC paths)
  utils/              # world-gen.ts, random.ts — procedural placement helpers
```

Path alias: `@/` → `src/`

---

## Contact

**Erfan Ezkat**

- Email: erfan.ezkat@gmail.com
- GitHub: [github.com/erfanezk](https://github.com/erfanezk)
- LinkedIn: [linkedin.com/in/erfanezk](https://www.linkedin.com/in/erfanezk/)
