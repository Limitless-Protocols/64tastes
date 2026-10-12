import { districts, dishes } from './data';

/** NFC-normalise + casefold so Bangla and Latin match regardless of input form. */
export function norm(s: string): string {
  return s.normalize('NFC').toLowerCase().trim();
}

export type SearchHit =
  | { kind: 'district'; id: string; bn: string; en: string; districtId: string }
  | { kind: 'dish'; id: number; bn: string; en: string; districtId: string };

type Scored = { hit: SearchHit; score: number };

/**
 * Search districts AND dishes (Bangla + English). Prefix matches rank above
 * substring matches; ties keep a stable district-then-dish order. Empty query
 * returns the districts (so the list is browsable).
 */
export function searchAll(raw: string, limit = 40): SearchHit[] {
  const q = norm(raw);
  if (!q) {
    return districts
      .slice(0, limit)
      .map((d) => ({ kind: 'district', id: d.id, bn: d.nameBn, en: d.nameEn, districtId: d.id }));
  }

  const out: Scored[] = [];
  const consider = (hit: SearchHit, fields: string[]) => {
    let best = -1;
    for (const f of fields) {
      const n = norm(f);
      if (!n) continue;
      let score = -1;
      if (n.startsWith(q)) score = 2 - n.length / 1000; // prefix, shorter first
      else if (n.includes(q)) score = 1 - n.length / 1000; // substring
      if (score > best) best = score;
    }
    if (best >= 0) out.push({ hit, score: best });
  };

  for (const d of districts) {
    consider(
      { kind: 'district', id: d.id, bn: d.nameBn, en: d.nameEn, districtId: d.id },
      [d.nameBn, d.nameEn, d.id]
    );
  }
  for (const dish of dishes) {
    consider(
      { kind: 'dish', id: dish.id, bn: dish.nameBn, en: dish.nameEn, districtId: dish.districtId },
      [dish.nameBn, dish.nameEn]
    );
  }

  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit).map((s) => s.hit);
}
