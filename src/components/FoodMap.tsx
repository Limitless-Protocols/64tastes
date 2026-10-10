'use client';
import { useState } from 'react';
import { districts, paths, viewBox, totalDishes } from '@/lib/data';
import { useProgress } from '@/lib/useProgress';
import { getTier } from '@/lib/tiers';
import { districtTone, type DistrictTone } from '@/lib/colors';
import DistrictSheet from './DistrictSheet';
import SharePanel from './SharePanel';
import Link from 'next/link';
import Verifier from './Verifier';
import { useRatings } from '@/lib/useRatings';

/** Base fill vs. the darker shade used to highlight the selected district. */
const FILLS: Record<DistrictTone, { base: string; selected: string }> = {
  empty: { base: 'fill-gray-200 hover:fill-gray-300', selected: 'fill-gray-400' },
  new: { base: 'fill-amber-100 hover:fill-amber-300', selected: 'fill-amber-400' },
  partial: { base: 'fill-emerald-300 hover:fill-emerald-400', selected: 'fill-emerald-500' },
  complete: { base: 'fill-emerald-600 hover:fill-emerald-700', selected: 'fill-emerald-800' },
};

export default function FoodMap() {
  const { eaten, toggle, reset } = useProgress();
  const { ratings, rate, needsVerify, verify } = useRatings();
  const [selected, setSelected] = useState<string | null>(null);

  const count = eaten.size;
  const tier = getTier(count, totalDishes);
  const pct = totalDishes ? Math.round((count / totalDishes) * 100) : 0;

  const [showShare, setShowShare] = useState(false);

  function handleToggle(id: number) {
    if (eaten.has(id) && ratings[id]) rate(id, null); // un-eating removes the rating
    toggle(id);
  }

  function fillOf(districtId: string) {
    return FILLS[districtTone(districtId, eaten)];
  }

  return (
    <div className={selected ? 'pb-72' : ''}>
      <header className="mb-4">
        <h1>বাংলাদেশ ফুড ম্যাপ</h1>
        <p className="caption">Bangladesh Food Map</p>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="font-semibold">{tier.bn}</span>
          <span className="counter">{count} / {totalDishes}</span>
        </div>
        <div className="progress mt-1">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="caption mt-1">{tier.en}</p>
        {count > 0 && (
          <button
            onClick={() => setShowShare(true)}
            className="btn btn-primary mt-3 w-full"
          >
            Share my map
          </button>
        )}
        <Link href="/top" className="mt-2 inline-block text-sm text-brand-700 underline">সেরা খাবার দেখো →</Link>
      </header>

      <svg viewBox={viewBox} className="h-auto w-full" role="group" aria-label="Map of Bangladesh districts">
        {districts.map((d) => (
          <path
            key={d.id}
            d={paths[d.id]}
            vectorEffect="non-scaling-stroke"
            className={`${fillOf(d.id).base} cursor-pointer stroke-white stroke-1 outline-none transition-colors`}
            role="button"
            tabIndex={0}
            aria-label={d.nameEn}
            onClick={() => setSelected(d.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelected(d.id);
              }
            }}
          />
        ))}
        {/* Selected district filled in a darker shade of its normal colour, drawn
            last so neighbours don't cover it */}
        {selected && (
          <path
            d={paths[selected]}
            vectorEffect="non-scaling-stroke"
            className={`${fillOf(selected).selected} pointer-events-none stroke-white stroke-1 transition-colors`}
          />
        )}
      </svg>

      <footer className="caption mt-6">
        <button
          className="underline"
          onClick={() => { if (confirm('Reset all progress?')) reset(); }}
        >
          Reset progress
        </button>
        <p className="mt-2">Map data: geoBoundaries</p>
      </footer>

      {selected && (
        <DistrictSheet
          districtId={selected}
          eaten={eaten}
          ratings={ratings}
          onToggle={handleToggle}
          onRate={rate}
          onClose={() => setSelected(null)}
        />
      )}

      {showShare && <SharePanel eaten={eaten} onClose={() => setShowShare(false)} />}
      {needsVerify && (
        <div className="modal-backdrop">
          <div className="modal text-center">
            <p className="mb-3 caption">একটু যাচাই করছি…</p>
            <Verifier onToken={verify} />
          </div>
        </div>
      )}
    </div>
  );
}