'use client';
import { useState, type CSSProperties } from 'react';
import { districtById, dishById } from '@/lib/data';
import { bn } from '@/lib/format';
import { leaders, type Leader } from '@/lib/leaders';
import { useTopData } from '@/lib/useTopData';
import PhotoSlot from './PhotoSlot';

function toLeaders(rows: { id: number; pct: number }[]): Leader[] {
  return rows
    .map((r) => ({ dish: dishById[r.id], pct: r.pct }))
    .filter((l): l is Leader => Boolean(l.dish));
}

/** The "most-loved" strip on the bottom of the centre column. */
export function TopStrip({ onOpen }: { onOpen: () => void }) {
  const data = useTopData();
  const rows: Leader[] =
    data && !data.empty ? toLeaders(data.mostLoved).slice(0, 3) : leaders.love.slice(0, 3);

  return (
    <section className="piece top">
      <div className="top-h">
        <h3>🏆 সবচেয়ে প্রিয় খাবার</h3>
        <button onClick={onOpen}>সব দেখো ↗</button>
      </div>
      {data && data.empty ? (
        <p className="note">রেটিং জমা হচ্ছে — প্রথম তালিকা আসবে অন্তত {bn(20)}টি ভোটের পর।</p>
      ) : (
        <div className="ranks">
          {rows.map((l, i) => (
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
      )}
    </section>
  );
}

/**
 * The সেরা view: real backend boards (loved / overrated / best districts /
 * popular spots) when GET /api/top answers, the demo boards otherwise, and
 * the honest empty state when the API works but nothing is ranked yet.
 */
export function TopPane({
  onSelect,
  onOpenDish,
}: {
  /** District rows jump to the map with that district selected. */
  onSelect: (districtId: string) => void;
  /** Dish rows open the detail modal instead of navigating. */
  onOpenDish: (dish: Leader['dish']) => void;
}) {
  const data = useTopData();
  const [tab, setTab] = useState<'love' | 'over'>('love');

  const rows: Leader[] =
    data && !data.empty
      ? toLeaders(tab === 'love' ? data.mostLoved : data.mostOverrated)
      : leaders[tab];

  const spots = data?.spots ?? [];
  const spotDish = data?.spotsDishId != null ? dishById[data.spotsDishId] : null;

  return (
    <>
      <div>
        <div className="eyebrow">সেরা তালিকা</div>
        <h1>সবচেয়ে <em>সেরা</em> খাবার</h1>
        <div className="sub">Bangladesh&apos;s most-loved dishes</div>
      </div>

      <div className="seg">
        <button
          className={`chip${tab === 'love' ? ' on' : ''}`}
          aria-pressed={tab === 'love'}
          onClick={() => setTab('love')}
        >
          😍 সবচেয়ে প্রিয়
        </button>
        <button
          className={`chip${tab === 'over' ? ' on' : ''}`}
          aria-pressed={tab === 'over'}
          onClick={() => setTab('over')}
        >
          🙄 ওভাররেটেড
        </button>
      </div>

      {data && data.empty ? (
        <div className="piece pane-note">
          <p className="note">
            এখনও কোনো খাবার র‍্যাংক পায়নি — প্রতি খাবারে অন্তত{' '}
            {bn(20)}টি ভোট লাগে। তুমিই প্রথম ভোটার হতে পারো!
          </p>
        </div>
      ) : (
        <>
          <div className="mlist">
            {rows.map((l, i) => (
              <button
                className="rank rank-btn"
                key={l.dish.slug}
                onClick={() => onOpenDish(l.dish)}
                title={`${l.dish.nameBn} — ${districtById[l.dish.districtId]?.nameBn}`}
              >
                <PhotoSlot dish={l.dish} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b>{bn(i + 1)}. {l.dish.nameBn}</b>
                  <em> · {districtById[l.dish.districtId]?.nameBn}</em>
                  <div className="bb"><i style={{ '--p': `${l.pct}%` } as CSSProperties} /></div>
                </div>
                <b>{bn(l.pct)}%</b>
              </button>
            ))}
          </div>

          {!data && (
            <p className="note">
              ডেমো ডেটা। আসল তালিকার জন্য প্রতি খাবারে {bn(20)}+ ভোট দরকার।
            </p>
          )}
        </>
      )}

      {data && data.districtRows.length > 0 && (
        <section className="pane-sec">
          <h3>🏆 সেরা খাবারের জেলা</h3>
          <ol className="mlist">
            {data.districtRows.map((r, i) => {
              const d = districtById[r.id];
              if (!d) return null;
              return (
                <li key={r.id}>
                  <button className="p-more-row" onClick={() => onSelect(r.id)}>
                    <span>{bn(i + 1)}. {d.nameBn}</span>
                    <span>{bn(r.pct)}% দারুণ</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {spots.length > 0 && (
        <section className="pane-sec">
          <h3>📍 জনপ্রিয় জায়গা{spotDish ? ` — ${spotDish.nameBn}` : ''}</h3>
          <ul className="mlist">
            {spots
              .filter((s) => s.name)
              .map((s) => (
                <li key={s.id} className="spot-row">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + ' Bangladesh')}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s.name}
                  </a>
                  <span>{bn(s.picks)} জন</span>
                </li>
              ))}
          </ul>
          <p className="note">ব্যবহারকারীদের দেওয়া তথ্য</p>
        </section>
      )}
    </>
  );
}

/** The full board in a modal (kept from the pre-tab version). */
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
