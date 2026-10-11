import { dishBySlug } from './data';
import type { Dish } from './types';

export type Leader = { dish: Dish; pct: number };

/**
 * The "most-loved / overrated" boards from the prototype (its `L` map), mapped
 * onto real dishes. Both the strip and the modal say they're demo data — real
 * lists need 20+ votes per dish.
 *
 * The prototype's Chandpur entry has no dish in dishes.json yet, so Natore's
 * Kachagolla (its other demo dish) takes that slot.
 */
const LOVE: [string, number][] = [
  ['bogura-doi', 92],
  ['cumilla-roshmalai', 90],
  ['natore-kachagolla', 88],
  ['moulvibazar-seven-color-tea', 85],
  ['tangail-porabarir-chomchom', 83],
];

const OVER: [string, number][] = [
  ['dhaka-kacchi-biryani', 38],
  ['chattogram-mezbani-mansho', 31],
  ['coxsbazar-loitta-fry', 27],
  ['sylhet-shatkora-beef-curry', 22],
  ['jashore-jamtalar-rosogolla', 18],
];

function build(rows: [string, number][]): Leader[] {
  const out: Leader[] = [];
  for (const [slug, pct] of rows) {
    const dish = dishBySlug[slug];
    if (dish) out.push({ dish, pct });
  }
  return out;
}

export const leaders: Record<'love' | 'over', Leader[]> = {
  love: build(LOVE),
  over: build(OVER),
};
