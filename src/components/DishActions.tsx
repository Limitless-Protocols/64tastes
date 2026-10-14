'use client';
import { Check } from 'lucide-react';
import { useProgress } from '@/lib/useProgress';
import { useRatings, RATING_OPTIONS, type MyRating } from '@/lib/useRatings';
import { usePlacePicks } from '@/lib/usePlacePicks';
import PlaceRow from './PlaceRow';
import { Chip, PrimaryButton } from './ui';
import type { Dish } from '@/lib/types';

/**
 * DishActions — the interactive controls for one dish: the চেখেছি toggle, the
 * reaction chips (incl. ওভাররেটেড) and the কোথায় পাবেন row. Used in two places:
 *   - the wiki page /dishes/[slug] (full set, `compact` off)
 *   - the map popup's dish card (tick & rate only, `compact` on)
 * The head/story/photo live with whichever surface renders them.
 */
export default function DishActions({ dish, compact = false }: { dish: Dish; compact?: boolean }) {
  const { eaten, toggle } = useProgress();
  const { ratings, rate, toggleOverrated } = useRatings();
  const { picks, pick } = usePlacePicks();

  const on = eaten.has(dish.id);
  const rating: MyRating | undefined = ratings[dish.id];

  return (
    <>
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

      {!compact && (
        <PlaceRow
          name={picks[dish.id]}
          onSave={(n) => pick(dish.id, n)}
          onClear={() => pick(dish.id, null)}
        />
      )}
    </>
  );
}
