'use client';
import type { CSSProperties } from 'react';
import { districtById } from '@/lib/data';
import { bn } from '@/lib/format';
import { leaders } from '@/lib/leaders';
import PhotoSlot from './PhotoSlot';

/** The "most-loved" strip on the bottom of the centre column. */
export function TopStrip({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="piece top">
      <div className="top-h">
        <h3>🏆 সবচেয়ে প্রিয় খাবার</h3>
        <button onClick={onOpen}>সব দেখো ↗</button>
      </div>
      <div className="ranks">
        {leaders.love.slice(0, 3).map((l, i) => (
          <div className="rank" key={l.dish.slug}>
            <PhotoSlot dish={l.dish} />
            <div>
              <small>#{bn(i + 1)}</small>
              <b>{l.dish.nameBn}</b>
              <em>{bn(l.pct)}% দারুণ</em>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** The full board in a modal: loved vs. overrated, with the demo-data note. */
export function TopModal({
  tab,
  onTab,
  onClose,
}: {
  tab: 'love' | 'over';
  onTab: (t: 'love' | 'over') => void;
  onClose: () => void;
}) {
  return (
    <div
      className="mb"
      role="dialog"
      aria-modal="true"
      aria-label="সেরা খাবার"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <h2>
          সেরা খাবার
          <button className="x" onClick={onClose} aria-label="Close">✕</button>
        </h2>

        <div className="seg">
          <button className={`chip${tab === 'love' ? ' on' : ''}`} aria-pressed={tab === 'love'} onClick={() => onTab('love')}>
            😍 সবচেয়ে প্রিয়
          </button>
          <button className={`chip${tab === 'over' ? ' on' : ''}`} aria-pressed={tab === 'over'} onClick={() => onTab('over')}>
            🙄 ওভারেটেড
          </button>
        </div>

        <div className="mlist">
          {leaders[tab].map((l, i) => (
            <div className="rank" key={l.dish.slug}>
              <PhotoSlot dish={l.dish} />
              <div style={{ flex: 1 }}>
                <b>{bn(i + 1)}. {l.dish.nameBn}</b>
                <em> · {districtById[l.dish.districtId]?.nameBn}</em>
                <div className="bb"><i style={{ '--p': `${l.pct}%` } as CSSProperties} /></div>
              </div>
              <b>{bn(l.pct)}%</b>
            </div>
          ))}
        </div>

        <p className="note">
          ডেমো ডেটা। আসল তালিকার জন্য প্রতি খাবারে ২০+ ভোট দরকার। — Demo data. Real lists need 20+ votes per dish.
        </p>
      </div>
    </div>
  );
}
