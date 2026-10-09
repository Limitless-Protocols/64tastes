'use client';
import { useCallback, useEffect, useState } from 'react';
import { dishes } from './data';

const KEY = 'foodmap:progress:v1';
const validIds = new Set(dishes.map((d) => d.id));

export function useProgress() {
  const [eaten, setEaten] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  // Read saved progress after the page loads (the server has no localStorage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const ids: number[] = JSON.parse(raw);
        setEaten(new Set(ids.filter((id) => validIds.has(id))));
      }
    } catch {
      // ignore corrupted or unavailable storage
    }
    setLoaded(true);
  }, []);

  // Save whenever progress changes (but only after the first load)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify([...eaten]));
    } catch {
      // ignore (private mode, storage full)
    }
  }, [eaten, loaded]);

  const toggle = useCallback((id: number) => {
    setEaten((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const reset = useCallback(() => setEaten(new Set()), []);

  return { eaten, toggle, reset };
}