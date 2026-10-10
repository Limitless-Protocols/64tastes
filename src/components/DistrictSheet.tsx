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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
