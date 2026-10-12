'use client';
import { Check, MapPin } from 'lucide-react';
import { districtById, dishesByDistrict } from '@/lib/data';
import { bn } from '@/lib/format';
import { stories, FALLBACK_STORY } from '@/lib/stories';
import { RATING_OPTIONS, type MyRating } from '@/lib/useRatings';
import PhotoSlot from './PhotoSlot';
import PlaceRow from './PlaceRow';
import { Chip, PrimaryButton } from './ui';

type Props = {
  districtId: string | null;
  eaten: Set<number>;
  ratings: Record<number, MyRating>;
  places: Record<number, string>;
  /** "% দারুণ" from the leader board, when this dish has one. */
  lovePct: number | null;
  onToggle: (dishId: number, el: HTMLElement | null) => void;
  onRate: (dishId: number, r: MyRating | null) => void;
  onOverrate: (dishId: number) => void;
  onPlace: (dishId: number, name: string | null) => void;
  onSuggest: () => void;
};

/**
 * The dish panel piece: the selected district's food, or — when nothing is
 * selected — today's special. Not a modal: it lives in the right column on
 * desktop and below the map on phones, and repaints (with a slide) whenever
 * the selection changes. Top to bottom: photo (16:10), name + English, a
 * district · loved meta row, a one-line story, the big চেখেছি button with the
 * reaction chips right under it, then the "কোথায় পাবেন" place pick.
 */
export default function DistrictPanel({
  districtId,
  eaten,
  ratings,
  places,
  lovePct,
  onToggle,
  onRate,
  onOverrate,
  onPlace,
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
          <div className="p-en">{dish.nameEn}</div>
        </div>
      </div>

      <div className="p-meta">
        <span>
          <MapPin className="icon" aria-hidden="true" /> {district.nameBn}
        </span>
        {lovePct != null && <span>· {bn(lovePct)}% দারুণ</span>}
      </div>

      <p className="p-desc">{stories[dish.slug] ?? FALLBACK_STORY}</p>

      <PrimaryButton
        className={`check${on ? ' on' : ''}`}
        aria-pressed={on}
        onClick={(e) => onToggle(dish.id, e.currentTarget)}
      >
        {on ? (
          <>
            <Check className="icon" aria-hidden="true" /> চেখেছি
          </>
        ) : (
          'চেখেছি?'
        )}
      </PrimaryButton>

      {/* rating chips unfold only once the dish is marked eaten */}
      <div className={`chips${on ? ' open' : ''}`}>
        {RATING_OPTIONS.map((r) => (
          <Chip
            key={r.v}
            on={rating?.rating === r.v}
            onClick={() =>
              onRate(
                dish.id,
                rating?.rating === r.v
                  ? null
                  : { rating: r.v, overrated: rating?.overrated ?? false }
              )
            }
          >
            {r.e} {r.bn}
          </Chip>
        ))}
        <Chip over on={!!rating?.overrated} disabled={!rating} onClick={() => onOverrate(dish.id)}>
          🙄 ওভাররেটেড
        </Chip>
      </div>

      <PlaceRow
        name={places[dish.id]}
        onSave={(n) => onPlace(dish.id, n)}
        onClear={() => onPlace(dish.id, null)}
      />

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
