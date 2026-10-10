'use client';
import { districtById, dishesByDistrict } from '@/lib/data';
import type { MyRating, Rating } from '@/lib/useRatings';
import PlaceRow from './PlaceRow';
import SuggestForm from './SuggestForm';

const OPTIONS: { value: Rating; label: string }[] = [
  { value: 'loved', label: '😍 দারুণ' },
  { value: 'okay', label: '🙂 মোটামুটি' },
  { value: 'not_for_me', label: '😕 পছন্দ হয়নি' },
];

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

export default function DistrictSheet({
  districtId, eaten, ratings, places, onToggle, onRate, onPlace, onClose,
}: Props) {
  const district = districtById[districtId];
  const list = dishesByDistrict[districtId] ?? [];

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-h-[70vh] max-w-lg overflow-y-auto rounded-t-2xl border-t border-gray-200 bg-white p-4 text-gray-900 shadow-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">{district.nameBn}</h2>
          <p className="text-sm text-gray-500">{district.nameEn}</p>
        </div>
        <button onClick={onClose} aria-label="Close" className="p-2 text-2xl leading-none">×</button>
      </div>

      {list.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">
          এই জেলার বিখ্যাত খাবার এখনও যোগ হয়নি। তুমি জানলে বলো!
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {list.map((dish) => {
            const has = eaten.has(dish.id);
            const mine = ratings[dish.id];
            return (
              <li key={dish.id}>
                <button
                  onClick={() => onToggle(dish.id)}
                  aria-pressed={has}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left ${
                    has ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200'
                  }`}
                >
                  <span>
                    <span className="block font-medium">{dish.nameBn}</span>
                    <span className="block text-sm text-gray-500">{dish.nameEn}</span>
                  </span>
                  <span className="text-xl">{has ? '✅' : '⬜'}</span>
                </button>

                {has && (
                  <>
                    <div className="mt-2 flex flex-wrap gap-2 px-1">
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
                          className={`rounded-full border px-3 py-1 text-sm ${
                            mine?.rating === o.value
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                              : 'border-gray-300 text-gray-700'
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                      <button
                        disabled={!mine}
                        aria-pressed={mine?.overrated ?? false}
                        onClick={() => mine && onRate(dish.id, { ...mine, overrated: !mine.overrated })}
                        className={`rounded-full border px-3 py-1 text-sm disabled:opacity-40 ${
                          mine?.overrated
                            ? 'border-amber-600 bg-amber-50 text-amber-800'
                            : 'border-gray-300 text-gray-700'
                        }`}
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