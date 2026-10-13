'use client';
import { useCallback } from 'react';
import { postJson } from './api';
import { ratingsStore, RATING_OPTIONS, type MyRating, type Rating } from './ratings';
import { useLocalStore } from './store';

export { RATING_OPTIONS, type MyRating, type Rating };

/** Client short names → the wire names api/rate expects. */
const WIRE: Record<Rating, string> = { love: 'loved', ok: 'okay', skip: 'not_for_me' };

/**
 * Ratings hook. The store underneath handles SSR, persistence and cross-tab
 * sync (see store.ts for why); every change is additionally best-effort
 * synced to the server so the সেরা boards aggregate real votes.
 * No DATABASE_URL / offline / rate-limited → the local value still updates
 * and the POST fails silently, so the UI never breaks over the network.
 */
export function useRatings() {
  const ratings = useLocalStore(ratingsStore);

  const rate = useCallback((id: number, value: MyRating | null) => {
    const next = { ...ratingsStore.read() };
    if (value) next[id] = value;
    else delete next[id];
    ratingsStore.write(next);
    postJson('/api/rate', {
      dishId: id,
      rating: value ? WIRE[value.rating] : null,
      overrated: value?.overrated ?? false,
    }).catch(() => {});
  }, []);

  /** Polaroid heart: toggle the "love" reaction. */
  const toggleLove = useCallback(
    (id: number) => {
      const cur = ratingsStore.read()[id];
      rate(id, cur?.rating === 'love' ? null : { rating: 'love', overrated: cur?.overrated ?? false });
    },
    [rate]
  );

  /** The 🙄 chip: flip the overrated flag on the current reaction. */
  const toggleOverrated = useCallback(
    (id: number) => {
      const cur = ratingsStore.read()[id];
      if (!cur) return rate(id, { rating: 'ok', overrated: true });
      rate(id, { ...cur, overrated: !cur.overrated });
    },
    [rate]
  );

  return { ratings, rate, toggleLove, toggleOverrated };
}
