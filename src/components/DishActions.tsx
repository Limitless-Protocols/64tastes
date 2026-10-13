'use client';
import { Check, MapPin } from 'lucide-react';
import { districtById } from '@/lib/data';
import { stories, FALLBACK_STORY } from '@/lib/stories';
import { useProgress } from '@/lib/useProgress';
import { useRatings, RATING_OPTIONS, type MyRating } from '@/lib/useRatings';
import { usePlacePicks } from '@/lib/usePlacePicks';
import PhotoSlot from './PhotoSlot';
import PlaceRow from './PlaceRow';
import { Chip, PrimaryButton } from './ui';
import type { Dish } from '@/lib/types';

/**
 * DishActions — the interactive half of the dish PAGE (/dishes/[slug]).
 * This is the old in-popup recipe card's চেখেছি button, reaction chips and
 * কোথায় পাবেন row, moved onto the page so clicking a dish can open the page
 * instead of a card without losing any control.
 */
export default function DishActions({ dish }: { dish: Dish }) {
  const { eaten, toggle } = useProgress();
  const { ratings, rate, toggleOverrated } = useRatings();
  const { picks, pick } = usePlacePicks();

  const d = districtById[dish.districtId];
  const on = eaten.has(dish.id);
  const rating: MyRating | undefined = ratings[dish.id];

  return (
    <>
      <div className="dish-head">
        <PhotoSlot dish={dish} tag />
        <div className="dish-head-txt">
          <h1>{dish.nameBn}</h1>
          <div className="dish-en">{dish.nameEn}</div>
        </div>
      </div>
      <div className="dish-loc">
        <MapPin className="icon" aria-hidden="true" />{' '}
        <a className="dish-loc-link" href={`/?district=${dish.districtId}`}>
          {d.nameBn} · {d.nameEn}
        </a>
      </div>
      <p className="dish-story">{stories[dish.slug] ?? FALLBACK_STORY}</p>

      <PrimaryButton
        className={`check${on ? ' on' : ''}`}
        aria-pressed={on}
        onClick={() => toggle(dish.id)}
      >
        {on ? (<><Check className="icon" aria-hidden="true" /> চেখেছি</>) : 'চেখেছি?'}
      </PrimaryButton>

      <div className={`chips${on ? ' open' : ''}`}>
        {RATING_OPTIONS.map((r) => (
          <Chip
            key={r.v}
            on={rating?.rating === r.v}
            onClick={() =>
              rate(dish.id, rating?.rating === r.v ? null : { rating: r.v, overrated: rating?.overrated ?? false })
            }
          >
            {r.e} {r.bn}
          </Chip>
        ))}
        <Chip over on={!!rating?.overrated} disabled={!rating} onClick={() => toggleOverrated(dish.id)}>
          🙄 ওভাররেটেড
        </Chip>
      </div>

      <PlaceRow
        name={picks[dish.id]}
        onSave={(n) => pick(dish.id, n)}
        onClear={() => pick(dish.id, null)}
      />
    </>
  );
}
