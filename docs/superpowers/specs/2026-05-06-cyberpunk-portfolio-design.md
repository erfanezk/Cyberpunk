# Cyberpunk 3D Portfolio — Design Spec

**Date:** 2026-05-06
**Type:** Interactive 3D scroll experience
**Tech Stack:** React + Vite + Three.js (R3F + Drei + Postprocessing)

---

## 1. Overview

An immersive, single-page portfolio built as a continuous 3D fly-through through a cyberpunk digital cityscape. The visitor scrolls to move the camera along a predefined path through a neon-lit world of wireframe towers, glowing grids, floating particles, and holographic UI panels. The 3D environment is entirely procedural — no external images or videos required for the visual experience.

**Priority:** Visual impact first. Performance is secondary to wow factor.

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 18 + Vite | Component architecture, fast dev server, bundling |
| 3D Rendering | `@react-three/fiber` (R3F) | React renderer for Three.js |
| 3D Helpers | `@react-three/drei` | Camera controls, scroll hooks, `<Html>`, text, common geometries |
| Post-processing | `@react-three/postprocessing` | Bloom, chromatic aberration, film grain, vignette, glitch |
| Fonts | Google Fonts (Share Tech Mono) | Cyberpunk monospace aesthetic |
| Deployment | Vite build → static host | Simple static deployment (Vercel, Netlify, GitHub Pages) |

### Dependencies (package.json)

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "@react-three/fiber": "^8.x",
    "@react-three/drei": "^9.x",
    "@react-three/postprocessing": "^2.x",
    "three": "^0.160.x",
    "postprocessing": "^6.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x"
  }
}
```

---

## 3. Architecture

```
portfolio/
├── src/
│   ├── App.jsx                      # Root: scroll container + Canvas
│   ├── main.jsx                     # Entry point
│   ├── index.css                    # Global styles, fonts, CSS variables
│   ├── components/
│   │   ├── Scene.jsx                # R3F Canvas wrapper with camera, lights, fog
│   │   ├── world/
│   │   │   ├── CyberWorld.jsx       # Main world composition (combines all world elements)
│   │   │   ├── NeonTowers.jsx       # Wireframe box geometries with emissive edges
│   │   │   ├── GridFloor.jsx        # Infinite glowing grid (shader-based)
│   │   │   ├── DataStreams.jsx       # Vertical particle trails between structures
│   │   │   ├── FloatingShapes.jsx   # Rotating icosahedrons, torus knots, octahedrons
│   │   │   ├── Particles.jsx        # Thousands of floating ambient particles
│   │   │   └── HolographicBillboards.jsx # Glitchy semi-transparent planes
│   │   ├── camera/
│   │   │   └── CameraRig.jsx        # Scroll-driven CatmullRom spline camera path
│   │   ├── effects/
│   │   │   └── Effects.jsx          # Post-processing pipeline
│   │   └── ui/
│   │       ├── HeroOverlay.jsx      # Name, title, glitch text effect
│   │       ├── AboutOverlay.jsx     # Bio panel, skills chips, profile photo placeholder
│   │       ├── ProjectsOverlay.jsx  # 3D project cards in arc layout
│   │       └── ContactOverlay.jsx   # Terminal-style contact interface
│   ├── hooks/
│   │   └── useScrollProgress.js     # Wrapper around Drei's useScroll
│   └── constants/
│       └── config.js                # Camera path points, colors, section boundaries
├── public/
│   └── fonts/                       # (optional) self-hosted fonts
├── index.html
├── package.json
└── vite.config.js
```

### Data Flow

1. Visitor scrolls the page → scroll container reports progress (0-1)
2. `useScrollProgress` hook reads scroll offset from Drei's `useScroll`
3. `CameraRig` maps scroll progress to a position on a CatmullRom spline → updates camera position + lookAt
4. UI overlays read the same scroll progress → fade in/out based on zone boundaries
5. Post-processing effects apply bloom, aberration, grain to the entire 3D scene

---

## 4. The Cyberpunk World

### 4.1 Environment

The world is a stylized digital cityscape. Dark void background with neon-lit structures.

**Color Palette:**
- Background: `#0a0a0f` (near-black with slight blue)
- Cyan: `#00fff5` (primary neon)
- Magenta: `#ff00ff` (secondary neon)
- Electric Blue: `#0066ff` (accent)
- Amber: `#ff9900` (warm accent, used sparingly)
- Grid lines: `#1a1a2e` base, `#00fff5` glow

