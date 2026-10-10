'use client';
import { useState } from 'react';
import { districts, paths, viewBox, totalDishes } from '@/lib/data';
import { useProgress } from '@/lib/useProgress';
import { getTier } from '@/lib/tiers';
import { districtTone, type DistrictTone } from '@/lib/colors';
import DistrictSheet from './DistrictSheet';
import SharePanel from './SharePanel';
import Link from 'next/link';
import { usePlacePicks } from '@/lib/usePlacePicks';
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
  const { ratings, rate } = useRatings();
  const { picks, pick, clearLocal } = usePlacePicks();
  const [selected, setSelected] = useState<string | null>(null);

  const count = eaten.size;
  const tier = getTier(count, totalDishes);
  const pct = totalDishes ? Math.round((count / totalDishes) * 100) : 0;

  const [showShare, setShowShare] = useState(false);

  function handleToggle(id: number) {
    if (eaten.has(id)) {
      if (ratings[id]) rate(id, null);
      clearLocal(id);
    }
    toggle(id);
  }

  function fillOf(districtId: string) {
    return FILLS[districtTone(districtId, eaten)];
  }

  return (
    <div className={selected ? 'pb-72' : ''}>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">বাংলাদেশ ফুড ম্যাপ</h1>
        <p className="text-sm text-gray-500">Bangladesh Food Map</p>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="font-semibold">{tier.bn}</span>
          <span className="text-sm text-gray-600">{count} / {totalDishes}</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-gray-200">
          <div className="h-2 rounded-full bg-emerald-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-xs text-gray-500">{tier.en}</p>
        {count > 0 && (
          <button
            onClick={() => setShowShare(true)}
            className="mt-3 w-full rounded-lg bg-emerald-600 py-2 font-medium text-white"
          >
            Share my map
          </button>
        )}
        <Link href="/top" className="mt-2 inline-block text-sm text-emerald-700 underline">সেরা খাবার দেখো →</Link>
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

      <footer className="mt-6 text-xs text-gray-400">
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
        places={picks}
        onToggle={handleToggle}
        onRate={rate}
        onPlace={pick}
        onClose={() => setSelected(null)}
      />
      )}

      {showShare && <SharePanel eaten={eaten} onClose={() => setShowShare(false)} />}
    </div>
  );
}