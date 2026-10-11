'use client';
import { useCallback, useMemo } from 'react';
import { dishes } from './data';
import { createLocalStore, useHydrated, useLocalStore } from './store';

const validIds = new Set(dishes.map((d) => d.id));

/** Progress: the ids of the dishes you've eaten (key kept from earlier versions). */
export const progressStore = createLocalStore<number[]>({
  key: 'foodmap:progress:v1',
  fallback: [],
  parse: (raw) => {
    try {
      const ids: unknown = JSON.parse(raw);
      return Array.isArray(ids)
        ? ids.filter((id): id is number => typeof id === 'number' && validIds.has(id))
        : [];
    } catch {
      return [];
    }
  },
  serialize: (v) => JSON.stringify(v),
});

/** Thin hook over the progress localStorage store (see store.ts for why). */
export function useProgress() {
  const ids = useLocalStore(progressStore);
  const hydrated = useHydrated();
  const eaten = useMemo(() => new Set(ids), [ids]);

  const toggle = useCallback((id: number) => {
    const next = new Set(progressStore.read());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    progressStore.write([...next]);
  }, []);

  const reset = useCallback(() => progressStore.write([]), []);

  return { eaten, toggle, reset, loaded: hydrated };
}
