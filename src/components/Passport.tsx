'use client';
import type { CSSProperties } from 'react';
import { Heart, PackageOpen, Utensils } from 'lucide-react';
import { bn } from '@/lib/format';
import { BREAKPOINTS, useMedia } from '@/lib/hooks';
import type { Tier } from '@/lib/tiers';
import { Piece, StatTile } from './ui';

/** The Food Passport piece: ring with the Bangla count inside, tier, bar, counters. */
export default function Passport({
  count,
  total,
  tier,
  love,
  onOpen,
}: {
  count: number;
  total: number;
  tier: Tier;
  love: number;
  /** Phones only (`.pass-open` is display:none ≥768px): open the passport sheet. */
  onOpen?: () => void;
}) {
  const pct = total ? (count / total) * 100 : 0;
  // Phones: the ribbon lies flat against the screen edge (the inline `rotate`
  // tilt can't be cancelled from the stylesheet).
  const isMobile = useMedia(BREAKPOINTS.mobile);

  return (
    <Piece className="passport" tilt={isMobile ? undefined : '2deg'}>
      {/* display:contents on ≥768px — the ribbon box only exists on phones,
          where it becomes the swallowtail banner (clip-path) inside the
          drop-shadowed .passport wrapper. */}
      <div className="pass-ribbon">
        <div className="pass-head">
          <span className="pass-icon" aria-hidden="true">
            <Heart />
          </span>
          <span>তোমার ফুড পাসপোর্ট</span>
        </div>

        <div className="prow">
          <div className="ring" style={{ '--done': `${pct}%` } as CSSProperties}>
            <span className="ring-num">{bn(count)}</span>
          </div>
          <div className="pass-nums">
            <div className="num">
              {bn(count)} <small>/ {bn(total)}</small>
            </div>
            {/* key so the tier flips when the badge changes */}
            <div className="tier" key={tier.bn}>
              {tier.bn}
              <span className="tier-en">{tier.en}</span>
            </div>
          </div>
        </div>

        <div className="bar" role="progressbar" aria-valuenow={count} aria-valuemin={0} aria-valuemax={total} aria-label="অগ্রগতি">
          <span style={{ '--w': `${pct}%` } as CSSProperties} />
        </div>

        <div className="stats">
          <StatTile value={bn(count)} label="চেখেছি" icon={<Utensils aria-hidden="true" />} />
          <StatTile value={bn(total - count)} label="বাকি" icon={<PackageOpen aria-hidden="true" />} />
          <StatTile value={bn(love)} label="দারুণ" icon={<Heart aria-hidden="true" />} />
        </div>

        {/* phones only: the ribbon's right-hand stat */}
        <div className="pass-left">
          <b>{bn(total - count)}</b>
          <span>বাকি</span>
        </div>

        {/* phones only: the whole ribbon is one tappable sheet opener */}
        <button className="pass-open" aria-label="ফুড পাসপোর্ট খুলো" onClick={onOpen} />
      </div>
    </Piece>
  );
}
