'use client';
import { districtById, dishesByDistrict } from '@/lib/data';

type Props = {
  districtId: string;
  eaten: Set<number>;
  onToggle: (id: number) => void;
  onClose: () => void;
};

export default function DistrictSheet({ districtId, eaten, onToggle, onClose }: Props) {
  const district = districtById[districtId];
  const list = dishesByDistrict[districtId] ?? [];

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-lg rounded-t-2xl border-t border-gray-200 bg-white p-4 text-gray-900 shadow-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">{district.nameBn}</h2>
          <p className="text-sm text-gray-500">{district.nameEn}</p>
        </div>
        <button onClick={onClose} aria-label="Close" className="p-2 text-2xl leading-none">×</button>
      </div>

      {list.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">
          No famous dish listed yet. Know one? Suggestions are coming soon.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {list.map((dish) => {
            const has = eaten.has(dish.id);
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}