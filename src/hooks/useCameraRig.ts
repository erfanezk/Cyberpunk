import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { game } from '@/game';

const BEHIND = 6;
const CAM_HEIGHT = 5;
const CHEST_HEIGHT = 2.5;
const CAM_FOV = 72;

const _targetPos = new THREE.Vector3();
const _lookAt = new THREE.Vector3();

export function useCameraRig() {
  const smoothPos = useRef(new THREE.Vector3(0, CAM_HEIGHT, BEHIND));
  const smoothLook = useRef(new THREE.Vector3(0, CHEST_HEIGHT, 0));
  const initialized = useRef(false);
  const fovSet = useRef(false);

  useFrame((state) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    const time = state.clock.elapsedTime;

    _targetPos.set(
      game.position.x - game.direction.x * BEHIND,
      game.position.y + CAM_HEIGHT,
      game.position.z - game.direction.z * BEHIND,
    );

    _lookAt.set(
      game.position.x + game.direction.x * 3,
      game.position.y + CHEST_HEIGHT,
      game.position.z + game.direction.z * 3,
    );

    if (!initialized.current) {
      smoothPos.current.copy(_targetPos);
      smoothLook.current.copy(_lookAt);
      initialized.current = true;
    }

    smoothPos.current.lerp(_targetPos, 0.06);
    smoothLook.current.lerp(_lookAt, 0.08);

    const breatheY = Math.sin(time * 1.4) * 0.12;
    const breatheX = Math.cos(time * 1.1) * 0.06;

    camera.position.copy(smoothPos.current);
    camera.position.y += breatheY;
    camera.position.x += breatheX;

    camera.lookAt(smoothLook.current);

    if (!fovSet.current) {
      camera.fov = CAM_FOV;
      camera.updateProjectionMatrix();
      fovSet.current = true;
    }
  });
}
