type Pt = [number, number];

import polylabel from 'polylabel';

/**
 * A point near the middle of a district, where its pin sits.
 *
 * The geoBoundaries paths in districtPaths.json only use absolute `M … Z`
 * subpaths, so parsing them into polygons is a small job. The anchor is the
 * pole of inaccessibility (polylabel) of the largest subpath — the deepest
 * interior point, which never lands on a concave district's edge. If that
 * somehow falls outside, we fall back to the deepest point on a coarse grid.
 */

function polygons(d: string): Pt[][] {
  const out: Pt[][] = [];
  let nums: number[] = [];
  const flush = () => {
    if (nums.length >= 4) {
      const poly: Pt[] = [];
      for (let i = 0; i + 1 < nums.length; i += 2) poly.push([nums[i], nums[i + 1]]);
      out.push(poly);
    }
    nums = [];
  };
  for (const tok of d.match(/[A-Za-z]|-?\d*\.?\d+/g) ?? []) {
    if (/[A-Za-z]/.test(tok)) {
      const cmd = tok.toUpperCase();
      if (cmd === 'M') flush();
      continue; // Z and friends: the numbers were already streamed
    }
    nums.push(Number(tok));
  }
  flush();
  return out;
}

function area(poly: Pt[]): number {
  let a = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    a += poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1];
  }
  return a / 2;
}

function inside(x: number, y: number, poly: Pt[]): boolean {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function distToEdges(x: number, y: number, poly: Pt[]): number {
  let best = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [x1, y1] = poly[j];
    const [x2, y2] = poly[i];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    const t = len2 ? Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / len2)) : 0;
    const px = x1 + t * dx - x;
    const py = y1 + t * dy - y;
    const dist = Math.hypot(px, py);
    if (dist < best) best = dist;
  }
  return best;
}

const cache = new Map<string, Pt>();

export function districtAnchor(d: string): Pt {
  const hit = cache.get(d);
  if (hit) return hit;

  const polys = polygons(d).filter((p) => p.length >= 3);
  let best: Pt = [0, 0];
  if (polys.length) {
    const main = polys.reduce((a, b) => (Math.abs(area(a)) >= Math.abs(area(b)) ? a : b));

    const anyInside = (x: number, y: number) => polys.some((p) => inside(x, y, p));
    // Pole of inaccessibility — the deepest interior point.
    const pole = polylabel([main], 0.5) as unknown as Pt;
    best = [pole[0], pole[1]];

    if (!anyInside(best[0], best[1])) {
      // Concave district (or a hole): take the deepest interior grid point.
      const pts = polys.flat();
      const x0 = Math.min(...pts.map((p) => p[0]));
      const x1 = Math.max(...pts.map((p) => p[0]));
      const y0 = Math.min(...pts.map((p) => p[1]));
      const y1 = Math.max(...pts.map((p) => p[1]));
      let deep = 0;
      for (let gx = 0; gx <= 16; gx++) {
        for (let gy = 0; gy <= 16; gy++) {
          const x = x0 + ((x1 - x0) * gx) / 16;
          const y = y0 + ((y1 - y0) * gy) / 16;
          if (!anyInside(x, y)) continue;
          const dist = Math.min(...polys.map((p) => distToEdges(x, y, p)));
          if (dist > deep) {
            deep = dist;
            best = [x, y];
          }
        }
      }
    }
  }

  cache.set(d, best);
  return best;
}
