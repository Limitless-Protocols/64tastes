'use client';
import { useCallback } from 'react';
import { ratingsStore, RATING_OPTIONS, type Rating } from './ratings';
import { useLocalStore } from './store';

export { RATING_OPTIONS, type Rating };

/** Thin hook over the ratings localStorage store (see store.ts for why). */
export function useRatings() {
  const ratings = useLocalStore(ratingsStore);

  const setRating = useCallback((id: number, r: Rating) => {
    ratingsStore.write({ ...ratingsStore.read(), [id]: r });
  }, []);

  /** Polaroid heart: toggle the "love" reaction. */
  const toggleLove = useCallback((id: number) => {
    const next = { ...ratingsStore.read() };
    if (next[id] === 'love') delete next[id];
    else next[id] = 'love';
    ratingsStore.write(next);
  }, []);

  return { ratings, setRating, toggleLove };
}
