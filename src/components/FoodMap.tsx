'use client';
import { useState } from 'react';
import { districts, dishesByDistrict, paths, viewBox, totalDishes } from '@/lib/data';
import { useProgress } from '@/lib/useProgress';
import { getTier } from '@/lib/tiers';
import DistrictSheet from './DistrictSheet';
import SharePanel from './SharePanel';

export default function FoodMap() {
  const { eaten, toggle, reset } = useProgress();
  const [selected, setSelected] = useState<string | null>(null);

  const count = eaten.size;
  const tier = getTier(count, totalDishes);
  const pct = totalDishes ? Math.round((count / totalDishes) * 100) : 0;

  const [showShare, setShowShare] = useState(false);

  function fillClass(districtId: string) {
    const list = dishesByDistrict[districtId] ?? [];
    if (list.length === 0) return 'fill-gray-200 hover:fill-gray-300';
    const n = list.filter((d) => eaten.has(d.id)).length;
    if (n === 0) return 'fill-amber-100 hover:fill-amber-300';
    if (n < list.length) return 'fill-emerald-300 hover:fill-emerald-400';
    return 'fill-emerald-600 hover:fill-emerald-700';
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
      </header>

      <svg viewBox={viewBox} className="h-auto w-full" role="group" aria-label="Map of Bangladesh districts">
        {districts.map((d) => (
          <path
            key={d.id}
            d={paths[d.id]}
            vectorEffect="non-scaling-stroke"
            className={`${fillClass(d.id)} cursor-pointer stroke-white stroke-1 outline-none transition-colors`}
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
        {/* Selected outline drawn last so neighbours don't cover it */}
        {selected && (
          <path
            d={paths[selected]}
            fill="none"
            vectorEffect="non-scaling-stroke"
            className="pointer-events-none stroke-gray-900 stroke-2"
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
          onToggle={toggle}
          onClose={() => setSelected(null)}
        />
      )}

      {showShare && <SharePanel eaten={eaten} onClose={() => setShowShare(false)} />}
    </div>
  );
}