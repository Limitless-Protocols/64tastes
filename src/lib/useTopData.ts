'use client';
import { useEffect, useState } from 'react';

export type TopRow = { id: number; pct: number };
export type DistrictRow = { id: string; pct: number };
export type SpotRow = { id: string; name: string; picks: number };
export type TopData = {
  mostLoved: TopRow[];
  mostOverrated: TopRow[];
  districtRows: DistrictRow[];
  spots: SpotRow[];
  spotsDishId: number | null;
  empty: boolean;
};

/**
 * Real leaderboard data from GET /api/top. `null` while loading — and stays
 * null when the backend is unavailable (no DATABASE_URL / DB asleep), which
 * callers treat as "use the demo boards from lib/leaders.ts".
 */
export function useTopData(): TopData | null {
  const [data, setData] = useState<TopData | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/top')
      .then((r) => (r.ok ? (r.json() as Promise<TopData>) : null))
      .then((j) => {
        if (alive && j && Array.isArray(j.mostLoved)) setData(j);
      })
      .catch(() => {
        // offline / no backend — demo fallback in the callers
      });
    return () => {
      alive = false;
    };
  }, []);

  return data;
}
