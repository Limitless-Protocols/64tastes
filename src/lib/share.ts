import { dishes } from './data';

const maxId = Math.max(...dishes.map((d) => d.id));

export function encodeProgress(eaten: Set<number>): string {
  const bytes = new Uint8Array(Math.ceil((maxId + 1) / 8));
  for (const id of eaten) {
    if (id >= 0 && id <= maxId) bytes[id >> 3] |= 1 << (id & 7);
  }
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeProgress(code: string): Set<number> {
  const eaten = new Set<number>();
  try {
    const b64 = code.slice(0, 64).replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
    for (const d of dishes) {
      if (bin.charCodeAt(d.id >> 3) & (1 << (d.id & 7))) eaten.add(d.id);
    }
  } catch {
    // bad code: return an empty set
  }
  return eaten;
}