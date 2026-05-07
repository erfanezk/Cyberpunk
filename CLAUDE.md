# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Type-check (`tsc -b`) + Vite production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Biome linter check |
| `pnpm lint:fix` | Biome auto-fix |
| `pnpm format` | Biome formatter |
| `pnpm deploy` | Build + deploy `dist/` to GitHub Pages (`gh-pages -d dist`) |

No test runner is configured. Vite `base` is `/portfolio` (see `vite.config.ts`) — assets resolve under that path in production.

## Architecture

**Cyberpunk portfolio** — a scroll-driven 3D experience built with React 19, Three.js (via @react-three/fiber), and Vite. Single page, no routing.

### Scroll-driven camera system

`ScrollControls` (drei) wraps the R3F `Canvas` with `pages={7}`, creating a tall scroll container. `useScroll()` returns a `0→1` offset. Two hooks consume it:

- **`useCameraRig`** — maps scroll offset to a `CatmullRomCurve3` path (12 control points in `constants/camera.ts`), lerping camera position and lookAt each frame.
- **`useScrollProgress`** — reports offset to `App.tsx` as React state (`progress`), passed to all HTML overlays.

`Scene` is wrapped in `memo` and exposes a `scrollToTopRef` so DOM-side controls can scroll the drei container back to top.

### Overlay fade system

Each section overlay receives `progress` and computes opacity via `smoothstep` against its zone defined in `types/sections.types.ts`:

```
hero:     0.00 → 0.17
about:    0.17 → 0.34
projects: 0.34 → 0.52
articles: 0.52 → 0.72
contact:  0.72 → 1.00
```

Overlays return `null` when `opacity < 0.01` (unmount). All overlays implement `OverlayProps` from `types/common.types.ts`. `CinematicEnding` and `GameHud` are also progress-driven overlays composed alongside the section overlays in `App.tsx`.

### 3D scene composition

`Scene` → `CyberWorld` + `Effects` (post-processing). `Scene` also defines fog, ambient light, and 6 colored point lights for street-level mood.

`CyberWorld` renders:

- **Cyber** — the playable GLB character (`src/assets/UAL1_Standard.glb`) loaded via `useGLTF`. Its world transform is driven each frame from `scroll.offset` through `updateTransform` (in `cyber.utils.ts`), and `useAnimations` crossfades between `Idle_Loop` and `Jog_Fwd_Loop` based on smoothed scroll speed.
- **GridFloor** — custom GLSL shaders, infinite cyan grid with pulse/fade
- **NeonTowers** — wireframe box meshes with emissive glow
- **Particles** — ambient floating points (scroll-reactive)
- **FloatingShapes** — rotating wireframe primitives
- **DataStreams** — vertical particle columns
- **HolographicBillboards** — glitchy semi-transparent planes with noise shaders
- **Rain** — particle rain
- **FlyingVehicles** — animated traffic
- **NPCs** — populated crowd
- **Effects** — Bloom, ChromaticAberration, Noise, Vignette, Glitch (triggered at zone boundaries)

### Game layer (`src/game/`)

`src/game/game.ts` exports a singleton `game` instance — a thin shared bridge between the R3F scene and HUD-side React components. Each frame, `Cyber` calls `game.publishState(group, pos)` which copies the character's world position and derives a forward-direction vector from `group.rotation.y`. Other consumers (e.g., `GameHud`) read from this singleton without coupling to the R3F render tree. Keep it side-effect free; do not store React state on it.

### HTML overlays layer

Overlays render in a fixed `.overlay-layer` (pointer-events: none) on top of the Canvas. `App.tsx` composes them alongside `MusicPlayer`, `GameHud`, and `CinematicEnding`. `App.tsx` throttles `setProgress` with a `progressRef` (≥0.001 delta) so overlays don't re-render every frame.

## Conventions

- **Path alias:** `@/` maps to `src/` — use it for all imports (no relative `../../` paths). Configured in both `vite.config.ts` and `tsconfig.json`.
- **Component structure:** each component in its own folder with `component-name.tsx`, `.types.ts`, `.utils.ts`, `.constants.ts` (when needed), `.module.css`, and `index.ts` barrel export
- **Barrel exports:** `src/components/index.ts` re-exports all public components; type files re-exported via `src/types/index.ts`
- **CSS:** CSS Modules for component styles; global utilities (`.overlay-layer`, `.glass-panel`, `.scroll-container`, `.canvas-wrapper`) in `index.css`
- **Naming:** 3D components are PascalCase (`NeonTowers`), overlays suffixed with `Overlay` (`HeroOverlay`), hooks prefixed with `use`, type files suffixed `.types.ts`
- **Styling:** inline styles for layout/positioning, CSS Modules for animations and complex styles
- **Formatting:** Biome — 2-space indent, 100-char line width, single quotes, trailing commas
- **Linting:** `pnpm lint` before committing; `pnpm lint:fix` for auto-fixes
- **GLB assets:** import via `?url` suffix and call `useGLTF.preload(url)` at module scope (see `cyber.tsx`)
- **Design specs:** `docs/superpowers/specs/` contains detailed visual/technical specs
- **Data constants:** content lives in `src/constants/` (profile, projects, articles, contact, colors, camera path); procedural placement helpers in `src/utils/world-gen.ts` and `src/utils/random.ts`
