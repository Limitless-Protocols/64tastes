'use client';
import { Map, MapPin, Shuffle, X } from 'lucide-react';
import { districtById } from '@/lib/data';
import type { Dish } from '@/lib/types';
import { stories, FALLBACK_STORY } from '@/lib/stories';
import { useFocusTrap } from '@/lib/focus';
import PhotoSlot from './PhotoSlot';
import { PrimaryButton } from './ui';

type Props = {
  dish: Dish;
  /** "মানচিত্রে দেখো" — jump to the map tab with this district selected. */
  onShowOnMap: (districtId: string) => void;
  onClose: () => void;
  /** Surprise variant: a 🎲 badge, an "another dish" re-roll, and a label
      announcing the pick came from Surprise (never repeats the current dish). */
  onReroll?: () => void;
  surprise?: boolean;
};

/**
 * DishDetailModal — now only Surprise's re-roll card. Every other dish click
 * opens the dish's page at /dishes/[slug] instead. Photo on top, names +
 * district + a short history line. Distinct from MapDishPopup (district list).
 */
export default function DishDetailModal({ dish, onShowOnMap, onClose, onReroll, surprise = false }: Props) {
  const d = districtById[dish.districtId];
  const ref = useFocusTrap<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className="mb sheet-mb"
      role="dialog"
      aria-modal="true"
      aria-label={surprise ? `সারপ্রাইজ: ${dish.nameBn}` : dish.nameBn}
      data-testid="dish-detail-modal"
      tabIndex={-1}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal dish-modal">
        {surprise && <span className="dice-tag">🎲 সারপ্রাইজ</span>}
        {/* display:contents ≥768px (previous order kept); phones put the
            photo and the names into one sheet-header row */}
        <div className="dish-head">
          <PhotoSlot dish={dish} tag />
          <div className="dish-head-txt">
            <h2>
              {dish.nameBn}
              <button className="x" onClick={onClose} aria-label="বন্ধ করো">
                <X className="icon" aria-hidden="true" />
              </button>
            </h2>
            <div className="dish-en">{dish.nameEn}</div>
          </div>
        </div>
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
