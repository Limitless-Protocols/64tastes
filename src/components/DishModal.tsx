'use client';
import { Map, MapPin, Shuffle, X } from 'lucide-react';
import { districtById } from '@/lib/data';
import type { Dish } from '@/lib/types';
import { stories, FALLBACK_STORY } from '@/lib/stories';
import PhotoSlot from './PhotoSlot';
import { PrimaryButton } from './ui';

type Props = {
  dish: Dish;
  /** "মানচিত্রে দেখো" — jump to the map tab with this district selected. */
  onShowOnMap: (districtId: string) => void;
  onClose: () => void;
  /** Surprise variant: show a re-roll button that picks another dish. */
  onReroll?: () => void;
};

/**
 * DishDetailModal — opened from the খাবার catalog, the সেরা boards, the
 * highlight polaroids, and Surprise. Photo on top, names + district + a short
 * history line. Distinct from MapDishPopup (district entry).
 */
export default function DishDetailModal({ dish, onShowOnMap, onClose, onReroll }: Props) {
  const d = districtById[dish.districtId];

  return (
    <div
      className="mb"
      role="dialog"
      aria-modal="true"
      aria-label={dish.nameBn}
      data-testid="dish-detail-modal"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal dish-modal">
        <PhotoSlot dish={dish} tag />
        <h2>
          {dish.nameBn}
          <button className="x" onClick={onClose} aria-label="বন্ধ করো">
            <X className="icon" aria-hidden="true" />
          </button>
        </h2>
        <div className="dish-en">{dish.nameEn}</div>
        <div className="dish-loc">
          <MapPin className="icon" aria-hidden="true" /> {d?.nameBn} · {d?.nameEn}
        </div>
        <p className="dish-story">{stories[dish.slug] ?? FALLBACK_STORY}</p>
        <div className="acts">
          <PrimaryButton onClick={() => onShowOnMap(dish.districtId)}>
            <Map className="icon" aria-hidden="true" /> মানচিত্রে দেখো
          </PrimaryButton>
          {onReroll && (
            <PrimaryButton onClick={onReroll}>
              <Shuffle className="icon" aria-hidden="true" /> অন্য খাবার দেখাও
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
