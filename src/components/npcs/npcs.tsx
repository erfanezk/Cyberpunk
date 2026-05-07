import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three';
import modelUrl from '@/assets/UAL1_Standard.glb?url';
import { NPC_INSTANCES } from '@/constants';
import type { NpcInstance, NpcPath, Vec3 } from '@/types';

// ── helpers ──────────────────────────────────────────────────────────────────

function segmentDist(a: Vec3, b: Vec3) {
  return Math.sqrt((b[0] - a[0]) ** 2 + (b[2] - a[2]) ** 2);
}

// ── path follower ─────────────────────────────────────────────────────────────

interface PathState {
  t: number; // monotonically increasing path parameter
}

// Resolves t → { from, to, segT, backward } for loop and ping-pong modes.
// loop=true:  t cycles through all n segments (including n-1 → 0 wrap-around).
// loop=false: t oscillates forward (0..n-1) then backward (n-1..0).
function getSegment(
  t: number,
  path: NpcPath,
): { from: Vec3; to: Vec3; segT: number; backward: boolean } {
  const { waypoints, loop } = path;
  const n = waypoints.length;

  let rawT: number;
  let backward = false;

  if (loop) {
    rawT = ((t % n) + n) % n;
  } else {
    const period = 2 * (n - 1);
    const wrapped = ((t % period) + period) % period;
    if (wrapped <= n - 1) {
      rawT = wrapped;
    } else {
      rawT = period - wrapped;
      backward = true;
    }
  }

  const segIdx = loop ? Math.floor(rawT) % n : Math.min(Math.floor(rawT), n - 2);
  const segT = rawT - Math.floor(rawT);
  const from = waypoints[segIdx] as Vec3;
  const to = (loop ? waypoints[(segIdx + 1) % n] : waypoints[segIdx + 1]) as Vec3;

  return { from, to, segT, backward };
}

function advancePath(state: PathState, path: NpcPath, delta: number): void {
  const { from, to } = getSegment(state.t, path);
  const dist = segmentDist(from, to);
  if (dist > 0) state.t += (path.speed * delta) / dist;
}

function samplePath(state: PathState, path: NpcPath): Vec3 {
  const { from, to, segT } = getSegment(state.t, path);
  return [from[0] + (to[0] - from[0]) * segT, 0, from[2] + (to[2] - from[2]) * segT];
}

function facingAngle(state: PathState, path: NpcPath): number {
  const { from, to, backward } = getSegment(state.t, path);
  const angle = Math.atan2(to[0] - from[0], to[2] - from[2]);
  return backward ? angle + Math.PI : angle;
}

// ── Npc component ─────────────────────────────────────────────────────────────

function Npc({ position, rotationY, animation, path, pathOffset }: NpcInstance) {
  const groupRef = useRef<THREE.Group>(null);
  const pathState = useRef<PathState>({ t: pathOffset });

  const { scene: source, animations } = useGLTF(modelUrl);
  const cloned = useMemo(() => skeletonClone(source), [source]);
  const mixer = useMemo(() => new THREE.AnimationMixer(cloned), [cloned]);

  useEffect(() => {
    const clip = THREE.AnimationClip.findByName(animations, animation as string);
    if (!clip) return;
    mixer.clipAction(clip).setLoop(THREE.LoopRepeat, Infinity).setEffectiveWeight(1).play();
    return () => {
      mixer.stopAllAction();
    };
  }, [mixer, animations, animation]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (path) {
      advancePath(pathState.current, path, delta);
      const [px, py, pz] = samplePath(pathState.current, path);
      groupRef.current.position.set(px, py, pz);
      groupRef.current.rotation.y = facingAngle(pathState.current, path);
    }

    mixer.update(delta);
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]} scale={3}>
      <primitive object={cloned} />
    </group>
  );
}

export function NPCs() {
  return (
    <group>
      {NPC_INSTANCES.map((def) => (
        <Npc key={def.id} {...def} />
      ))}
    </group>
  );
}
