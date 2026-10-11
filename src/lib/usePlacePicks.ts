'use client';
import { useCallback } from 'react';
import { postJson } from './api';
import { createLocalStore, useLocalStore } from './store';

/** Dish id → your favourite place to eat it (local cache; server via /api/place). */
const placeStore = createLocalStore<Record<number, string>>({
  key: 'foodmap:places:v1',
  fallback: {},
  parse: (raw) => {
    try {
      const o: unknown = JSON.parse(raw);
      return o && typeof o === 'object' ? (o as Record<number, string>) : {};
    } catch {
      return {};
    }
  },
  serialize: (v) => JSON.stringify(v),
});

/**
 * Place picks: same store pattern as ratings (see store.ts) — SSR-safe,
 * cross-tab sync, no setState-in-effect; the POST to /api/place is
 * best-effort and fails silently when the backend isn't configured.
 */
export function usePlacePicks() {
  const picks = useLocalStore(placeStore);

  const clearLocal = useCallback((dishId: number) => {
    const next = { ...placeStore.read() };
    delete next[dishId];
    placeStore.write(next);
  }, []);

  const pick = useCallback(
    (dishId: number, name: string | null) => {
      if (name) placeStore.write({ ...placeStore.read(), [dishId]: name });
      else clearLocal(dishId);
      postJson('/api/place', { dishId, name }).catch(() => {});
    },
    [clearLocal]
  );

  return { picks, pick, clearLocal };
}
