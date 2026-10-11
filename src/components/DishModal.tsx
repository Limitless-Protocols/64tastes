'use client';
import { districtById } from '@/lib/data';
import type { Dish } from '@/lib/types';
import { stories, FALLBACK_STORY } from '@/lib/stories';
import PhotoSlot from './PhotoSlot';

type Props = {
  dish: Dish;
  /** "মানচিত্রে দেখো" — jump to the map tab with this district selected. */
  onShowOnMap: (districtId: string) => void;
  onClose: () => void;
};

/**
 * Dish detail modal — opened from the খাবার catalog and the সেরা boards
 * instead of jumping to the map. Photo on top, names + district + a short
 * (currently temporary — see lib/stories.ts) history line underneath.
 */
export default function DishModal({ dish, onShowOnMap, onClose }: Props) {
  const d = districtById[dish.districtId];

  return (
    <div
      className="mb"
      role="dialog"
      aria-modal="true"
      aria-label={dish.nameBn}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal dish-modal">
        <PhotoSlot dish={dish} />
        <h2>
          {dish.nameBn}
          <button className="x" onClick={onClose} aria-label="বন্ধ করো">✕</button>
        </h2>
        <div className="dish-en">{dish.nameEn}</div>
        <div className="dish-loc">📍 {d?.nameBn} · {d?.nameEn}</div>
        <p className="dish-story">{stories[dish.slug] ?? FALLBACK_STORY}</p>
        <button className="btn" onClick={() => onShowOnMap(dish.districtId)}>
          🗺️ মানচিত্রে দেখো
        </button>
      </div>
    </div>
  );
}
