'use client';
import { useCallback, useEffect, useState } from 'react';
import { postJson } from './api';

const KEY = 'foodmap:places:v1';

export function usePlacePicks() {
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPicks(JSON.parse(raw));
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(picks));
    } catch {
      // ignore
    }
  }, [picks, loaded]);

  const clearLocal = useCallback((dishId: number) => {
    setPicks((prev) => {
      const next = { ...prev };
      delete next[dishId];
      return next;
    });
  }, []);

    const pick = useCallback(
        (dishId: number, name: string | null) => {
            if (name) setPicks((prev) => ({ ...prev, [dishId]: name }));
            else clearLocal(dishId);
            postJson('/api/place', { dishId, name }).catch(() => {});
        },
        [clearLocal]
    );

  return { picks, pick, clearLocal };
}