import { bn } from '@/lib/format';
import type { Spot } from '@/lib/spots';

export default function TopSpots({ spots }: { spots: Spot[] }) {
  const shown = spots.filter((s) => s.name);
  if (shown.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold">📍 জনপ্রিয় জায়গা</h2>
      <ul className="mt-2 space-y-2">
        {shown.map((s) => (
          <li key={s.id} className="flex justify-between rounded-lg border border-gray-200 px-3 py-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + ' Bangladesh')}`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 underline"
            >
              {s.name}
            </a>
            <span className="text-sm text-gray-600">{bn(s.picks)} জন</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-gray-400">ব্যবহারকারীদের দেওয়া তথ্য</p>
    </section>
  );
}