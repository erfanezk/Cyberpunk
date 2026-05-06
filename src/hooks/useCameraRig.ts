import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CAMERA_PATH_POINTS } from '@/constants';

export function useCameraRig(scroll: { offset: number }) {
  const lookAtTarget = useRef(new THREE.Vector3());

  const curve = useMemo(() => {
    const points = CAMERA_PATH_POINTS.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    return new THREE.CatmullRomCurve3(points);
  }, []);

  useFrame((state) => {
    const camera = state.camera;
    const t = scroll.offset;
    const position = curve.getPointAt(t);
    const lookAtPoint = curve.getPointAt(Math.min(t + 0.015, 1));
    camera.position.lerp(position, 0.05);
    lookAtTarget.current.lerp(lookAtPoint, 0.05);
    camera.lookAt(lookAtTarget.current);
  });
}
