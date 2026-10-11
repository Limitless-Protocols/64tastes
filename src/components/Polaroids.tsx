'use client';
import type { CSSProperties } from 'react';
import { districtById, dishesByDistrict } from '@/lib/data';
import type { Rating } from '@/lib/useRatings';
import PhotoSlot from './PhotoSlot';

type Props = {
  ratings: Record<number, Rating>;
  onSelect: (districtId: string) => void;
  onHeart: (dishId: number, el: HTMLElement | null) => void;
};

/** Two tilted polaroids on the left; the heart marks a dish "দারুণ". */
const FEATURED = ['dhaka', 'cumilla'];

export default function Polaroids({ ratings, onSelect, onHeart }: Props) {
  return (
    <section className="cards" aria-label="প্রিয় খাবার">
      {FEATURED.map((id, i) => {
        const dish = (dishesByDistrict[id] ?? [])[0];
        if (!dish) return null;
        const district = districtById[id];
        const loved = ratings[dish.id] === 'love';
        return (
          <div
            key={id}
            className="pola"
            style={{ '--r': i ? '5deg' : '-6deg' } as CSSProperties}
            role="button"
            tabIndex={0}
            aria-label={`${dish.nameBn} — ${district.nameBn}`}
            onClick={() => onSelect(id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(id);
              }
            }}
          >
            <PhotoSlot dish={dish} />
            <b>{dish.nameBn}</b>
            <small className="en">{dish.nameEn}</small>
            <small>📍 {district.nameBn}</small>
            <button
              className={`heart${loved ? ' on' : ''}`}
              aria-label="দারুণ"
              aria-pressed={loved}
              onClick={(e) => {
                e.stopPropagation();
                onHeart(dish.id, e.currentTarget);
              }}
            >
              {loved ? '♥' : '♡'}
            </button>
          </div>
        );
      })}
    </section>
  );
}
