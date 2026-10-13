import MiniMap from './MiniMap';
import { STITCH, TOKENS } from '@/lib/palette';
import { districtById, dishById, totalDishes } from '@/lib/data';
import { getTier } from '@/lib/tiers';
import { bn } from '@/lib/format';
import { SITE_HOST } from '@/lib/site';

export const FORMATS = {
  landscape: { w: 1200, h: 630, label: 'ফেসবুক পোস্ট' },
  story: { w: 1080, h: 1920, label: 'স্টোরি' },
  square: { w: 1080, h: 1080, label: 'স্কোয়ার' },
} as const;
export type Format = keyof typeof FORMATS;

/**
 * The share card — a page torn out of the Khabar Book: nakshi-kantha stitch
 * round the edge, a dated journal header, the tier, the dishes eaten, the
 * districts the user has "stamped", and the map pasted in as a polaroid.
 *
 * Sizing is cqmin: `c` = min(w,h)/100, so one number scales the whole card.
 * Each format then picks its OWN type scale, because they don't share a
 * height budget — a landscape post gives the text the full column, while a
 * square splits its height between text and map. Spending 17 units on the
 * tier name (fine on a post) overflows a square and squashes its map to a
 * sliver, so the square spends far less.
 *
 * Inline styles only: `html-to-image` clones this node into a standalone SVG
 * outside the page's stylesheets, so `var(--leaf)` and class rules would both
 * resolve to nothing. Bangla is never letter-spaced (conjunct shaping).
 */
const SCALE = {
  landscape: { eyebrow: 4, tier: 16, count: 6.6, stamp: 2.7, small: 3.8 },
  story: { eyebrow: 3.6, tier: 15, count: 6.4, stamp: 2.6, small: 3.4 },
  square: { eyebrow: 3.2, tier: 9, count: 5, stamp: 2.3, small: 2.9 },
} as const;

/** How the card's inner height is split between the text and the pasted map. */
const TEXT_FLEX = { landscape: 1, story: 1, square: 1.12 } as const;

/**
 * The pasted map's width in the tall formats. A square's map card is far
 * wider than the map is tall, so an unconstrained card leaves huge blank
 * bands either side of it — cap the card and let the paper show as a margin.
 */
const MAP_W: Record<Format, string | undefined> = {
  landscape: undefined, // row layout: the card simply takes the remaining width
  story: '100%',
  square: '46%',
};

/** Passport seal diameter + type, per format — it sits ON the map, so it has
 *  to shrink with the card instead of covering a third of a square's map. */
const SEAL: Record<Format, { d: number; fs: number }> = {
  landscape: { d: 13, fs: 4.2 },
  story: { d: 13, fs: 4.2 },
  square: { d: 10, fs: 3.4 },
};

/** At most this many district stamps before the row falls back to a "+N". */
const MAX_STAMPS = 5;

const BN_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
];