**Atmosphere:**
- Scene fog (exponential) — structures fade into darkness at distance
- Ambient light: very low (`#0a0a1a`, intensity 0.1)
- Neon point lights at key positions

### 4.2 World Elements

**NeonTowers:**
- 30-50 box geometries of varying width/height/depth
- Wireframe material + slight emissive glow on edges
- Randomly positioned in a ~200x200 unit area at varying heights (10-80 units tall)
- Clustered denser in the center, sparser at edges
- Some towers have a subtle pulsing emissive animation

**GridFloor:**
- Infinite grid shader at y=0
- Lines in dark blue (`#1a1a2e`) with cyan glow (`#00fff5`)
- Grid fades with distance (fog integration)
- Subtle animation: grid lines pulse slowly

**DataStreams:**
- Vertical particle columns between towers
- Particles flow upward (like rising data)
- ~10-15 streams scattered through the city
- Color: cyan with slight random variation

**FloatingShapes:**
- 15-20 geometric primitives (icosahedron, torusKnot, octahedron, dodecahedron)
- Slow rotation on multiple axes
- Wireframe + emissive material
- Float in the space between towers
- Sizes: 0.5 - 3 units

**Particles (ambient):**
- 2000-5000 small glowing points
- Fill the entire scene volume
- Slow drift in a general direction (slight wind effect)
- React to scroll: drift direction shifts slightly as camera moves
- Size: 0.02 - 0.1 units
- Color: mix of cyan, magenta, and white with low opacity

**HolographicBillboards:**
- 5-8 semi-transparent planes
- Positioned near towers, slightly tilted
- Animated noise shader (flickering, glitching)
- Color: randomized from the neon palette
- Size: 3x5 to 8x12 units

---

## 5. Camera Path

### 5.1 Spline Definition

A `THREE.CatmullRomCurve3` with 10-12 control points defines the camera flight path. The path:

