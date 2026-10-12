'use client';
import { useState } from 'react';
import { Check, ChevronLeft, MapPin, X } from 'lucide-react';
import { districtById, dishesByDistrict } from '@/lib/data';
import { bn } from '@/lib/format';
import { stories, FALLBACK_STORY } from '@/lib/stories';
import { RATING_OPTIONS, type MyRating } from '@/lib/useRatings';
import PhotoSlot from './PhotoSlot';
import PlaceRow from './PlaceRow';
import { Chip, PrimaryButton } from './ui';
import type { Dish } from '@/lib/types';

type Props = {
  districtId: string;
  eaten: Set<number>;
  ratings: Record<number, MyRating>;
  places: Record<number, string>;
  onToggle: (dishId: number, el?: HTMLElement | null) => void;
  onRate: (dishId: number, r: MyRating | null) => void;
  onOverrate: (dishId: number) => void;
  onPlace: (dishId: number, name: string | null) => void;
  onSuggest: () => void;
  onClose: () => void;
};

/** A short culinary brief assembled from the district's known dishes. */
function brief(districtBn: string, dishes: Dish[]): string {
  if (!dishes.length) return '';
  const names = dishes.slice(0, 4).map((d) => d.nameBn).join(', ');
  const more = dishes.length > 4 ? ` আরও ${bn(dishes.length - 4)}টি` : '';
  return `${districtBn} জেলার পরিচিত সুযোগ — ${names}${more}। এখানকার রান্নার আঞ্চলিক ছোঁয়া তাই অনন্য।`;
}

/**
 * MapDishPopup — the district popup (opens on any district tap/click, on every
 * breakpoint). Shows the district's name, a short culinary brief and its dish
 * list. Tapping a dish swipes to a recipe card with চেখেছি, the reaction chips
 * and কোথায় পাবেন. A district with no food just offers a suggestion prompt.
 */
export default function MapDishPopup({
  districtId, eaten, ratings, places, onToggle, onRate, onOverrate, onPlace, onSuggest, onClose,
}: Props) {
  const [active, setActive] = useState<Dish | null>(null);
  const d = districtById[districtId];
  const list = dishesByDistrict[districtId] ?? [];

  if (!d) return null;

  // --- no food at all: plain suggestion prompt -----------------------------
  if (!list.length) {
    return (
      <div
        className="mb"
        role="dialog"
        aria-modal="true"
        aria-label={`${d.nameBn} — খাবার নেই`}
        data-testid="map-dish-popup"
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="modal dish-popup">
          <h2>
            📍 {d.nameBn}
            <button className="x" onClick={onClose} aria-label="বন্ধ করো">
              <X className="icon" aria-hidden="true" />
            </button>
          </h2>
          <div className="dish-en">{d.nameEn}</div>
          <p className="dish-story">
            {d.nameBn} জেলার এখনো কোনো খাবার যোগ করা হয়নি। তুমি কি এখানকার কোনো সুযোগ যোগ করতে চাও?
          </p>
          <PrimaryButton onClick={onSuggest}>খাবার সাজেস্ট করো</PrimaryButton>
        </div>
      </div>
    );
  }

  // --- recipe card: swiped-in detail for the chosen dish --------------------
  if (active) {
    const on = eaten.has(active.id);
    const rating = ratings[active.id];
    return (
      <div
        className="mb"
        role="dialog"
        aria-modal="true"
        aria-label={active.nameBn}
        data-testid="map-dish-popup"
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="modal dish-popup dish-card swipe-in">
          <button className="mp-back" onClick={() => setActive(null)} aria-label="তালিকায় ফিরে যাও">
            <ChevronLeft className="icon" aria-hidden="true" /> {d.nameBn}
          </button>
          <PhotoSlot dish={active} tag />
          <h2>
            {active.nameBn}
            <button className="x" onClick={onClose} aria-label="বন্ধ করো">
              <X className="icon" aria-hidden="true" />
            </button>
          </h2>
          <div className="dish-en">{active.nameEn}</div>
          <div className="dish-loc">
            <MapPin className="icon" aria-hidden="true" /> {d.nameBn} · {d.nameEn}
          </div>
          <p className="dish-story">{stories[active.slug] ?? FALLBACK_STORY}</p>

          <PrimaryButton
            className={`check${on ? ' on' : ''}`}
            aria-pressed={on}
            onClick={(e) => onToggle(active.id, e.currentTarget)}
          >
            {on ? (<><Check className="icon" aria-hidden="true" /> চেখেছি</>) : 'চেখেছি?'}
          </PrimaryButton>

          <div className={`chips${on ? ' open' : ''}`}>
            {RATING_OPTIONS.map((r) => (
              <Chip
                key={r.v}
                on={rating?.rating === r.v}
                onClick={() =>
                  onRate(active.id, rating?.rating === r.v ? null : { rating: r.v, overrated: rating?.overrated ?? false })
                }
              >
                {r.e} {r.bn}
              </Chip>
            ))}
            <Chip over on={!!rating?.overrated} disabled={!rating} onClick={() => onOverrate(active.id)}>
              🙄 ওভাররেটেড
            </Chip>
          </div>

          <PlaceRow
            name={places[active.id]}
            onSave={(n) => onPlace(active.id, n)}
            onClear={() => onPlace(active.id, null)}
          />
        </div>
      </div>
    );
  }

  // --- list: district name + culinary brief + dish list ---------------------
  return (
    <div
      className="mb"
      role="dialog"
      aria-modal="true"
      aria-label={`${d.nameBn} খাবার`}
      data-testid="map-dish-popup"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal dish-popup">
        <h2>
          📍 {d.nameBn}
          <button className="x" onClick={onClose} aria-label="বন্ধ করো">
            <X className="icon" aria-hidden="true" />
          </button>
        </h2>
        <div className="dish-en">{d.nameEn}</div>
        <p className="dish-story">{brief(d.nameBn, list)}</p>
        <div className="mp-list">
          {list.map((dish) => {
            const isEaten = eaten.has(dish.id);
            return (
              <button key={dish.id} className="mp-row" onClick={() => setActive(dish)}>
                <PhotoSlot dish={dish} className="mp-ph" />
                <span className="mp-names">
                  <b>{dish.nameBn}</b>
                  <span className="dish-en">{dish.nameEn}</span>
                </span>
                <span className={`mp-state${isEaten ? ' on' : ''}`} aria-hidden="true">
                  {isEaten ? <Check className="icon" /> : <ChevronLeft className="icon rot" />}
                </span>
              </button>
            );
          })}
        </div>
        <p className="note">
          এই জেলায় {bn(list.filter((x) => eaten.has(x.id)).length)}/{bn(list.length)} টি খাবার চেখেছ।
        </p>
      </div>
    </div>
  );
}
