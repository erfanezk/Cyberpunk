import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CAMERA_PATH_POINTS, SECTION_ANCHORS } from '@/constants';

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

// Piecewise ease across section anchors so the camera dwells on each overlay
// then pushes into the next, instead of moving at constant scroll-speed.
function cinematicRemap(t: number): number {
  for (let i = 0; i < SECTION_ANCHORS.length - 1; i++) {
    const a = SECTION_ANCHORS[i];
    const b = SECTION_ANCHORS[i + 1];
    if (t <= b) {
      const local = (t - a) / (b - a);
      return a + easeInOutCubic(local) * (b - a);
    }
  }
  return t;
}

export function useCameraRig(scroll: { offset: number }) {
  const lookAtTarget = useRef(new THREE.Vector3());
  const currentPos = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());
  const currentRoll = useRef(0);
  const currentFov = useRef(60);
  const initialized = useRef(false);

  const curve = useMemo(() => {
    const points = CAMERA_PATH_POINTS.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.4);
  }, []);

  useFrame((state) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    const raw = scroll.offset;

    if (!Number.isFinite(raw)) return;
    const rawT = Math.max(0, Math.min(1, raw));
    const t = cinematicRemap(rawT);
    const time = state.clock.elapsedTime;

    // Stronger look-ahead during fast beats, near-zero during dwells
    const tangentMag = curve.getTangentAt(Math.min(t + 0.001, 1)).length();
    const lookAhead = 0.018 + tangentMag * 0.025;
    const targetPos = curve.getPointAt(t);
    const targetLookAt = curve.getPointAt(Math.min(t + lookAhead, 1));

    if (!initialized.current) {
      currentPos.current.copy(targetPos);
      currentLookAt.current.copy(targetLookAt);
      camera.position.copy(targetPos);
      lookAtTarget.current.copy(targetLookAt);
      camera.lookAt(targetLookAt);
      initialized.current = true;
      return;
    }

    // Slower lerp = more "drifty" cinematic feel; tighter on quick beats
    const speed = Math.min(1, tangentMag * 0.6);
    const posLerp = 0.025 + speed * 0.04;
    const lookLerp = 0.04 + speed * 0.05;
    currentPos.current.lerp(targetPos, posLerp);
    currentLookAt.current.lerp(targetLookAt, lookLerp);

    // Organic camera breathing — multi-frequency for less mechanical feel
    const breatheY = Math.sin(time * 0.35) * 0.22 + Math.sin(time * 0.83) * 0.1;
    const breatheX = Math.cos(time * 0.27) * 0.14 + Math.sin(time * 0.61) * 0.06;

    // Subtle handheld jitter that scales with movement speed
    const jitter = speed * 0.08;
    const jitterX = (Math.sin(time * 7.3) + Math.sin(time * 11.7)) * jitter;
    const jitterY = (Math.cos(time * 8.1) + Math.cos(time * 13.2)) * jitter;

    // Stronger camera roll — banking when path turns
    const tangent = curve.getTangentAt(t);
    const nextTangent = curve.getTangentAt(Math.min(t + 0.015, 1));
    const turnRate = tangent.x - nextTangent.x;
    const targetRoll = -turnRate * 14;
    currentRoll.current += (targetRoll - currentRoll.current) * 0.025;

    // Final cinematic pull-back: ease into a wide reveal during contact ending.
    // Crossfades position higher/back and widens FOV between t = 0.92 and 1.0.
    const endBlend = Math.max(0, Math.min(1, (rawT - 0.92) / 0.08));
    const endEase = easeInOutCubic(endBlend);
    const pullbackY = endEase * 18;
    const pullbackZ = endEase * 35;

    camera.position.set(
      currentPos.current.x + breatheX + jitterX,
      currentPos.current.y + breatheY + jitterY + pullbackY,
      currentPos.current.z + pullbackZ,
    );

    lookAtTarget.current.copy(currentLookAt.current);
    camera.lookAt(lookAtTarget.current);

    // Roll fades out on the final pull-back so the horizon settles
    camera.rotation.z += currentRoll.current * (1 - endEase);

    // FOV: punch in (tighter) during dwells, wider during transitions; pull
    // back wider on the cinematic ending for the "reveal" beat.
    const heightDiff = tangent.y;
    const speedFov = 58 + speed * 6 - heightDiff * 12;
    const targetFov = THREE.MathUtils.lerp(speedFov, 78, endEase);
    currentFov.current += (targetFov - currentFov.current) * 0.025;
    camera.fov = currentFov.current;
    camera.updateProjectionMatrix();
  });
}
