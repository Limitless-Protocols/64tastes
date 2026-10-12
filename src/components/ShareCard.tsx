import MiniMap from './MiniMap';
import { TOKENS } from '@/lib/palette';
import { totalDishes } from '@/lib/data';
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
 * The share card in all three sizes. Sizes are expressed in cqmin — one
 * min-side-relative unit (1cqmin = min(w,h)/100) so the type scales across
 * formats: the Bangla tier name sits at ~17% of the short side (17% of the
 * height for post + square), the count is ~7%. Inline styles only: the PNG
 * renderer clones this node outside the page's stylesheets, and Bangla is
 * never letter-spaced (conjunct shaping).
 */
export default function ShareCard({ eaten, format }: { eaten: Set<number>; format: Format }) {
  const { w, h } = FORMATS[format];
  const c = Math.min(w, h) / 100; // 1cqmin in px
  const tall = format !== 'landscape';
  const tier = getTier(eaten.size, totalDishes);

  const text = (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 2 * c,
        position: 'relative',
      }}
    >
      <span
        style={{
          fontWeight: 700,
          fontSize: 4 * c,
          color: TOKENS.tomatoD,
        }}
      >
        খাবার বুক · বাংলাদেশ
      </span>
      <b style={{ fontWeight: 700, fontSize: 17 * c, lineHeight: 1.15, color: TOKENS.leaf }}>
        {tier.bn}
      </b>
      <span style={{ fontWeight: 700, fontSize: 7 * c, lineHeight: 1.3 }}>
        {bn(eaten.size)} / {bn(totalDishes)} খাবার চেখেছি
      </span>
      <span style={{ fontStyle: 'italic', fontSize: 4 * c, color: TOKENS.muted }}>
        তুমি কতটা চেখেছ? {SITE_HOST}
      </span>
    </div>
  );

  const mapCard = (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        background: TOKENS.card,
        border: `1px solid ${TOKENS.edge}`,
        padding: 2 * c,
        rotate: '2deg',
        boxShadow: '0 8px 20px rgba(36,35,31,.16)',
      }}
    >
      <MiniMap eaten={eaten} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );

  /* the stamp hugs a corner the map never reaches: bottom-left on the post
     (map on the right), top-right on story/square (map below) */
  const stamp = (
    <div
      style={{
        position: 'absolute',
        ...(tall ? { top: 5 * c, right: 5 * c } : { bottom: 5 * c, left: 5 * c }),
        border: `${0.8 * c}px double ${TOKENS.tomato}`,
        color: TOKENS.tomato,
        borderRadius: '50%',
        width: 15 * c,
        aspectRatio: '1',
        display: 'grid',
        placeItems: 'center',
        fontWeight: 700,
        fontSize: 3 * c,
        lineHeight: 1.2,
        textAlign: 'center',
        rotate: '-12deg',
      }}
    >
      ৬৪<br />জেলা
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
        alignItems: tall ? 'stretch' : 'center',
        gap: 4 * c,
        padding: 6 * c,
        background: TOKENS.paper,
        color: TOKENS.ink,
        overflow: 'hidden',
      }}
    >
      {text}
      {mapCard}
      {stamp}
    </div>
  );
}
