'use client';
import { districtById, dishesByDistrict } from '@/lib/data';
import type { MyRating } from '@/lib/useRatings';
import { RATING_OPTIONS } from '@/lib/useRatings';
import PlaceRow from './PlaceRow';
import SuggestForm from './SuggestForm';

type Props = {
  districtId: string;
  eaten: Set<number>;
  ratings: Record<number, MyRating>;
  places: Record<number, string>;
  onToggle: (id: number) => void;
  onRate: (id: number, value: MyRating | null) => void;
  onPlace: (id: number, placeId: string | null) => void;
  onClose: () => void;
};

/**
 * The district sheet: a slide-up piece on phones (style guide — the map's
 * district panel stays as-is on desktop; tapping a district on a phone opens
 * this with the full dish + place list). Kept from origin/main, restyled to
 * the Khabar Book paper look and wired to the unified rating model.
 */
export default function DistrictSheet({
  districtId, eaten, ratings, places, onToggle, onRate, onPlace, onClose,
}: Props) {
  const district = districtById[districtId];
  const list = dishesByDistrict[districtId] ?? [];

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label={district.nameBn}>
      <div className="sheet-h">
        <div>
          <h2>{district.nameBn}</h2>
          <p className="caption">{district.nameEn}</p>
        </div>
        <button onClick={onClose} aria-label="বন্ধ করো" className="x">✕</button>
      </div>

      {list.length === 0 ? (
        <p className="sheet-empty">
          এই জেলার বিখ্যাত খাবার এখনও যোগ হয়নি। তুমি জানলে বলো!
        </p>
      ) : (
        <ul>
          {list.map((dish) => {
            const has = eaten.has(dish.id);
            const mine = ratings[dish.id];
            return (
              <li key={dish.id}>
                <button
                  onClick={() => onToggle(dish.id)}
                  aria-pressed={has}
                  className={`p-more-row${has ? ' on' : ''}`}
                >
                  <span>
                    {dish.nameBn}
                    <small style={{ display: 'block', fontWeight: 400, fontSize: 13, color: 'var(--muted)' }}>
                      {dish.nameEn}
                    </small>
                  </span>
                  <span>{has ? '✅' : '⬜'}</span>
                </button>

                {has && (
                  <>
                    <div className="seg">
                      {RATING_OPTIONS.map((o) => (
                        <button
                          key={o.v}
                          aria-pressed={mine?.rating === o.v}
                          onClick={() =>
                            onRate(
                              dish.id,
                              mine?.rating === o.v
                                ? null
                                : { rating: o.v, overrated: mine?.overrated ?? false }
                            )
                          }
                          className={`chip${mine?.rating === o.v ? ' on' : ''}`}
                        >
                          {o.e} {o.bn}
                        </button>
                      ))}
                      <button
                        disabled={!mine}
                        aria-pressed={mine?.overrated ?? false}
                        onClick={() => mine && onRate(dish.id, { ...mine, overrated: !mine.overrated })}
                        className={`chip over${mine?.overrated ? ' on' : ''}`}
                      >
                        🙄 ওভাররেটেড
                      </button>
                    </div>

                    {mine && (
                      <PlaceRow
                        name={places[dish.id]}
                        onSave={(n) => onPlace(dish.id, n)}
                        onClear={() => onPlace(dish.id, null)}
                      />
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <SuggestForm key={districtId} districtId={districtId} />
    </div>
  );
}
