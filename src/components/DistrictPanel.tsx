'use client';
import { Check, Eye, MapPin } from 'lucide-react';
import { districtById, dishesByDistrict } from '@/lib/data';
import { BREAKPOINTS, useMedia } from '@/lib/hooks';
import { stories, FALLBACK_STORY } from '@/lib/stories';
import type { Dish } from '@/lib/types';
import PhotoSlot from './PhotoSlot';
import { PrimaryButton } from './ui';

type Props = {
  districtId: string | null;
  eaten: Set<number>;
  /** "বিস্তারিত দেখো" (card) / tapping the flap body (phones) → detail sheet. */
  onOpenDish: (dish: Dish) => void;
  onToggle: (dishId: number, el: HTMLElement | null) => void;
  onSuggest: () => void;
};

/**
 * The Dish of the Day piece — a STATIC highlight card, never a live district
 * panel (a district's own dish list lives in the map popup, and the selection
 * never replaces this card):
 *  · ≥768px: label (in FoodMap) + photo + names + district + one-line story +
 *    "বিস্তারিত দেখো". No চেখেছি button, no rating chips, no place row.
 *  · phones: the 112px page flap — mango tab "আজকের স্পেশাল", photo, names,
 *    district and the 44px চেখেছি pill; tapping the rest opens the detail.
 * One component, a variant prop — same data, same handlers (design pass §5).
 */
export default function DistrictPanel({ districtId, eaten, onOpenDish, onToggle, onSuggest }: Props) {
  const isMobile = useMedia(BREAKPOINTS.mobile);
  const list = districtId ? dishesByDistrict[districtId] ?? [] : [];
  const dish = list[0];

  if (!dish || !districtId) {
    return (
      <div className="p-body swap" key={districtId ?? 'soon'}>
        <div className="soon">
          <b>শীঘ্রই আসছে</b>
          Dish coming soon
          <br />
          <button className="link" onClick={onSuggest}>খাবার সাজেস্ট করো</button>
        </div>
      </div>
    );
  }

  const district = districtById[districtId];
  const on = eaten.has(dish.id);

  // --- phones: the 112px page flap ------------------------------------------
  if (isMobile) {
    return (
      <div className="flap" key={districtId}>
        <span className="flap-tab">আজকের স্পেশাল</span>
        <button
          className="flap-main"
          onClick={() => onOpenDish(dish)}
          aria-label={`${dish.nameBn} — বিস্তারিত দেখো`}
        >
          <PhotoSlot dish={dish} className="flap-ph" />
          <span className="flap-txt">
            <b className="flap-name">{dish.nameBn}</b>
            <em className="flap-en">{dish.nameEn}</em>
            <span className="flap-dist">
              <MapPin className="icon" aria-hidden="true" /> {district.nameBn}
            </span>
          </span>
        </button>
        <PrimaryButton
          className={`flap-check${on ? ' on' : ''}`}
          aria-pressed={on}
          onClick={(e) => onToggle(dish.id, e.currentTarget)}
        >
          {on ? (
            <>
              <Check className="icon" aria-hidden="true" /> চেখেছি
            </>
          ) : (
            'চেখেছি?'
          )}
        </PrimaryButton>
      </div>
    );
  }

  // --- desktop / tablet: the static highlight card ---------------------------
  return (
    <div className="p-body swap" key={districtId}>
      <div className="p-top">
        <PhotoSlot dish={dish} />
        <div className="p-info">
          <div className="p-name">{dish.nameBn}</div>
          <div className="p-en">{dish.nameEn}</div>
        </div>
      </div>

      <div className="p-meta">
        <span>
          <MapPin className="icon" aria-hidden="true" /> {district.nameBn}
        </span>
      </div>

      <p className="p-desc">{stories[dish.slug] ?? FALLBACK_STORY}</p>

      <PrimaryButton onClick={() => onOpenDish(dish)}>
        <Eye className="icon" aria-hidden="true" /> বিস্তারিত দেখো
      </PrimaryButton>
    </div>
  );
}
