# Bangladesh Food Map (64tastes)

An interactive map of Bangladesh's districts. Tap a district to see its famous dishes and check
off the ones you've eaten; your progress and current "taster tier" update as you go.

Built with [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript, and Tailwind CSS 4.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run lint` | ESLint (flat config in `eslint.config.mjs`) |
| `npx tsc --noEmit` | Typecheck (no `typecheck` script exists; `npm run build` typechecks too) |
| `npm run build` | Production build |

There is no test suite or CI workflow (yet).

### Build requires `DATABASE_URL`

`npm run build` prerenders `/api/health`, which pings Neon and fails the build if
`DATABASE_URL` is missing. The repo ships no `.env*` file (they're gitignored), so a fresh clone
cannot build as-is. Set a Neon connection string before building:

```bash
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" npm run build
```

## Project layout

```
src/
  app/            Next.js App Router: page.tsx (the whole UI), api/health, api/og-test
  components/     FoodMap.tsx (SVG map + progress), DistrictSheet.tsx (dish list)
  lib/            data.ts (single data access point), useProgress.ts, tiers.ts, types.ts
  data/           districts.json, dishes.json, districtPaths.json (SVG geometry)
  assets/         NotoSansBengali-Bold.ttf (used by the OG image route)
```

All content lives in `src/data/*.json` and is read through `src/lib/data.ts`, which builds the
derived indexes (`dishesByDistrict`, `districtById`, `totalDishes`). Import from `@/lib/data`
rather than the JSON files directly.

Progress is stored in the browser under the localStorage key `foodmap:progress:v1` — there is no
backend or account system.

## Notes

- Path alias: `@/*` maps to `./src/*`.
- The JSON content files are UTF-8 with Bengali text. If they look like garbled characters in a
  Windows terminal, that's a display issue — don't re-encode them.
- Tailwind 4 is loaded through a Turbopack rule in `next.config.ts`; there is no PostCSS config.
- District path data comes from [geoBoundaries](https://www.geoboundaries.org/).

## Deploy

Deploys on [Vercel](https://vercel.com). Remember the `DATABASE_URL` env var, or remove/prerender-guard
`/api/health` first — see above.
