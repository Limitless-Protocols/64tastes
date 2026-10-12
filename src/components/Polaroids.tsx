'use client';
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Heart, MapPin } from 'lucide-react';
import { districts, dishesByDistrict } from '@/lib/data';
import { useHydrated } from '@/lib/store';
import type { MyRating } from '@/lib/useRatings';
import type { Dish } from '@/lib/types';
import PhotoSlot from './PhotoSlot';

type Props = {
  ratings: Record<number, MyRating>;
  /** Clicking a polaroid opens that dish's recipe card directly. */
  onOpenDish: (dish: Dish) => void;
  onHeart: (dishId: number, el: HTMLElement | null) => void;
};

/** Two tilted polaroids on the left; the heart marks a dish "দারুণ". */
const COUNT = 2;

// Per-load entropy for the rotation. Evaluated once when the module loads (i.e.
// on every reload), outside of render, so React stays pure — the pick below is
// a deterministic function of this seed. The server always renders the opening
// pair, then the client re-picks once it owns the DOM (no hydration mismatch).
const ROTATE_SEED = Math.floor(Math.random() * 1_000_000);

export default function Polaroids({ ratings, onOpenDish, onHeart }: Props) {
  const hydrated = useHydrated();

  // Rotate through the districts that actually have a dish: a fresh pair on
  // every reload.
  const featured = useMemo(() => {
    const pool = districts.filter((d) => (dishesByDistrict[d.id] ?? []).length > 0);
    if (pool.length <= COUNT) return pool;
    if (!hydrated) return pool.slice(0, COUNT);
    const a = ROTATE_SEED % pool.length;
    const step = 1 + ((ROTATE_SEED >> 8) % (pool.length - 1));
    const b = (a + step) % pool.length;
    return a === b ? pool.slice(0, COUNT) : [pool[a], pool[b]];
  }, [hydrated]);

  return (
    <section className="cards" aria-label="প্রিয় খাবার">
      {featured.map((district, i) => {
        const dish = (dishesByDistrict[district.id] ?? [])[0];
        if (!dish) return null;
        const loved = ratings[dish.id]?.rating === 'love';
        return (
          <div
            key={district.id}
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
              onClick={() => onOpenDish(dish)}
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
