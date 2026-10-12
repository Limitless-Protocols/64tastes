'use client';
import { useRef } from 'react';
import { Check, X } from 'lucide-react';
import { districtById, dishesByDistrict } from '@/lib/data';
import { bn } from '@/lib/format';
import PhotoSlot from './PhotoSlot';
import { Chip } from './ui';
import type { Dish } from '@/lib/types';

type Props = {
  districtId: string;
  eaten: Set<number>;
  onToggle: (dishId: number, el?: HTMLElement | null) => void;
  onOpenDish: (dish: Dish) => void;
  onClose: () => void;
};

/**
 * MapDishPopup — district entry. Tapping a district on the map opens this
 * (single-step, no two-step flow). Lists the district's dishes with an eaten
 * toggle; tapping a dish opens DishDetailModal. Distinct from DishDetailModal.
 */
export default function MapDishPopup({
  districtId, eaten, onToggle, onOpenDish, onClose,
}: Props) {
  const d = districtById[districtId];
  const list = dishesByDistrict[districtId] ?? [];
  const listRef = useRef<HTMLDivElement>(null);

  if (!d) return null;

  return (
    <div
      className="mb"
      role="dialog"
      aria-modal="true"
      aria-label={`${d.nameBn} খাবার`}
      data-testid="map-dish-popup"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="sheet">
        <div className="p-top" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="p-label">📍 {d.nameBn}</div>
            <div className="dish-en">{d.nameEn}</div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="বন্ধ করো">
            <X className="icon" aria-hidden="true" />
          </button>
        </div>
        <div ref={listRef} className="mp-list">
          {list.map((dish) => {
            const isEaten = eaten.has(dish.id);
            return (
              <div key={dish.id} className="mp-row">
                <button
                  className="mp-open"
                  onClick={() => onOpenDish(dish)}
                  aria-label={`${dish.nameBn} বিস্তারিত`}
                >
                  <PhotoSlot dish={dish} className="mp-ph" />
                  <span className="mp-names">
                    <b>{dish.nameBn}</b>
                    <span className="dish-en">{dish.nameEn}</span>
                  </span>
                </button>
                <Chip
                  on={isEaten}
                  aria-pressed={isEaten}
                  aria-label={`${dish.nameBn} চেখেছি`}
                  onClick={(e) => onToggle(dish.id, e.currentTarget)}
                >
                  {isEaten ? <Check className="icon" aria-hidden="true" /> : null}
                  চেখেছি
                </Chip>
              </div>
            );
          })}
          {!list.length && <p className="sheet-empty">এই জেলার কোনো খাবার এখনো যোগ করা হয়নি।</p>}
        </div>
        <p className="note">
          এই জেলায় {bn(list.filter((x) => eaten.has(x.id)).length)}/{bn(list.length)} টি খাবার চেখেছ।
        </p>
      </div>
    </div>
  );
}
