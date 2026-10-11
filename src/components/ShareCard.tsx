import MiniMap from './MiniMap';
import { TOKENS } from '@/lib/palette';
import { totalDishes } from '@/lib/data';
import { getTier } from '@/lib/tiers';
import { bn } from '@/lib/format';
import { SITE_HOST } from '@/lib/site';

export const FORMATS = {
  landscape: { w: 1200, h: 630, label: 'Facebook post' },
  story: { w: 1080, h: 1920, label: 'Story' },
  square: { w: 1080, h: 1080, label: 'Square' },
} as const;
export type Format = keyof typeof FORMATS;

/**
 * The share card from the prototype (`.sharecard`), in all three sizes.
 * All sizes are expressed in cqmin — the prototype's container-query unit —
 * so one component covers post, story and square. Inline styles only: the
 * PNG renderer clones this node outside the page's stylesheets.
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
        gap: 1.5 * c,
      }}
    >
      <small
        style={{
          fontWeight: 700,
          fontSize: 3.8 * c,
          color: TOKENS.tomatoD,
          letterSpacing: '.14em',
          textTransform: 'uppercase',
        }}
      >
        খাবার বুক · বাংলাদেশ
      </small>
      <b style={{ fontWeight: 700, fontSize: 11 * c, lineHeight: 1.3, color: TOKENS.leaf }}>
        {tier.bn}
      </b>
      <span style={{ fontWeight: 600, fontSize: 5 * c }}>
        {bn(eaten.size)} / {bn(totalDishes)} খাবার চেখেছি
      </span>
      <i style={{ fontStyle: 'italic', fontSize: 3.6 * c, color: TOKENS.muted }}>
        তুমি কতটা চেখেছ? {SITE_HOST}
      </i>
    </div>
  );

  const mapCard = (
    <div
      style={{
        flex: tall ? 1.4 : 1,
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

  const stamp = (
    <div
      style={{
        position: 'absolute',
        right: 4 * c,
        bottom: 4 * c,
        border: `${0.8 * c}px double ${TOKENS.tomato}`,
        color: TOKENS.tomato,
        borderRadius: '50%',
        width: 15 * c,
        aspectRatio: '1',
        display: 'grid',
        placeItems: 'center',
        fontWeight: 700,
        fontSize: 2.4 * c,
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
