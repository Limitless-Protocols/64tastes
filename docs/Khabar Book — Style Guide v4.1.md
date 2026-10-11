# The Khabar Book — Style Guide v4

*Paper-on-desk scrapbook · one screen · Bangla first · real food photos*

v3 ("Bangla Pop") was too busy. v4 follows the **64Tastes prototype**: a calm paper book on a wooden desk, a few well-placed pieces, and motion that explains instead of decorates. Khabar Book's real system (64-district map, dish panel, reactions, tiers, share cards) lives inside it.

## 1. Composition (desktop ≥ 761px)

One CSS grid, so pieces can never overlap or scroll:

|  | Left (23%) | Centre | Right (26%) |
| --- | --- | --- | --- |
| Top | Intro (Bangla headline) | **Map** (spans 2 rows) | Food Passport (tier, ring, stats) |
| Middle | 2 polaroid dishes | ↑ | **Dish panel**: selected district, or today's special |
| Bottom | "Next up" + Surprise | Most-loved strip | ↑ |

**Mobile:** header, compact passport, map, dish panel. Everything else moves behind the nav (Top, Share). Short screens (\< 780px high) drop paragraphs, then polaroids. Nothing ever scrolls: `html,body{overflow:hidden}`, `100dvh`, `minmax(0,1fr)` rows.

## 2. Look & palette

Five colours, nothing else. Every tint and shade is derived from them in CSS (`color-mix`), so changing a token re-skins the whole app.

| Token | Hex | Role |
| --- | --- | --- |
| **Cream** | `#F8F2E8` | The page, share-card paper, cell outlines |
| **Tomato** | `#E94D2E` | Primary actions, selected district, stitch borders, stamps |
| **Mango** | `#F6C94C` | "A dish is waiting" districts, selected chip, progress accents |
| **Leaf** | `#47764A` | Eaten districts, tier name, progress, links |
| **Ink** | `#24231F` | Text, desk, borders |

**Derived:** card = cream + white · sand (no-dish districts) = cream + ink · muted text = ink + cream · `--tomato-d` (tomato + black) for small tomato text and button shadows. **Contrast:** ink on cream 14.1 · leaf on cream 4.8 · tomato-d on cream 5.5 · ink on mango 10.0 · white on leaf 5.3. **Pure tomato on cream is only 3.4 and white on tomato 3.8**, so use tomato for fills, borders, icons and large text; small tomato text uses `--tomato-d`, and button labels stay ≥ 14px bold.

- **Map states:** sand = no dish yet · **mango = dish waiting** · **leaf = eaten** (with a pin) · tomato outline = selected.
- **Desk:** charcoal (ink-based) stripes around the cream book. The paper never goes dark.
- **Bangladeshi touches (kept to four):** Bangla-first type, a faint rotating **alpona** mandala, a **nakshi-kantha** dashed stitch in every paper piece, and a **nouka** on the Bay.

## 3. Type

Tiro Bangla (serif, italic for English asides) · Hind Siliguri (UI, 400–700) · Bangla first, English second. `line-height ≥ 1.25` on Bangla; never letter-space Bangla.

## 4. Photos

Frames: **polaroid** (4:5, left column), **panel photo** (white 4px border), **round cutout** (rankings). Every slot is `.ph`: gradient + emoji underneath, real `<img>` on top, `onerror` removes the image so a failed load shows the gradient, never a broken icon. One grade for all (`saturate .92`). Subject in the central 70%, natural light, WebP ≤ 120 KB, bilingual alt text, rights recorded per image.

## 5. Motion (every piece has a job)

| Motion | Purpose |
| --- | --- |
| Pieces drop onto the desk in sequence (header → map → passport → polaroids → panel) | Orients the eye, reads as "paper settling" |
| Districts ripple in north → south | Shows the shape of the country |
| Pin pops when a dish is eaten; green fills in; confetti petals | Reward |
| Ring, bar and number animate; tier text flips and a toast announces a new badge | Progress and tiers |
| Panel content slides when selection changes | Connects tap → result |
| Chips unfold after "চেখেছি" | Rating prompt appears only when relevant |
| Polaroids float \~5px, boat drifts, leaves sway, mandala spins (140s) | Quiet life, never competing with the map |

Rules: animate `translate / rotate / scale / opacity` only (so tilts survive); at most one idle motion per piece; `prefers-reduced-motion` disables all of it.

## 6. Stylesheet (`adventure-food.css`)

Tokens at the top; pieces are `.piece` (+ stitch); layout is `main` grid areas; states are classes (`.has .done .sel .open .on`). Re-skinning or adding a country = edit tokens + data, not components.

**Checklist:** no scrollbar at 1440×900, 1280×720, 390×844, 844×390 · Bangla not clipped · photo fallback visible with images blocked · tiny districts reachable (nav "Surprise" and polaroids select too) · reduced-motion respected · share card exports in all 3 sizes.

## 7. Open decisions

Tier names/thresholds · 42 vs 64 dishes · dish ↔ district pairings (demo values) · real geoBoundaries map in place of the stylised silhouette · photo sourcing.