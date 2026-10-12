'use client';
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
        <PhotoSlot dish={l.dish} />
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
      <span>
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
 * ends half empty.
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

  const loved: Leader[] = data && !data.empty ? toLeaders(data.mostLoved) : leaders.love;
  const over: Leader[] = data && !data.empty ? toLeaders(data.mostOverrated) : leaders.over;

  const spots = data?.spots ?? [];
  const spotDish = data?.spotsDishId != null ? dishById[data.spotsDishId] : null;

  return (
    <>
      <div>
        <div className="eyebrow">সেরা তালিকা</div>
        <h1>সবচেয়ে <em>সেরা</em> খাবার</h1>
        <div className="sub">Bangladesh&apos;s most-loved dishes</div>
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
          <section>
            <h2 className="board-h">😍 সবচেয়ে প্রিয়</h2>
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
            <section className="pane-sec">
              <h3>🙄 ওভাররেটেড</h3>
              <div className="mlist">
                {over.map((l, i) => (
                  <BoardRow key={l.dish.slug} l={l} i={i + 1} onOpenDish={onOpenDish} />
                ))}
              </div>
            </section>

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
          </div>

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
