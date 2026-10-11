'use client';
import type { CSSProperties } from 'react';
import { bn } from '@/lib/format';
import type { Tier } from '@/lib/tiers';

/** The Food Passport piece: ring, tier, bar and the three counters. */
export default function Passport({
  count,
  total,
  tier,
  love,
}: {
  count: number;
  total: number;
  tier: Tier;
  love: number;
}) {
  const pct = total ? (count / total) * 100 : 0;

  return (
    <aside className="piece passport">
      <div className="pass-head">
        <span className="pass-icon" aria-hidden="true">✦</span>
        <span>তোমার ফুড পাসপোর্ট</span>
      </div>

      <div className="prow">
        <div className="ring" style={{ '--done': `${pct}%` } as CSSProperties} aria-hidden="true" />
        <div>
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

      <div className="bar">
        <span style={{ '--w': `${pct}%` } as CSSProperties} />
      </div>

      <div className="stats">
        <div className="stat"><b>{bn(count)}</b><span>🍴 চেখেছি</span></div>
        <div className="stat"><b>{bn(total - count)}</b><span>🥡 বাকি</span></div>
        <div className="stat"><b>{bn(love)}</b><span>😍 দারুণ</span></div>
      </div>
    </aside>
  );
}
