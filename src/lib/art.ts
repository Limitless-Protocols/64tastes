import type { Dish } from './types';

/** Photo slot content: an emoji + a two-stop gradient, with an optional real photo. */
export type Art = { e: string; a: string; b: string; photo?: string };

/**
 * Hand-picked art for the prototype's demo dishes (docs/The Khabar Book.html
 * `DISH` map). `photo` values are the Unsplash ids from the same file; the
 * slot falls back to gradient + emoji whenever an image fails to load.
 */
const BY_SLUG: Record<string, Art> = {
  'dhaka-kacchi-biryani': { e: '🍛', a: '#f0b35a', b: '#c4602a', photo: '1565557623262-b51c2513a641' },
  'tangail-porabarir-chomchom': { e: '🍮', a: '#f3c0cf', b: '#c9657e' },
  'bogura-doi': { e: '🥛', a: '#f6e8b8', b: '#d9b25a' },
  'cumilla-roshmalai': { e: '🍡', a: '#f6e3b8', b: '#e0a96a', photo: '1488477181946-6428a0291777' },
  'moulvibazar-seven-color-tea': { e: '🍵', a: '#b8d9a0', b: '#5f9a4a' },
  'sylhet-shatkora-beef-curry': { e: '🥩', a: '#e8a07a', b: '#a8452c' },
  'chattogram-mezbani-mansho': { e: '🍖', a: '#e6b07a', b: '#a8502c' },
  'coxsbazar-loitta-fry': { e: '🐟', a: '#e8c98f', b: '#a8763a', photo: '1512621776951-a57141f2eefd' },
  'natore-kachagolla': { e: '🍬', a: '#f3dcc0', b: '#d29a5c' },
  'mymensingh-muktagachhar-manda': { e: '🍯', a: '#f2d89a', b: '#c98d3a' },
  'jashore-jamtalar-rosogolla': { e: '🍡', a: '#f6e3b8', b: '#e0a96a' },
};

/** Category fallback so every dish in dishes.json gets a slot. */
const BY_CATEGORY: Record<string, Art> = {
  main: { e: '🍛', a: '#f0b35a', b: '#c4602a' },
  sweet: { e: '🍮', a: '#f3dcc0', b: '#c9657e' },
  savory: { e: '🍖', a: '#e6b07a', b: '#a8502c' },
  seafood: { e: '🐟', a: '#9fc9d6', b: '#3f7f8f' },
  drink: { e: '🍵', a: '#b8d9a0', b: '#5f9a4a' },
  staple: { e: '🫓', a: '#f2d89a', b: '#c98d3a' },
  sour: { e: '🥛', a: '#f6e8b8', b: '#d9b25a' },
};

const DEFAULT: Art = { e: '🍽️', a: '#e9b96a', b: '#c9742f' };

export function artFor(dish: Dish): Art {
  return BY_SLUG[dish.slug] ?? BY_CATEGORY[dish.category.trim()] ?? DEFAULT;
}

export function photoUrl(photo: string): string {
  return `https://images.unsplash.com/photo-${photo}?auto=format&fit=crop&w=500&q=80`;
}
