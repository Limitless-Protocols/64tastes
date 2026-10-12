'use client';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { artFor, photoUrl } from '@/lib/art';
import type { Dish } from '@/lib/types';

/**
 * Style guide §4 — every photo frame is a `.ph` slot: a category-tinted
 * gradient underneath, a real <img> on top. When a dish has no photo (or the
 * image fails), the placeholder shows a large Bangla first letter over the
 * tint; `tag` adds the "ছবি শীঘ্রই" sticker (catalog cards). Never a broken icon.
 * Bilingual alt text on every image.
 */
export default function PhotoSlot({
  dish,
  className,
  tag = false,
}: {
  dish: Dish;
  className?: string;
  /** Show the "ছবি শীঘ্রই" sticker on the placeholder (catalog cards). */
  tag?: boolean;
}) {
  const art = artFor(dish);
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(art.photo) && !failed;

  return (
    <div
      className={className ? `ph ${className}` : 'ph'}
      style={{ '--a': art.a, '--b': art.b } as CSSProperties}
    >
      {/* the tinted placeholder is always underneath; a loaded photo covers it */}
      <span className="ph-letter" aria-hidden="true">
        {dish.nameBn.trim()[0]}
      </span>
      {tag && !showPhoto && <span className="ph-tag">ছবি শীঘ্রই</span>}
      {art.photo && !failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl(art.photo)}
          alt={`${dish.nameBn} · ${dish.nameEn}`}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
