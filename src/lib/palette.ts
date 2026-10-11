import type { CSSProperties } from 'react';

/**
 * The Khabar Book palette — the TypeScript mirror of the CSS tokens in
 * `src/app/globals.css` (`:root`).
 *
 * CSS variables cover everything the browser paints, but two places cannot
 * see the stylesheet:
 *   1. the share-card PNG — `html-to-image` clones the node into a standalone
 *      SVG, so `var(--leaf)` would resolve to nothing;
 *   2. SVG `fill` attributes on `MiniMap` (same reason when it is cloned).
 *
 * Keep the hexes in sync with `:root` in globals.css — the comment above each
 * group says which token it is.
 */
export const PALETTE = {
  /* base palette (5 colours, nothing else) */
  cream: '#F8F2E8',
  tomato: '#E94D2E',
  mango: '#F6C94C',
  leaf: '#47764A',
  ink: '#24231F',
} as const;

/** Derived tints/shades — the `color-mix()` results from globals.css. */
export const DERIVED = {
  paper: PALETTE.cream, // --paper
  card: '#FCF9F5', // --card   cream 45% + white
  sand: '#D2CDC4', // --sand   cream 82% + ink
  muted: '#75726B', // --muted  ink 62% + cream
  body: '#4E4C47', // --body   ink 80% + cream
  edge: '#C9C4BC', // --edge   cream 78% + ink
  leaf2: '#87A689', // --leaf-2 leaf 65% + white
  leafD: '#335535', // --leaf-d leaf 72% + black
  tomatoD: '#A83721', // --tomato-d tomato 72% + black
} as const;

export const TOKENS = { ...PALETTE, ...DERIVED };

/** The nakshi-kantha stitch colour (globals.css `--stitch`). */
export const STITCH = 'rgb(233 77 46 / 0.35)';

/** Inline `style` that re-declares the tokens inside a subtree (share card). */
export const tokenVars = {
  '--cream': PALETTE.cream,
  '--tomato': PALETTE.tomato,
  '--mango': PALETTE.mango,
  '--leaf': PALETTE.leaf,
  '--ink': PALETTE.ink,
  '--paper': DERIVED.paper,
  '--card': DERIVED.card,
  '--sand': DERIVED.sand,
  '--muted': DERIVED.muted,
  '--body': DERIVED.body,
  '--edge': DERIVED.edge,
  '--leaf-2': DERIVED.leaf2,
  '--tomato-d': DERIVED.tomatoD,
} as CSSProperties;
