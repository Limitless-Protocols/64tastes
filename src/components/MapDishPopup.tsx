'use client';
import { Check, ChevronLeft, X } from 'lucide-react';
import { districtById, dishesByDistrict } from '@/lib/data';
import { bn } from '@/lib/format';
import { useFocusTrap } from '@/lib/focus';
import PhotoSlot from './PhotoSlot';
import { PrimaryButton } from './ui';
import type { Dish } from '@/lib/types';

type Props = {
  districtId: string;
  eaten: Set<number>;
  /** Tapping a dish opens its CARD (tick & rate) — the popup never navigates
      to the dishes page; the full wiki article is reached from the book tabs. */
  onOpenDish: (dish: Dish) => void;
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
 * MapDishPopup — the district popup: mouse click / Enter on desktop, a plain
 * tap on a phone (no hold gesture). On ≤767px CSS turns it into a bottom
 * sheet (`.sheet-mb`). Shows the district's name, a short culinary brief and
 * its dish list; tapping a dish opens its CARD (tick চেখেছি + rate) on top —
 * from here users rate, they don't browse away to the dishes page. A district
 * with no food just offers a suggestion prompt.
 */
export default function MapDishPopup({ districtId, eaten, onOpenDish, onSuggest, onClose }: Props) {
  // One trap for whichever root is mounted (list / no-food); the ref is
  // attached to each branch's dialog div.
  const ref = useFocusTrap<HTMLDivElement>();
  const d = districtById[districtId];
  const list = dishesByDistrict[districtId] ?? [];

  if (!d) return null;

  // --- no food at all: plain suggestion prompt -----------------------------
  if (!list.length) {
    return (
      <div
        ref={ref}
        className="mb sheet-mb"
        role="dialog"
        aria-modal="true"
        aria-label={`${d.nameBn} — খাবার নেই`}
        data-testid="map-dish-popup"
        tabIndex={-1}
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

  // --- list: district name + culinary brief + dish list ---------------------
  return (
    <div
      ref={ref}
      className="mb sheet-mb"
      role="dialog"
      aria-modal="true"
      aria-label={`${d.nameBn} খাবার`}
      data-testid="map-dish-popup"
      tabIndex={-1}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal dish-popup">
        <h2>
          📍 {d.nameBn}
          <button className="x" onClick={onClose} aria-label="বন্ধ করো">
            <X className="icon" aria-hidden="true" />
          </button>
        </h2>
        <div className="dish-en">
          {d.nameEn}
          {/* phones: the sheet header carries the dish count (hidden ≥768px) */}
          <span className="dish-count"> · {bn(list.length)}টি খাবার</span>
        </div>
        <p className="dish-story">{brief(d.nameBn, list)}</p>
        <div className="mp-list">
          {list.map((dish) => {
            const isEaten = eaten.has(dish.id);
            return (
              <button key={dish.id} className="mp-row" onClick={() => onOpenDish(dish)}>
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
