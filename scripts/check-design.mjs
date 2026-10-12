#!/usr/bin/env node
/**
 * Design-floor check (CI-friendly): fails the build if the Khabar Book surface
 * regresses on the typography / colour rules of the design pass:
 *
 *   1. no Tailwind sub-floor text sizes (text-xs, text-[<14px]) in app code
 *   2. no literal hex colours in app components (tokens live in @theme /
 *      lib/palette.ts only)
 *   3. no font-size below 14px anywhere in globals.css (px sizes don't ride
 *      the clamped root, so they must also be >= 14px)
 *   4. no `letter-spacing` with a nonzero value on Bangla text (tracked Bangla
 *      conjuncts break shaping) — only Latin-only strings may track
 *   5. no raw z-index values outside the scale in globals.css or components —
 *      the scale lives in @theme (--z-*) and is the only allowed set
 *
 * Scope: the one-page surface (/, /khabar, /sera, share/modals, /r result).
 * The legacy origin/main pages kept for the backend (/admin, /top,
 * /dish/[slug], moderation components) are intentionally excluded — they were
 * never part of the redesign.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const EXCLUDE = [
  'src/app/admin',
  'src/app/top',
  'src/app/dish',
  'src/components/AdminLogin.tsx',
  'src/components/ModerateButtons.tsx',
  'src/components/PlaceModerateRow.tsx',
  'src/components/TopSpots.tsx',
];
/** Files allowed to hold raw hex: the token mirror for html-to-image clones. */
const HEX_ALLOWED = ['src/lib/palette.ts'];

const problems = [];

/** The z-index scale — the only allowed values (globals.css @theme --z-*). */
const Z_ALLOWED = new Set([
  -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 30, 40, 45, 50, 60, 70, 80,
]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = [
  ...walk(join(ROOT, 'src/components')),
  ...walk(join(ROOT, 'src/app')),
].filter((p) => /\.(tsx|ts|css)$/.test(p));

for (const abs of files) {
  const rel = relative(ROOT, abs).replaceAll('\\', '/');
  if (EXCLUDE.some((e) => rel.startsWith(e))) continue;
  const text = readFileSync(abs, 'utf8');
  const lines = text.split('\n');
  const isCss = rel.endsWith('.css');
  const allowHex = HEX_ALLOWED.includes(rel) || isCss;

  lines.forEach((line, i) => {
    const at = () => problems.push(`${rel}:${i + 1}: ${line.trim().slice(0, 120)}`);

    // 1. sub-floor Tailwind sizes
    if (/\btext-xs\b/.test(line)) at();
    for (const m of line.matchAll(/text-\[(\d+)px\]/g)) {
      if (Number(m[1]) < 14) at();
    }
    // inline-style / css font sizes below 14px
    for (const m of line.matchAll(/font(?:-size)?["']?\s*:\s*["']?(\d+(?:\.\d+)?)px/g)) {
      if (Number(m[1]) < 14) at();
    }
    for (const m of line.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)) {
      if (Number(m[1]) < 14) at();
    }

    // 2. raw hex outside the token files
    if (!allowHex && /#[0-9a-fA-F]{6}\b/.test(line)) at();

    // 4. nonzero letter-spacing on possibly-Bangla lines (Latin-only exempt)
    const ls = line.match(/letter-spacing:\s*([-\d.]+)(px|rem|em)?/);
    if (ls && Number(ls[1]) !== 0) {
      const stripped = line
        .replace(/<[^>]*>/g, '') // markup
        .replace(/letter-spacing:[^;"']+;?/, '')
        .replace(/[{};*/]|content:|var\([^)]*\)|attr\([^)]*\)/g, '');
      const bangla = stripped.match(/[ঀ-৿]/u);
      if (bangla) at(); // Bangla text tracked — banned
    }

    // 5. raw z-index values outside the scale (CSS + TSX). var(--z-*) is fine.
    if (!isCss) {
      for (const m of line.matchAll(/\bz-(\d+)\b/g)) {
        if (!Z_ALLOWED.has(Number(m[1]))) at();
      }
      for (const m of line.matchAll(/z-\[(-?\d+)\]/g)) {
        if (!Z_ALLOWED.has(Number(m[1]))) at();
      }
    }
    const zi = line.match(/z-index:\s*(-?\d+)/);
    if (zi && !Z_ALLOWED.has(Number(zi[1]))) at();
  });
}

if (problems.length) {
  console.error(`✗ design check failed (${problems.length} problem${problems.length === 1 ? '' : 's'}):`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log('✓ design check passed: no sub-floor text, no raw hex, no tracked Bangla, z-index on scale');
