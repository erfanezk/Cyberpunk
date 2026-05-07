import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CAMERA_PATH_POINTS } from '@/constants';

export function useCameraRig(scroll: { offset: number }) {
  const lookAtTarget = useRef(new THREE.Vector3());
  const currentPos = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());
  const currentRoll = useRef(0);
  const baseFov = useRef(60);
  const initialized = useRef(false);

  const curve = useMemo(() => {
    const points = CAMERA_PATH_POINTS.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    return new THREE.CatmullRomCurve3(points);
  }, []);

  useFrame((state) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    const t = scroll.offset;
    const time = state.clock.elapsedTime;

    // Dynamic look-ahead: look further ahead for smoother, more cinematic turns
    const lookAhead = 0.02 + Math.abs(Math.sin(t * Math.PI * 2)) * 0.01;
    const targetPos = curve.getPointAt(t);
    const targetLookAt = curve.getPointAt(Math.min(t + lookAhead, 1));

    // Initialize on first frame to avoid jump
    if (!initialized.current) {
      currentPos.current.copy(targetPos);
      currentLookAt.current.copy(targetLookAt);
      camera.position.copy(targetPos);
      lookAtTarget.current.copy(targetLookAt);
      camera.lookAt(targetLookAt);
      initialized.current = true;
      return;
    }

    // Smooth position with variable lerp (slower = more cinematic drift)
    const posLerp = 0.04;
    const lookLerp = 0.06;
    currentPos.current.lerp(targetPos, posLerp);
    currentLookAt.current.lerp(targetLookAt, lookLerp);

    // Camera breathing — subtle organic Y-axis oscillation
    const breathe = Math.sin(time * 0.4) * 0.15 + Math.sin(time * 0.7) * 0.08;

    // Camera roll on curves — bank the camera when the path turns
    const tangent = curve.getTangentAt(t);
    const nextTangent = curve.getTangentAt(Math.min(t + 0.01, 1));
    const turnRate = tangent.x - nextTangent.x;
    const targetRoll = -turnRate * 8;
    currentRoll.current += (targetRoll - currentRoll.current) * 0.03;

    // Apply position with breathing
    camera.position.set(
      currentPos.current.x,
      currentPos.current.y + breathe,
      currentPos.current.z,
    );

    // Apply lookAt
    lookAtTarget.current.copy(currentLookAt.current);
    camera.lookAt(lookAtTarget.current);

    // Apply roll
    camera.rotation.z += currentRoll.current;

    // Speed-based FOV: zoom in slightly when descending, wider when rising
    const heightDiff = tangent.y;
    const targetFov = 60 - heightDiff * 15;
    camera.fov += (targetFov - camera.fov) * 0.02;
    camera.updateProjectionMatrix();
  });
}
