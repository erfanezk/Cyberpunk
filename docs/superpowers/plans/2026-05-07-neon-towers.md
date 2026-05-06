# Segmented Neon Towers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform plain wireframe box towers into articulated neon wireframe structures with dual-layer segments, edge lines, and pulsing energy animation.

**Architecture:** Each tower becomes 3–5 stacked box segments with gaps. Each segment renders three layers: a translucent outer shell (animated emissive pulse), a smaller inner wireframe frame (constant glow), and edge lines (constant bright neon). A single `useFrame` callback drives the pulsing animation using `Math.sin`.

**Tech Stack:** React Three Fiber, Three.js (`EdgesGeometry`, `LineSegments`, `LineBasicMaterial`, `BoxGeometry`, `meshStandardMaterial`), `useFrame` from `@react-three/fiber`

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/neon-towers/neon-towers.types.ts` | Add `SegmentData`, update `TowerData` |
| `src/components/neon-towers/neon-towers.utils.ts` | Rewrite `generateTowers` for segmented data |
| `src/components/neon-towers/neon-towers.tsx` | Rewrite component with layers, edges, animation |

No new files. No dependency changes.

---

### Task 1: Update Tower Types

**Files:**
- Modify: `src/components/neon-towers/neon-towers.types.ts`

- [ ] **Step 1: Replace types with segmented structure**

```ts
import type * as THREE from 'three';

export interface SegmentData {
  localY: number;
  height: number;
  phaseOffset: number;
}

export interface TowerData {
  position: [number, number, number];
  width: number;
  color: THREE.Color;
  segments: SegmentData[];
  id: string;
}
```

- [ ] **Step 2: Verify no build errors**

Run: `npx tsc --noEmit`
Expected: No errors (the utils and component files reference `TowerData` but will be updated in subsequent tasks, so expect errors until Task 3 is complete — that's fine).

- [ ] **Step 3: Commit**

```bash
git add src/components/neon-towers/neon-towers.types.ts
git commit -m "refactor: update tower types for segmented structure"
```

---

### Task 2: Update Tower Generation Utility

**Files:**
- Modify: `src/components/neon-towers/neon-towers.utils.ts`

- [ ] **Step 1: Rewrite generateTowers**

Replace the entire file contents with:

```ts
import * as THREE from 'three';
import { COLORS } from '@/constants';
import type { TowerData, SegmentData } from './neon-towers.types';
import { generateId } from '@/utils';

function generateSegments(totalHeight: number): SegmentData[] {
  const count = 3 + Math.floor(Math.random() * 3); // 3–5 segments
  const gapSize = 0.5 + Math.random(); // 0.5–1.5 unit gaps
  const totalGap = gapSize * (count - 1);
  const usableHeight = totalHeight - totalGap;
  const baseSegmentHeight = usableHeight / count;

  const segments: SegmentData[] = [];
  let currentY = 0;

  for (let i = 0; i < count; i++) {
    // Vary segment height slightly (±20%)
    const height = baseSegmentHeight * (0.8 + Math.random() * 0.4);
    segments.push({
      localY: currentY + height / 2,
      height,
      phaseOffset: i * 0.8 + Math.random() * 0.5,
    });
    currentY += height + gapSize;
  }

  return segments;
}

export function generateTowers(count: number): TowerData[] {
  const neonColors = [
    new THREE.Color(COLORS.cyan),
    new THREE.Color(COLORS.magenta),
    new THREE.Color(COLORS.electricBlue),
  ];

  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 15 + Math.random() * 80;
    const totalHeight = 10 + Math.random() * 70;
    const width = 1 + Math.random() * 4;

    return {
      position: [
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius - 40,
      ] as [number, number, number],
      width,
      color: neonColors[Math.floor(Math.random() * neonColors.length)],
      segments: generateSegments(totalHeight),
      id: generateId(),
    };
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/neon-towers/neon-towers.utils.ts
git commit -m "feat: generate segmented tower data with gaps and phase offsets"
```

---

### Task 3: Rewrite NeonTowers Component

**Files:**
- Modify: `src/components/neon-towers/neon-towers.tsx`

- [ ] **Step 1: Rewrite the component**

Replace the entire file contents with:

```tsx
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { TowerData } from './neon-towers.types';
import { generateTowers } from './neon-towers.utils';

const count = 18;

function TowerSegment({
  width,
  height,
  color,
  phaseOffset,
}: {
  width: number;
  height: number;
  color: THREE.Color;
  phaseOffset: number;
}) {
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (outerRef.current) {
      const mat = outerRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity =
        0.15 + 0.35 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 2 + phaseOffset));
    }
  });

  const edgeGeo = useMemo(() => {
    const box = new THREE.BoxGeometry(width, height, width);
    return new THREE.EdgesGeometry(box);
  }, [width, height]);

  const innerWidth = width * 0.65;

  return (
    <group>
      {/* Outer shell — translucent, animated pulse */}
      <mesh ref={outerRef}>
        <boxGeometry args={[width, height, width]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Inner frame — wireframe, constant subtle glow */}
      <mesh>
        <boxGeometry args={[innerWidth, height, innerWidth]} />
        <meshStandardMaterial
          color={color}
          wireframe
          emissive={color}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Edge lines — constant bright neon */}
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color={color} />
      </lineSegments>
    </group>
  );
}

function Tower({ tower }: { tower: TowerData }) {
  return (
    <group position={tower.position}>
      {tower.segments.map((seg, i) => (
        <group key={i} position={[0, seg.localY, 0]}>
          <TowerSegment
            width={tower.width}
            height={seg.height}
            color={tower.color}
            phaseOffset={seg.phaseOffset}
          />
        </group>
      ))}
    </group>
  );
}

export function NeonTowers() {
  const towers = useMemo<TowerData[]>(() => generateTowers(count), []);

  return (
    <group>
      {towers.map((tower) => (
        <Tower key={tower.id} tower={tower} />
      ))}
    </group>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/neon-towers/neon-towers.tsx
git commit -m "feat: render segmented neon towers with edge lines and pulsing animation"
```

---

### Task 4: Visual Verification

- [ ] **Step 1: Start dev server**

Run: `npm run dev` (or the project's dev command)

- [ ] **Step 2: Verify in browser**

Check the following:
1. Towers have visible segments with gaps between them (not a single solid block)
2. Each segment has a translucent outer shell and an inner wireframe frame
3. Bright neon edge lines are visible on each segment's outer shell
4. The outer shell pulses with a visible emissive intensity animation
5. The inner wireframe has a constant subtle glow
6. Distant towers fade into fog as before
7. No visual artifacts or z-fighting between layers

- [ ] **Step 3: Verify performance**

Open browser DevTools → Performance. Check that frame rate stays above 30fps with the new towers. If performance is poor, consider reducing tower `count` from 18 to 12.
