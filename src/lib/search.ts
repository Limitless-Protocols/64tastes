import { districts, dishes } from './data';

/**
 * Copy-paste sprinkles zero-width and bidi marks into Bangla text (a ZWJ
 * between conjuncts, a ZWNJ from another editor, a stray BOM). They're
 * invisible, so a query typed fresh can never match a field that carries one.
 * Stripped from BOTH sides — the query and every field — before comparing.
 *
 * Listed as code points rather than a regex literal so the source stays
 * readable: these characters can't be seen in an editor or a diff.
 */
const INVISIBLE_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0x00ad, 0x00ad], // soft hyphen
  [0x200b, 0x200f], // zero-width space, ZWNJ, ZWJ, LRM, RLM
  [0x202a, 0x202e], // bidi embedding / override
  [0x2060, 0x2060], // word joiner
  [0xfeff, 0xfeff], // byte-order mark / zero-width no-break space
];

function isInvisible(cp: number): boolean {
  return INVISIBLE_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi);
}

/** NFC-normalise, drop invisibles, then casefold so Bangla and Latin match
 *  regardless of input form (typing vs paste, NFC vs NFD). */
export function norm(s: string): string {
  let out = '';
  // for…of walks by code point, so astral characters stay intact
  for (const ch of s.normalize('NFC')) {
    if (isInvisible(ch.codePointAt(0) ?? 0)) continue;
    out += ch;
  }
  return out.toLowerCase().trim();
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
