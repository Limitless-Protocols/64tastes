'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getDeviceId } from './deviceId';

export type Rating = 'loved' | 'okay' | 'not_for_me';
export type MyRating = { rating: Rating; overrated: boolean };

const KEY = 'foodmap:ratings:v1';

export function useRatings() {
  const [ratings, setRatings] = useState<Record<number, MyRating>>({});
  const [loaded, setLoaded] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);
  const pending = useRef(new Map<number, MyRating | null>());

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

  const send = useCallback(async (dishId: number, value: MyRating | null) => {
    const res = await fetch('/api/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: getDeviceId(),
        dishId,
        rating: value?.rating ?? null,
        overrated: value?.overrated ?? false,
      }),
    });
    if (res.status === 401) {
      pending.current.set(dishId, value);
      setNeedsVerify(true);
    }
  }, []);

  const rate = useCallback(
    (dishId: number, value: MyRating | null) => {
      setRatings((prev) => {
        const next = { ...prev };
        if (value) next[dishId] = value;
        else delete next[dishId];
        return next;
      });
      send(dishId, value).catch(() => {});
    },
    [send]
  );

  const verify = useCallback(
    async (token: string) => {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: getDeviceId(), token }),
      });
      setNeedsVerify(false);
      if (!res.ok) return;
      const queued = [...pending.current.entries()];
      pending.current.clear();
      for (const [dishId, value] of queued) await send(dishId, value).catch(() => {});
    },
    [send]
  );

  return { ratings, rate, needsVerify, verify };
}