import { createLocalStore } from './store';

/** Style guide §5 — four reactions, Bangla first. */
export type Rating = 'love' | 'ok' | 'skip' | 'over';

export const RATING_OPTIONS: { v: Rating; bn: string; en: string; e: string }[] = [
  { v: 'love', bn: 'দারুণ', en: 'Love it', e: '😍' },
  { v: 'ok', bn: 'মোটামুটি', en: 'Okay', e: '😀' },
  { v: 'skip', bn: 'পছন্দ হয়নি', en: 'Not for me', e: '😕' },
  { v: 'over', bn: 'ওভারেটেড', en: 'Overrated', e: '🙄' },
];

/** localStorage-backed ratings: dish id → the reaction you gave it. */
export const ratingsStore = createLocalStore<Record<number, Rating>>({
  key: 'foodmap:ratings:v1',
  fallback: {},
  parse: (raw) => {
    try {
      const o: unknown = JSON.parse(raw);
      return o && typeof o === 'object' ? (o as Record<number, Rating>) : {};
    } catch {
      return {};
    }
  },
  serialize: (v) => JSON.stringify(v),
});
