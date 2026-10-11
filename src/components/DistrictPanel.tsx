'use client';
import { districtById, dishesByDistrict } from '@/lib/data';
import { RATING_OPTIONS, type Rating } from '@/lib/useRatings';
import PhotoSlot from './PhotoSlot';

type Props = {
  districtId: string | null;
  eaten: Set<number>;
  ratings: Record<number, Rating>;
  onToggle: (dishId: number, el: HTMLElement | null) => void;
  onRate: (dishId: number, r: Rating) => void;
  onSuggest: () => void;
};

/**
 * The dish panel piece: the selected district's food, or — when nothing is
 * selected — today's special. Not a modal: it lives in the right column on
 * desktop and below the map on phones, and repaints (with a slide) whenever
 * the selection changes.
 */
export default function DistrictPanel({
  districtId,
  eaten,
  ratings,
  onToggle,
  onRate,
  onSuggest,
}: Props) {
  const list = districtId ? dishesByDistrict[districtId] ?? [] : [];
  const dish = list[0];

  if (!dish || !districtId) {
    return (
      <div className="p-body swap" key={districtId ?? 'soon'}>
        <div className="soon">
          <b>শীঘ্রই আসছে</b>
          Dish coming soon
          <br />
          <button className="link" onClick={onSuggest}>খাবার সাজেস্ট করো</button>
        </div>
      </div>
    );
  }

  const district = districtById[districtId];
  const on = eaten.has(dish.id);
  const rating = ratings[dish.id];

  return (
    <div className="p-body swap" key={districtId}>
      <div className="p-top">
        <PhotoSlot dish={dish} />
        <div className="p-info">
          <div className="p-name">{dish.nameBn}</div>
          <div className="p-en">{dish.nameEn} · {district.nameBn}</div>
        </div>
      </div>

      <div className="p-row">
        <span className="p-state">{on ? 'চেখে ফেলেছ!' : 'চেখেছ কি?'}</span>
        <button
          className={`check${on ? ' on' : ''}`}
          aria-pressed={on}
          onClick={(e) => onToggle(dish.id, e.currentTarget)}
        >
          {on ? 'চেখেছি ✓' : 'চেখেছি?'}
        </button>
      </div>

      {/* rating chips unfold only once the dish is marked eaten */}
      <div className={`chips${on ? ' open' : ''}`}>
        {RATING_OPTIONS.map((r) => (
          <button
            key={r.v}
            className={`chip${rating === r.v ? ' on' : ''}`}
            aria-pressed={rating === r.v}
            onClick={() => onRate(dish.id, r.v)}
          >
            {r.e} {r.bn}
          </button>
        ))}
      </div>

      {list.length > 1 && (
        <ul className="p-more">
          {list.slice(1).map((d) => {
            const has = eaten.has(d.id);
            return (
              <li key={d.id}>
                <button
                  className={`p-more-row${has ? ' on' : ''}`}
                  aria-pressed={has}
                  onClick={(e) => onToggle(d.id, e.currentTarget)}
                >
                  <span>{d.nameBn}</span>
                  <span>{has ? '✓' : '+'}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
