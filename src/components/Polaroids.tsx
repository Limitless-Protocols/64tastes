'use client';
import type { CSSProperties } from 'react';
import { Heart, MapPin } from 'lucide-react';
import { districtById, dishesByDistrict } from '@/lib/data';
import type { MyRating } from '@/lib/useRatings';
import PhotoSlot from './PhotoSlot';

type Props = {
  ratings: Record<number, MyRating>;
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
        const loved = ratings[dish.id]?.rating === 'love';
        return (
          <div
            key={id}
            className="pola"
            style={{ '--r': i ? '5deg' : '-6deg' } as CSSProperties}
          >
            <PhotoSlot dish={dish} />
            <b>{dish.nameBn}</b>
            <small className="en">{dish.nameEn}</small>
            <small>
              <MapPin className="icon" aria-hidden="true" style={{ width: 13, height: 13 }} />{' '}
              {district.nameBn}
            </small>
            <button
              className="pola-hit"
              aria-label={`${dish.nameBn} — ${district.nameBn}`}
              onClick={() => onSelect(id)}
            />
            <button
              className={`heart${loved ? ' on' : ''}`}
              aria-label="দারুণ"
              aria-pressed={loved}
              onClick={(e) => {
                e.stopPropagation();
                onHeart(dish.id, e.currentTarget);
              }}
            >
              <Heart className="icon" aria-hidden="true" fill={loved ? 'currentColor' : 'none'} style={{ width: 22, height: 22 }} />
            </button>
          </div>
        );
      })}
    </section>
  );
}
