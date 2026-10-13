'use client';
import { useState } from 'react';
import { ArrowUpRight, MapPin, Trophy } from 'lucide-react';
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

/** One podium card — the top three of the most-loved board. */
function PodiumCard({ l, i, onOpenDish }: { l: Leader; i: number; onOpenDish: (d: Leader['dish']) => void }) {
  const d = districtById[l.dish.districtId];
  return (
    <div
      className="pod rank-btn"
      role="button"
      tabIndex={0}
      onClick={() => onOpenDish(l.dish)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDish(l.dish);
        }
      }}
    >
      <div className="pod-top">
        <span className="pod-rank">#{bn(i + 1)}</span>
        <PhotoSlot dish={l.dish} className="pod-ph" />
        <div>
          <div className="pod-name">{l.dish.nameBn}</div>
          <div className="pod-dist">
            <MapPin className="icon" aria-hidden="true" /> {d?.nameBn}
          </div>
        </div>
      </div>
      <span className="srow-bar"><i style={{ width: `${l.pct}%` }} /></span>
      <div className="pod-pct">{bn(l.pct)}% দারুণ</div>
    </div>
  );
}

/** One leaderboard row: rank | photo | name+district | bar | bold percentage. */
function BoardRow({ l, i, onOpenDish }: { l: Leader; i: number; onOpenDish: (d: Leader['dish']) => void }) {
  const d = districtById[l.dish.districtId];
  return (
    <button className="srow" onClick={() => onOpenDish(l.dish)}>
      <span className="srow-rank">{bn(i + 1)}</span>
      <PhotoSlot dish={l.dish} />
      <span className="srow-names">
        <span className="srow-name">{l.dish.nameBn}</span>
        <span className="srow-dist">
          <MapPin className="icon" aria-hidden="true" /> {d?.nameBn}
        </span>
      </span>
      <span className="srow-bar"><i style={{ width: `${l.pct}%` }} /></span>
      <span className="srow-pct">{bn(l.pct)}%</span>
    </button>
  );
}

