# Segmented Neon Wireframe Towers

**Date:** 2026-05-07  
**Status:** Approved  
**Scope:** Improve the `NeonTowers` component to look like detailed wireframe structures with animated energy flow

---

## Problem

The current neon towers are plain wireframe boxes — a single `boxGeometry` with `wireframe: true` and a flat emissive material. They lack visual depth, structure, and animation. They read as floating outlines rather than cyberpunk city structures.

## Goal

Transform the towers into articulated neon wireframe structures with:
- Multi-segment towers (stacked boxes with gaps)
- Dual-layer rendering (translucent outer shell + inner wireframe skeleton)
- Bright neon edge lines for crisp outlines
- Pulsing emissive animation that simulates energy flowing upward

## Design

### Tower Structure (per tower)

Each tower is composed of **3–5 segments** stacked vertically with gaps between them, creating an articulated silhouette. Each segment has two layers:

1. **Outer shell** — translucent box (`opacity ~0.2`), emissive color matching the tower's neon color. This layer is what pulses with the energy animation.
2. **Inner frame** — wireframe box at `0.65x` the width/depth of the outer shell, with a subtle constant emissive glow. Adds visible internal depth.
3. **Edge lines** — `EdgesGeometry` + `LineSegments` on the outer box geometry, using `LineBasicMaterial` with a bright neon color. Constant brightness — no animation.

### Tower Generation (`generateTowers`)

Extend `TowerData` to include a `segments` array:

```ts
export interface SegmentData {
  localY: number;      // y-offset from tower base
  height: number;      // segment height
  phaseOffset: number; // animation phase offset
}

export interface TowerData {
  position: [number, number, number];
  width: number;
  color: THREE.Color;
  segments: SegmentData[];
  id: string;
}
```

Generation logic:
- Total tower height: 10–80 units (same range as current)
- Split into 3–5 segments with 0.5–1.5 unit gaps between them
- Each segment gets a random `phaseOffset` for the pulsing animation
- Tower `width` is uniform across all segments (1–4 units)
- Position and color assignment unchanged from current logic

### Animation (`useFrame`)

- Each tower's outer shell `emissiveIntensity` oscillates via `Math.sin(clock.elapsedTime * 2 + phaseOffset)`
- Range: `0.15` to `0.5` (subtle pulse, not distracting)
- Inner wireframe: constant `emissiveIntensity: 0.1`
- Edge lines: constant `LineBasicMaterial` color (bright neon)

### Rendering Approach

Per segment, render:
```
<group position={[0, segment.localY, 0]}>
  {/* Outer shell */}
  <mesh>
    <boxGeometry args={[width, segment.height, width]} />
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={animated} // updated via useFrame
      transparent
      opacity={0.2}
    />
  </mesh>
  {/* Inner frame */}
  <mesh>
    <boxGeometry args={[width * 0.65, segment.height, width * 0.65]} />
    <meshStandardMaterial
      color={color}
      wireframe
      emissive={color}
      emissiveIntensity={0.1}
    />
  </mesh>
  {/* Edge lines */}
  <lineSegments>
    <edgesGeometry args={[outerBoxGeometry]} />
    <lineBasicMaterial color={color} />
  </lineSegments>
</group>
```

Edge geometry can be computed once per segment size using `useMemo` since each segment may have a different height.

### Performance

- ~18 towers × 4 segments avg × 3 objects (outer + inner + edges) = ~216 draw calls
- All use simple `boxGeometry` — negligible GPU cost
- Edge geometries are lightweight line primitives
- No post-processing or custom shaders required

## Files Modified

| File | Change |
|------|--------|
| `src/components/neon-towers/neon-towers.types.ts` | Add `SegmentData` interface, update `TowerData` |
| `src/components/neon-towers/neon-towers.utils.ts` | Rewrite `generateTowers` to produce segmented data |
| `src/components/neon-towers/neon-towers.tsx` | Rewrite component with dual-layer segments, edge lines, and `useFrame` animation |

No new files needed. No dependency changes.
