import { dishesByDistrict } from './data';
import { DERIVED, PALETTE } from './palette';

/** Style guide §2 — the map has exactly three states. */
export type DistrictTone = 'no' | 'has' | 'done';

/**
 * sand = no dish yet · mango = dish waiting · leaf = eaten (with a pin).
 * A district counts as eaten as soon as one of its dishes is (today every
 * district has at most one dish, so this is simply "the dish is eaten").
 */
export function districtTone(id: string, eaten: Set<number>): DistrictTone {
  const list = dishesByDistrict[id] ?? [];
  if (list.length === 0) return 'no';
  if (list.some((d) => eaten.has(d.id))) return 'done';
  return 'has';
}

/** Same three states as hexes, for SVGs cloned outside the stylesheet (share cards). */
const FILLS: Record<DistrictTone, string> = {
  no: DERIVED.sand,
  has: PALETTE.mango,
  done: PALETTE.leaf,
};

export function districtFill(id: string, eaten: Set<number>): string {
  return FILLS[districtTone(id, eaten)];
}
