export type FragmentId = 'bio' | 'skills' | 'projects' | 'articles' | 'contact';

type UnlockListener = (id: FragmentId) => void;

class Memory {
  private unlocked = new Set<FragmentId>();
  private listeners = new Set<UnlockListener>();

  unlock(id: FragmentId): void {
    if (this.unlocked.has(id)) return;
    this.unlocked.add(id);
    for (const fn of this.listeners) fn(id);
  }

  isUnlocked(id: FragmentId): boolean {
    return this.unlocked.has(id);
  }

  subscribe(fn: UnlockListener): () => void {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  reset(): void {
    this.unlocked.clear();
  }
}

export const memory = new Memory();