- Starts high above the city (bird's eye view)
- Descends and weaves between neon towers
- Dives lower through the dense city center
- Rises up and pulls back for the final zone

### 5.2 Scroll Mapping

```
scrollProgress (0-1) → spline.getPointAt(t) → camera.position
scrollProgress (0-1) → spline.getPointAt(t + 0.01) → camera.lookAt target
```

A small lookahead offset (0.01-0.02 on the spline) ensures the camera always looks forward along the path.

### 5.3 Smoothing

Camera position is **lerped** each frame:
```js
camera.position.lerp(targetPosition, 0.05)
```
This creates smooth, cinematic movement rather than rigid 1:1 scroll tracking.

### 5.4 Zone Mapping

| Zone | Scroll Range | Camera Area | Content Section |
|------|-------------|-------------|-----------------|
| 1 - Approach | 0% – 25% | High above city, descending | Hero |
| 2 - Deep Dive | 25% – 50% | Weaving between towers | About |
| 3 - Core | 50% – 75% | Low through city center | Projects |
| 4 - Exit | 75% – 100% | Rising above city | Contact |

---

## 6. UI Overlays

All UI overlays are React components rendered as **absolute-positioned HTML divs layered over the fixed canvas**. The canvas is fixed to the viewport; overlay divs sit on top with `position: fixed` and `pointer-events: none` (with `pointer-events: auto` on interactive elements). This approach avoids z-index issues between HTML and post-processing effects.

### 6.1 Shared UI Style

```css
.glass-panel {
  background: rgba(10, 10, 30, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 255, 245, 0.2);
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 255, 245, 0.1), inset 0 0 20px rgba(0, 255, 245, 0.05);
  font-family: 'Share Tech Mono', monospace;
  color: #e0e0e0;
  position: relative;
  overflow: hidden;
}

/* Scanline overlay */
.glass-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 245, 0.03) 2px,
    rgba(0, 255, 245, 0.03) 4px
  );
  pointer-events: none;
}
```

### 6.2 Hero Overlay (Zone 1)

- Large name text with CSS glitch animation
- Subtitle/tagline below
- Subtle scanline overlay
- Fades out as camera descends past 25%

**Glitch effect:** CSS `@keyframes` that shift text-shadow in cyan/magenta and apply slight clip-path distortion.

### 6.3 About Overlay (Zone 2)

- Glass panel with two columns:
  - Left: profile photo placeholder (gradient circle or silhouette icon)
  - Right: bio text with typing animation effect
- Skills/tech shown as glowing "data chips" — small glassmorphism badges floating around the panel
- Fades in at 25%, fades out at 50%

### 6.4 Projects Overlay (Zone 3)

- 3-4 project cards arranged in a loose arc
- Each card: glass panel with:
  - Placeholder image area (gradient or abstract pattern)
  - Project title
  - One-line description
  - "View Project" link styled as a glowing button
- Cards gently face the camera (billboard behavior)
- Fades in at 50%, fades out at 75%

### 6.5 Contact Overlay (Zone 4)

- Terminal-style interface
- Dark background with CRT scanline effect
- Monospace text, cyan/green color scheme
- Blinking cursor animation
- Content displayed as terminal output:
  ```
  > CONTACT.exe
  > ──────────────────────
  > email: you@example.com
  > github: github.com/you
  > linkedin: linkedin.com/in/you
  > twitter: @you
  > ──────────────────────
  > _
  ```
- Fades in at 75%, visible through end

---

## 7. Post-Processing Effects

The `Effects.jsx` component wraps R3F's postprocessing pipeline:

| Effect | Settings | Purpose |
|--------|----------|---------|
| **Bloom** | luminanceThreshold: 0.2, luminanceSmoothing: 0.9, intensity: 1.5 | Makes emissive surfaces glow (neon lights, wireframes) |
| **ChromaticAberration** | offset: [0.002, 0.002] | Subtle RGB color split at screen edges — cinematic feel |
| **Noise** | opacity: 0.05 | Light film grain for texture |
| **Vignette** | offset: 0.3, darkness: 0.7 | Darkens screen edges, focuses attention center |
| **Glitch** | delay: 1.5, duration: 0.3, strength: 0.2 | Brief digital glitch triggered once when scroll progress crosses a zone boundary (25%, 50%, 75%) |

Effects are wrapped in `<EffectComposer>` from `@react-three/postprocessing`.

---

## 8. Scroll System

### 8.1 Implementation

The page has a tall scroll container (e.g., `height: 500vh`) that creates scrollable space. The R3F Canvas is fixed to the viewport. Drei's `useScroll()` hook provides the scroll offset as a 0-1 value.

```jsx
// App.jsx structure
<div className="scroll-container" style={{ height: '500vh' }}>
  <Canvas style={{ position: 'fixed', top: 0, left: 0 }}>
    <Scene scrollProgress={scrollProgress} />
  </Canvas>
</div>
```

### 8.2 Section Triggers

Each UI overlay has defined `fadeIn` and `fadeOut` scroll thresholds. The overlay's opacity is calculated as:

```
opacity = smoothstep(fadeIn, fadeIn + 0.05, progress) * (1 - smoothstep(fadeOut - 0.05, fadeOut, progress))
```

This creates smooth fade transitions without hard cuts.

---

## 9. Responsive Behavior

- **Desktop (>1024px):** Full 3D experience, all effects enabled
- **Tablet (768-1024px):** Reduced particle count (1000), simplified geometry, effects still on
- **Mobile (<768px):** Drastically reduced particles (300), simplified towers, bloom only (no chromatic aberration/noise), UI overlays take more screen space

---

## 10. Performance Considerations

Since visual impact is the priority:

- **Geometry instancing** for towers and particles (single draw call per type)
- **Level of detail** — towers far from camera use simpler geometry
- **Frustum culling** — built into Three.js, objects outside camera view aren't rendered
- **useMemo** for all geometry/material creation to avoid re-creation on re-render
- **Frame rate monitoring** — if FPS drops below 30, auto-reduce particle count

---

## 11. Content Placeholder Strategy

Initial build uses placeholders for personal content:

| Content | Placeholder |
|---------|-------------|
| Profile photo | Gradient circle silhouette |
| Project images | Abstract gradient patterns with project initials |
| Bio text | Placeholder lorem ipsum that's easy to replace |
| Project data | Array of 4 objects with title, description, link, color |

All content is defined in `constants/config.js` as data objects — easy to swap in real content later.

---

## 12. Deployment

- `npm run build` produces a static `dist/` folder
- Deploy to Vercel, Netlify, or GitHub Pages
- No server-side rendering needed — fully client-side
- Single page, no routing
