# Erfan Ezkat — Portfolio

A scroll-driven 3D portfolio built as an immersive cyberpunk experience. As you scroll, a camera flies through a neon city, revealing sections: Hero, About, Projects, Articles, and Contact — each fading in and out at defined scroll positions.

**Live site:** [erfanezk.github.io/portfolio](https://erfanezk.github.io/portfolio)

---

## Tech Stack

| Layer | Tech |
|---|---|
| UI | React 19, TypeScript 5 |
| 3D | Three.js, @react-three/fiber, @react-three/drei |
| Post-processing | @react-three/postprocessing (Bloom, Glitch, Chromatic Aberration) |
| Build | Vite 8 |
| Styling | CSS Modules + global utilities |
| Linting | Biome |
| Deploy | GitHub Pages |

---

## How It Works

### Scroll-driven camera

`ScrollControls` (from drei) creates a tall scroll container spanning 7 virtual pages. A `useScroll()` hook returns a `0→1` offset that drives two systems:

- **`useCameraRig`** — maps the offset to a `CatmullRomCurve3` path (12 control points), lerping the camera position and lookAt each frame.
- **`useScrollProgress`** — lifts the offset to React state in `App.tsx` and passes it to all HTML overlays.

### Section overlays

Each section fades in and out over a scroll range:

| Section | Range |
|---|---|
| Hero | 0.00 → 0.17 |
| About | 0.17 → 0.34 |
| Projects | 0.34 → 0.52 |
| Articles | 0.52 → 0.72 |
| Contact | 0.72 → 1.00 |

Overlays compute their opacity via `smoothstep` and unmount when `opacity < 0.01`.

### 3D scene

`Scene` → `CyberWorld` (6 visual elements) + `Effects` (post-processing):

- **GridFloor** — infinite cyan grid with GLSL pulse/fade shaders
- **NeonTowers** — wireframe boxes with emissive glow
- **Particles** — 1 500 ambient floating points
- **FloatingShapes** — rotating wireframe geometric primitives
- **DataStreams** — vertical particle columns
- **HolographicBillboards** — glitchy semi-transparent planes with noise shaders

---

## Getting Started

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Type-check + production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Biome linter check |
| `pnpm lint:fix` | Biome auto-fix |
| `pnpm format` | Biome formatter |
| `pnpm deploy` | Deploy `build/` to GitHub Pages |

---

## Project Structure

```
src/
  components/     # One folder per component (tsx, types, utils, module.css, index.ts)
  constants/      # Profile, projects, articles, contact, colors, camera path
  hooks/          # useCameraRig, useScrollProgress
  types/          # Shared types (OverlayProps, section zones)
  utils/
  App.tsx
  index.css       # Global utilities (.overlay-layer, .glass-panel, etc.)
```

Path alias: `@/` → `src/`

---

## Contact

- **Email:** erfan.ezkat@gmail.com
- **GitHub:** [github.com/erfanezk](https://github.com/erfanezk)
- **LinkedIn:** [linkedin.com/in/erfanezk](https://www.linkedin.com/in/erfanezk/)
