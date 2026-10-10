'use client';
import { districtById, dishesByDistrict } from '@/lib/data';
import type { MyRating, Rating } from '@/lib/useRatings';

const OPTIONS: { value: Rating; label: string }[] = [
  { value: 'loved', label: '😍 দারুণ' },
  { value: 'okay', label: '🙂 মোটামুটি' },
  { value: 'not_for_me', label: '😕 পছন্দ হয়নি' },
];

type Props = {
  districtId: string;
  eaten: Set<number>;
  ratings: Record<number, MyRating>;
  onToggle: (id: number) => void;
  onRate: (id: number, value: MyRating | null) => void;
  onClose: () => void;
};

export default function DistrictSheet({ districtId, eaten, ratings, onToggle, onRate, onClose }: Props) {
  const district = districtById[districtId];
  const list = dishesByDistrict[districtId] ?? [];

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label={district.nameEn}>
      <div className="flex items-start justify-between">
        <div>
          <h2>{district.nameBn}</h2>
          <p className="caption">{district.nameEn}</p>
        </div>
        <button onClick={onClose} aria-label="Close" className="close">×</button>
      </div>

      {list.length === 0 ? (
        <p className="mt-3 caption">
          No famous dish listed yet. Know one? Suggestions are coming soon.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {list.map((dish) => {
            const has = eaten.has(dish.id);
            const mine = ratings[dish.id];
            return (
              <li key={dish.id}>
                <button
                  onClick={() => onToggle(dish.id)}
                  aria-pressed={has}
                  className="dish-row"
                >
                  <span>
                    <span className="block font-medium">{dish.nameBn}</span>
                    <span className="caption block">{dish.nameEn}</span>
                  </span>
                  <span className="text-xl">{has ? '✅' : '⬜'}</span>
                </button>

                {has && (
                  <div className="mt-2 flex flex-wrap px-1">
                    {OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        aria-pressed={mine?.rating === o.value}
                        onClick={() =>
                          onRate(
                            dish.id,
                            mine?.rating === o.value
                              ? null
                              : { rating: o.value, overrated: mine?.overrated ?? false }
                          )
                        }
                        className="chip"
                      >
                        {o.label}
                      </button>
                    ))}
                    <button
                      disabled={!mine}
                      aria-pressed={mine?.overrated ?? false}
                      onClick={() => mine && onRate(dish.id, { ...mine, overrated: !mine.overrated })}
                      className="chip warn disabled:opacity-40"
                    >
                      🙄 ওভাররেটেড
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