/** The alpona mandala — same 12-petal geometry as MapZone's, token colours. */
function Mandala({ color }: { color: string }) {
  return (
    <svg
      viewBox="-50 -50 100 100"
      fill="none"
      stroke={color}
      strokeWidth=".8"
      aria-hidden="true"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <circle r="47" />
      <circle r="42" strokeDasharray="1 3.2" strokeLinecap="round" />
      <circle r="11" />
      <circle r="4" fill={color} />
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 30})`}>
          <path d="M0-11C-8-21-8-32 0-40C8-32 8-21 0-11z" />
          <circle cy="-44" r="1.6" fill={color} />
        </g>
      ))}
    </svg>
  );
}

export default function ShareCard({ eaten, format }: { eaten: Set<number>; format: Format }) {
  const { w, h } = FORMATS[format];
  const c = Math.min(w, h) / 100; // 1cqmin in px
  const s = SCALE[format];
  const tier = getTier(eaten.size, totalDishes);
  const tall = format !== 'landscape';

  // districts the user has eaten in, in the order they were first stamped
  const visited: string[] = [];
  for (const id of eaten) {
    const dish = dishById[id];
    if (dish && !visited.includes(dish.districtId)) visited.push(dish.districtId);
  }
  const stamped = visited
    .slice(0, MAX_STAMPS)
    .map((id) => districtById[id]?.nameBn)
    .filter((n): n is string => Boolean(n));
  const extra = visited.length - stamped.length;

  const now = new Date();
  const date = `${bn(now.getDate())} ${BN_MONTHS[now.getMonth()]} ${bn(now.getFullYear())}`;

  const rule = (
    <div
      aria-hidden="true"
      style={{
        borderTop: `${0.45 * c}px dashed ${STITCH}`,
        margin: `${1.1 * c}px 0`,
        flex: 'none',
      }}
    />
  );

  /* the districts already stamped into this book, pressed at slight angles */
  const stamps = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 1.1 * c, alignItems: 'center' }}>
      {stamped.map((name, i) => (
        <span
          key={`${name}-${i}`}
          style={{
            border: `${0.4 * c}px solid ${TOKENS.tomato}`,
            boxShadow: `inset 0 0 0 ${0.22 * c}px ${TOKENS.tomato}`,
            color: TOKENS.tomato,
            borderRadius: 1.1 * c,
            padding: `${0.45 * c} ${1.3 * c}`,
            fontSize: s.stamp * c,
            fontWeight: 700,
            lineHeight: 1.35,
            whiteSpace: 'nowrap',
            opacity: 0.88,
            rotate: `${i % 2 ? 2.4 : -2.4}deg`,
          }}
        >
          {name}
        </span>
      ))}
      {extra > 0 && (
        <span
          style={{
            border: `${0.4 * c}px dashed ${TOKENS.muted}`,
            color: TOKENS.muted,
            borderRadius: 1.1 * c,
            padding: `${0.45 * c} ${1.3 * c}`,
            fontSize: s.stamp * c,
            fontWeight: 700,
            lineHeight: 1.35,
            whiteSpace: 'nowrap',
          }}
        >
          +{bn(extra)}
        </span>
      )}
    </div>
  );

  const text = (
    <div
      style={{
        flex: TEXT_FLEX[format],
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 1.8 * c,
        position: 'relative',
      }}
    >
      {/* journal header: what this book is, and the date it was written */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 2 * c,
          flex: 'none',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: s.eyebrow * c, color: TOKENS.tomatoD }}>
          খাবার বুক · বাংলাদেশ
        </span>
        <span style={{ fontSize: s.small * c * 0.92, color: TOKENS.muted, whiteSpace: 'nowrap' }}>
          {date}
        </span>
      </div>

      {rule}

      <b style={{ fontWeight: 700, fontSize: s.tier * c, lineHeight: 1.15, color: TOKENS.leaf }}>
        {tier.bn}
      </b>
      <span style={{ fontWeight: 700, fontSize: s.count * c, lineHeight: 1.3, flex: 'none' }}>
        {bn(eaten.size)} / {bn(totalDishes)} খাবার চেখেছি
      </span>

      {stamps}

      {rule}

      <span style={{ fontStyle: 'italic', fontSize: s.small * c, color: TOKENS.muted, flex: 'none' }}>
        তুমি কতটা চেখেছ? {SITE_HOST}
      </span>
    </div>
  );

  /* the map, pasted in as a polaroid with a hand-written caption */
  const mapCard = (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: TOKENS.card,
        border: `1px solid ${TOKENS.edge}`,
        padding: 2 * c,
        rotate: '1.6deg',
        boxShadow: '0 8px 20px rgba(36,35,31,.16)',
        ...(tall ? { width: MAP_W[format], alignSelf: 'center' } : null),
      }}
    >
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <MiniMap eaten={eaten} style={{ width: '100%', height: '100%', display: 'block' }} />
        {/* passport seal: how many districts are stamped in this book */}
        <div
          style={{
            position: 'absolute',
            top: 1.5 * c,
            left: 1.5 * c,
            border: `${0.7 * c}px double ${TOKENS.tomato}`,
            color: TOKENS.tomato,
            borderRadius: '50%',
            width: SEAL[format].d * c,
            aspectRatio: '1',
            display: 'grid',
            placeItems: 'center',
            alignContent: 'center',
            fontWeight: 700,
            fontSize: SEAL[format].fs * c,
            lineHeight: 1.1,
            textAlign: 'center',
            rotate: '-12deg',
            background: 'rgba(248,242,232,.55)',
          }}
        >
          {bn(visited.length)}
          <span style={{ fontSize: SEAL[format].fs * 0.58 * c, fontWeight: 700 }}>জেলা</span>
        </div>
      </div>
      {/* polaroid caption — the host is already in the footer, so this band
          carries only the hand-written line (it wraps in a square card) */}
      <div
        style={{
          flex: 'none',
          borderTop: `${0.4 * c}px dashed ${STITCH}`,
          marginTop: 1.2 * c,
          paddingTop: 0.9 * c,
        }}
      >
        <span
          style={{
            fontStyle: 'italic',
            fontSize: s.small * c * 0.95,
            color: TOKENS.muted,
            whiteSpace: 'nowrap',
          }}
        >
          আমার খাবার ম্যাপ
        </span>
      </div>
    </div>
  );

  return (
    <div
      style={{
        width: w,
        height: h,
        boxSizing: 'border-box',
        position: 'relative',
        display: 'flex',
        flexDirection: tall ? 'column' : 'row',
        // stretch, not centre: a centred map card sizes to the SVG's intrinsic
        // height and spills past the card, getting clipped top and bottom
        alignItems: 'stretch',
        gap: 4 * c,
        padding: 6 * c,
        background: TOKENS.paper,
        color: TOKENS.ink,
        overflow: 'hidden',
      }}
    >
      {/* alpona watermark, bleeding off the corner */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -13 * c,
          left: -13 * c,
          width: 40 * c,
          height: 40 * c,
          opacity: 0.1,
          pointerEvents: 'none',
        }}
      >
        <Mandala color={TOKENS.leaf} />
      </div>

      {text}
      {mapCard}

      {/* nakshi-kantha stitch, matching .piece::after in globals.css */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 2 * c,
          border: `${0.5 * c}px dashed ${STITCH}`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
