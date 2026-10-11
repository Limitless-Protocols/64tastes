'use client';
import { useSyncExternalStore } from 'react';

/**
 * A tiny external store backed by localStorage.
 *
 * Why not `useState` + `useEffect`? Because reading storage in an effect and
 * calling `setState` there is exactly what `react-hooks/set-state-in-effect`
 * forbids (cascading renders), and it is also the wrong model: localStorage is
 * an *external system*, so React's own API for it is `useSyncExternalStore`.
 * That gives us, for free:
 *   - no effect → no extra render pass on mount, no lint error;
 *   - a stable server snapshot → no hydration mismatch;
 *   - cross-tab sync via the `storage` event.
 */

type Listener = () => void;

export type LocalStore<T> = {
  /** Current value (reads + caches localStorage on first call). */
  read: () => T;
  /** Replace the value, persist it and notify subscribers. */
  write: (next: T) => void;
  /** Subscribe to changes (React passes this straight to the hook). */
  subscribe: (cb: Listener) => () => void;
  /** Snapshot used for SSR/hydration — always the same reference. */
  serverSnapshot: () => T;
};

export function createLocalStore<T>(options: {
  key: string;
  fallback: T;
  parse: (raw: string) => T;
  serialize: (value: T) => string;
}): LocalStore<T> {
  const { key, fallback, parse, serialize } = options;
  let cache: T | undefined; // undefined = not read yet
  const listeners = new Set<Listener>();

  function read(): T {
    if (cache !== undefined) return cache;
    let value = fallback;
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) value = parse(raw);
      } catch {
        // private mode, quota, or corrupted JSON → keep the fallback
      }
    }
    cache = value;
    return value;
  }

  function write(next: T) {
    cache = next;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, serialize(next));
      } catch {
        // ignore (private mode, storage full)
      }
    }
    for (const cb of listeners) cb();
  }

  function onStorage(e: StorageEvent) {
    if (e.key !== key) return;
    cache = undefined; // another tab wrote → re-read on the next snapshot
    for (const cb of listeners) cb();
  }

  function subscribe(cb: Listener): () => void {
    listeners.add(cb);
    if (listeners.size === 1) window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(cb);
      if (listeners.size === 0) window.removeEventListener('storage', onStorage);
    };
  }

  return { read, write, subscribe, serverSnapshot: () => fallback };
}

const noSubscribe = () => () => {};
const clientOnly = () => true;
const serverOnly = () => false;

/** True once the client has taken over from the server-rendered markup. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noSubscribe, clientOnly, serverOnly);
}

/** Subscribe to a store. The server always sees its fallback value. */
export function useLocalStore<T>(store: LocalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.read, store.serverSnapshot);
}
