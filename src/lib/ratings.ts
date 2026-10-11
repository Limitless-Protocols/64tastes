import { createLocalStore } from './store';

/** Style guide §5 — three reactions; "overrated" is a separate flag on top. */
export type Rating = 'love' | 'ok' | 'skip';
export type MyRating = { rating: Rating; overrated: boolean };

export const RATING_OPTIONS: { v: Rating; bn: string; en: string; e: string }[] = [
  { v: 'love', bn: 'দারুণ', en: 'Love it', e: '😍' },
  { v: 'ok', bn: 'মোটামুটি', en: 'Okay', e: '🙂' },
  { v: 'skip', bn: 'পছন্দ হয়নি', en: 'Not for me', e: '😕' },
];

/** Older versions of this store kept plain strings (including the old fourth
 *  reaction 'over'); the server model uses wire names. Both migrate on read. */
const WIRE: Record<string, Rating> = { loved: 'love', okay: 'ok', not_for_me: 'skip', over: 'ok' };

function migrate(v: unknown): MyRating | null {
  if (typeof v === 'string') return { rating: WIRE[v] ?? 'ok', overrated: v === 'over' };
  if (v && typeof v === 'object' && 'rating' in v) {
    const o = v as { rating?: unknown; overrated?: unknown };
    return { rating: WIRE[String(o.rating)] ?? 'ok', overrated: Boolean(o.overrated) };
  }
  return null;
}

/** localStorage-backed ratings: dish id → the reaction you gave it. */
export const ratingsStore = createLocalStore<Record<number, MyRating>>({
  key: 'foodmap:ratings:v1',
  fallback: {},
  parse: (raw) => {
    try {
      const o: unknown = JSON.parse(raw);
      if (!o || typeof o !== 'object') return {};
      const out: Record<number, MyRating> = {};
      for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
        const m = migrate(v);
        if (m) out[Number(k)] = m;
      }
      return out;
    } catch {
      return {};
    }
  },
  serialize: (v) => JSON.stringify(v),
});
