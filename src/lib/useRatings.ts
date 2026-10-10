'use client';
import { useCallback, useEffect, useState } from 'react';
import { postJson } from './api';

export type Rating = 'loved' | 'okay' | 'not_for_me';
export type MyRating = { rating: Rating; overrated: boolean };

const KEY = 'foodmap:ratings:v1';

export function useRatings() {
  const [ratings, setRatings] = useState<Record<number, MyRating>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setRatings(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(ratings));
    } catch {
      // ignore
    }
  }, [ratings, loaded]);

  const rate = useCallback((dishId: number, value: MyRating | null) => {
    setRatings((prev) => {
      const next = { ...prev };
      if (value) next[dishId] = value;
      else delete next[dishId];
      return next;
    });
    postJson('/api/rate', {
      dishId,
      rating: value?.rating ?? null,
      overrated: value?.overrated ?? false,
    }).catch(() => {});
  }, []);

  return { ratings, rate };
}