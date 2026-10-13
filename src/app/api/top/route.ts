import { connection, NextResponse } from 'next/server';

// Note: with nextConfig.cacheComponents, `export const dynamic` is not
// allowed — a handler without 'use cache' is simply dynamic (uncached).

const pct = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);

/**
 * Read-only leaderboard feed for the সেরা view. The /top page computes the
 * same thing server-side; this exists so the one-page app can fetch it
 * without navigating. Returns 503 when the database isn't configured —
 * callers fall back to the demo boards in lib/leaders.ts.
 *
 * The stats/spots modules are imported lazily inside the handler: db.ts
 * throws at module-eval time without DATABASE_URL, which would otherwise
 * turn into a raw 500 before this route can answer.
 */
export async function GET() {
  // Defer to request time so `next build` never runs this handler (and its
  // 'use cache' DB queries) against a build environment without DATABASE_URL.
  // Without it the prerender throws, and the try/catch below would swallow
  // that bail-out and statically bake a 503 into the route.
  await connection();

  try {
    const { getDishStats } = await import('@/lib/stats');
    const { buildRankings } = await import('@/lib/ranking');
    const { getTopSpots } = await import('@/lib/spots');

    const { mostLoved, mostOverrated, districtRows } = buildRankings(await getDishStats());
    const top = mostLoved[0];
    const spots = top ? await getTopSpots(top.dish.id) : [];
    return NextResponse.json({
      mostLoved: mostLoved.map((r) => ({ id: r.dish.id, pct: pct(r.stat.loved, r.stat.votes) })),
      mostOverrated: mostOverrated.map((r) => ({ id: r.dish.id, pct: pct(r.stat.overrated, r.stat.votes) })),
      districtRows: districtRows.map((r) => ({ id: r.district.id, pct: pct(r.loved, r.votes) })),
      spots,
      spotsDishId: top?.dish.id ?? null,
      empty: mostLoved.length === 0 && districtRows.length === 0,
    });
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
