import { dishesByDistrict } from './data';

export type DistrictTone = 'empty' | 'new' | 'partial' | 'complete';

/** How much of a district's dishes have been eaten. */
export function districtTone(id: string, eaten: Set<number>): DistrictTone {
  const list = dishesByDistrict[id] ?? [];
  if (list.length === 0) return 'empty';
  const n = list.filter((d) => eaten.has(d.id)).length;
  if (n === 0) return 'new';
  if (n < list.length) return 'partial';
  return 'complete';
}

const FILLS: Record<DistrictTone, string> = {
  empty: '#c5cebc',
  new: '#E1C714',
  partial: '#F0BE64',
  complete: '#3D852D',
};

export function districtFill(id: string, eaten: Set<number>): string {
  return FILLS[districtTone(id, eaten)];
}
