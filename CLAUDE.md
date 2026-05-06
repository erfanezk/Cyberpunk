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
| `pnpm deploy` | Deploy `build/` to GitHub Pages |

No test runner is configured.

## Architecture

**Cyberpunk portfolio** — a scroll-driven 3D experience built with React 19, Three.js (via @react-three/fiber), and Vite. The entire app is a single page with no routing.

### Scroll-driven camera system

The core mechanic: `ScrollControls` (from drei) wraps the R3F `Canvas` with `pages={7}`, creating a tall scroll container. `useScroll()` returns a `0→1` offset. Two hooks consume it:

- **`useCameraRig`** — maps scroll offset to a `CatmullRomCurve3` path (12 control points in `constants/camera.ts`), lerping camera position and lookAt each frame.
- **`useScrollProgress`** — reports offset to `App.tsx` as React state (`progress`), which is passed to all HTML overlays.

### Overlay fade system

Each section overlay (Hero, About, Projects, Articles, Contact) receives `progress` and computes opacity via `smoothstep` against its zone defined in `types/sections.ts`:

```
hero:     0.00 → 0.17
about:    0.17 → 0.34
projects: 0.34 → 0.52
articles: 0.52 → 0.72
contact:  0.72 → 1.00
```

Overlays return `null` when `opacity < 0.01` (unmount). All overlays implement `OverlayProps` from `types/common.ts`.

### 3D scene composition

`Scene` → `CyberWorld` (6 visual elements) + `Effects` (post-processing):

- **GridFloor** — custom GLSL shaders, infinite cyan grid with pulse/fade
- **NeonTowers** — wireframe box meshes with emissive glow
- **Particles** — 1500 ambient floating points
- **FloatingShapes** — rotating wireframe geometric primitives
- **DataStreams** — vertical particle columns
- **HolographicBillboards** — glitchy semi-transparent planes with noise shaders
- **Effects** — Bloom, ChromaticAberration, Noise, Vignette, Glitch (triggered at zone boundaries)

### HTML overlays layer

Overlays render in a fixed `.overlay-layer` (pointer-events: none) on top of the Canvas. `App.tsx` composes them alongside `MusicPlayer` and `BackToTop`.

## Conventions

- **Path alias:** `@/` maps to `src/` — use it for all imports (no relative `../../` paths)
- **Component structure:** each component in its own folder with `component-name.tsx`, `.types.ts`, `.utils.ts`, `.module.css`, and `index.ts` barrel export
- **Barrel exports:** `src/components/index.ts` re-exports all public components
- **CSS:** CSS Modules for component styles; global utilities (`.overlay-layer`, `.glass-panel`, `.scroll-container`, `.canvas-wrapper`) in `index.css`
- **Naming:** 3D components are PascalCase (`NeonTowers`), overlays suffixed with `Overlay` (`HeroOverlay`), hooks prefixed with `use`
- **Styling:** inline styles for layout/positioning, CSS Modules for animations and complex styles
- **Formatting:** Biome — 2-space indent, 100-char line width, single quotes, trailing commas
- **Linting:** `pnpm lint` before committing; `pnpm lint:fix` for auto-fixes
- **Design specs:** `docs/superpowers/specs/` contains detailed visual/technical specs
- **Data constants:** content lives in `src/constants/` (profile, projects, articles, contact, colors, camera path)
