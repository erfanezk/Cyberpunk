import * as THREE from 'three';

export type ActionName = 'jump' | 'punch' | 'crouch' | 'roll';

type ActionListener = (action: ActionName) => void;

class Game {
  started = false;
  readonly position = new THREE.Vector3(0, 0, 0);
  readonly direction = new THREE.Vector3(0, 0, -1);
  private listeners = new Set<ActionListener>();

  publishState(group: THREE.Group, pos: THREE.Vector3): void {
    this.position.copy(pos);
    this.direction.set(Math.sin(group.rotation.y), 0, Math.cos(group.rotation.y));
  }

  trigger(action: ActionName): void {
    for (const listener of this.listeners) listener(action);
  }

  subscribe(listener: ActionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const game = new Game();
