import * as THREE from 'three';

class Game {
  readonly position = new THREE.Vector3(0, 0, 0);
  readonly direction = new THREE.Vector3(0, 0, -1);

  publishState(group: THREE.Group, pos: THREE.Vector3): void {
    this.position.copy(pos);
    this.direction.set(Math.sin(group.rotation.y), 0, Math.cos(group.rotation.y));
  }
}

export const game = new Game();
