'use client';
import type { CSSProperties } from 'react';
import { artFor, photoUrl } from '@/lib/art';
import type { Dish } from '@/lib/types';

/**
 * Style guide §4 — every photo frame is a `.ph` slot: gradient + emoji
 * underneath, a real <img> on top. If the image fails to load it removes
 * itself and the gradient stays; never a broken icon.
 */
export default function PhotoSlot({ dish, className }: { dish: Dish; className?: string }) {
  const art = artFor(dish);
  return (
    <div
      className={className ? `ph ${className}` : 'ph'}
      data-e={art.e}
      style={{ '--a': art.a, '--b': art.b } as CSSProperties}
    >
      {art.photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl(art.photo)}
          alt={`${dish.nameBn} · ${dish.nameEn}`}
          onError={(e) => e.currentTarget.remove()}
        />
      )}
    </div>
  );
}