/** The "most-loved" strip on the bottom of the centre column. */
export function TopStrip({ onOpen }: { onOpen: () => void }) {
  const data = useTopData();
  const rows: Leader[] =
    data && !data.empty ? toLeaders(data.mostLoved).slice(0, 3) : leaders.love.slice(0, 3);

  return (
    <section className="piece top">
      <div className="top-h">
        <h3><Trophy className="icon" aria-hidden="true" /> সবচেয়ে প্রিয় খাবার</h3>
        <button onClick={onOpen}>
          সব দেখো <ArrowUpRight className="icon" aria-hidden="true" />
        </button>
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
 * Top three get podium cards; both boards stay visible so the page never
 * ends half empty. Phones show one chip-selected board at a time inside
 * the pane (`.tb-chips` / `.tb-view`); ≥768px it is the full long page.
 */
export function TopPane({
  onSelect,
  onOpenDish,
}: {
  /** District rows jump to the map with that district selected. */
  onSelect: (districtId: string) => void;
  /** Dish rows open the dish's page at /dishes/[slug]. */
  onOpenDish: (dish: Leader['dish']) => void;
}) {
  const data = useTopData();
  /* phones: one chip-selected board at a time (`.tb-view` / `.tb-chips`
     CSS). ≥768px the row is hidden and every section shows as always. */
  const [view, setView] = useState<'loved' | 'over' | 'districts' | 'spots'>('loved');

  const loved: Leader[] = data && !data.empty ? toLeaders(data.mostLoved) : leaders.love;
  const over: Leader[] = data && !data.empty ? toLeaders(data.mostOverrated) : leaders.over;

  const spots = data?.spots ?? [];
  const spotDish = data?.spotsDishId != null ? dishById[data.spotsDishId] : null;

  const chips: { v: typeof view; label: string; on: boolean }[] = [
    { v: 'loved', label: 'সবচেয়ে প্রিয়', on: true },
    { v: 'over', label: 'ওভাররেটেড', on: over.length > 0 },
    { v: 'districts', label: 'সেরা জেলা', on: Boolean(data && data.districtRows.length > 0) },
    { v: 'spots', label: 'জনপ্রিয় জায়গা', on: spots.length > 0 },
  ];

  return (
    <>
      <div>
        <div className="eyebrow">সেরা তালিকা</div>
        <h1>সবচেয়ে <em>সেরা</em> খাবার</h1>
        <div className="sub">Bangladesh&apos;s most-loved dishes</div>
      </div>

      {/* phones: board switcher (display:none ≥768px — the desktop page
          stays the one long scroll of every board) */}
      <div className="tb-chips" role="tablist" aria-label="কোন বোর্ড দেখবে">
        {chips.filter((c) => c.on).map((c) => (
          <button
            key={c.v}
            role="tab"
            aria-selected={view === c.v}
            className={`chip${view === c.v ? ' on' : ''}`}
            onClick={() => setView(c.v)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {data && data.empty ? (
        <div className="piece pane-note">
          <p className="note big">
            এখনও কোনো খাবার র‍্যাংক পায়নি — প্রতি খাবারে অন্তত{' '}
            {bn(20)}টি ভোট লাগে। তুমিই প্রথম ভোটার হতে পারো!
          </p>
        </div>
      ) : (
        <>
          <section className={`tb-view${view === 'loved' ? ' shown' : ''}`} data-v="loved">
            <h2 className="board-h">
              <span className="tb-emo" aria-hidden="true">😍</span>{' '}
              <svg className="tb-ico" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M12 20.5S4 15.4 4 10a4.6 4.6 0 0 1 8-3.1A4.6 4.6 0 0 1 20 10c0 5.4-8 10.5-8 10.5z" fill="currentColor" />
              </svg>
              সবচেয়ে প্রিয়
            </h2>
            <div className="podium">
              {loved.slice(0, 3).map((l, i) => (
                <PodiumCard key={l.dish.slug} l={l} i={i} onOpenDish={onOpenDish} />
              ))}
            </div>
            {loved.length > 3 && (
              <div className="mlist">
                {loved.slice(3).map((l, i) => (
                  <BoardRow key={l.dish.slug} l={l} i={i + 3} onOpenDish={onOpenDish} />
                ))}
              </div>
            )}
          </section>

          <div className="pane-cols">
            <section className={`pane-sec tb-view${view === 'over' ? ' shown' : ''}`} data-v="over">
              <h3>
                <span className="tb-emo" aria-hidden="true">🙄</span>{' '}
                <svg className="tb-ico" viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="9" cy="10" r="1.4" fill="currentColor" />
                  <circle cx="15" cy="10" r="1.4" fill="currentColor" />
                  <path d="M8.5 16.5c1-.9 2.2-1.4 3.5-1.4s2.5.5 3.5 1.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                ওভাররেটেড
              </h3>
              <div className="mlist">
                {over.map((l, i) => (
                  <BoardRow key={l.dish.slug} l={l} i={i + 1} onOpenDish={onOpenDish} />
                ))}
              </div>
            </section>

            {data && data.districtRows.length > 0 && (
              <section className={`pane-sec tb-view${view === 'districts' ? ' shown' : ''}`} data-v="districts">
                <h3>
                  <span className="tb-emo" aria-hidden="true">🏆</span>{' '}
                  <svg className="tb-ico" viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
                    <path d="M7 4h10v3.5a5 5 0 0 1-10 0V4z" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M7 5.5H4.5V7a3 3 0 0 0 3 3M17 5.5h2.5V7a3 3 0 0 1-3 3" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 12.5V16M8.5 19.5h7M10 16h4v3.5h-4z" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  সেরা খাবারের জেলা
                </h3>
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
          </div>

          {spots.length > 0 && (
            <section className={`pane-sec tb-view${view === 'spots' ? ' shown' : ''}`} data-v="spots">
              <h3>
                <span className="tb-emo" aria-hidden="true">📍</span>{' '}
                <svg className="tb-ico" viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
                  <path d="M12 21s-6.5-6-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15 12 21 12 21z" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="10.5" r="2.2" fill="currentColor" />
                </svg>
                জনপ্রিয় জায়গা{spotDish ? ` — ${spotDish.nameBn}` : ''}
              </h3>
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

          {!data && (
            <p className="note big">
              ডেমো ডেটা দেখানো হচ্ছে। আসল তালিকার জন্য প্রতি খাবারে {bn(20)}+ ভোট দরকার।
            </p>
          )}
        </>
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
                <div className="bb"><i style={{ '--p': `${l.pct}%` } as React.CSSProperties} /></div>
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
