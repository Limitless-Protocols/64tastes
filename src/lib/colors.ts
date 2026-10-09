import { dishesByDistrict } from './data';

export function districtFill(id: string, eaten: Set<number>): string {
  const list = dishesByDistrict[id] ?? [];
  if (list.length === 0) return '#e5e7eb';
  const n = list.filter((d) => eaten.has(d.id)).length;
  if (n === 0) return '#fef3c7';
  if (n < list.length) return '#6ee7b7';
  return '#059669';
}