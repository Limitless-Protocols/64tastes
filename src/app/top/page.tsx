import { Suspense } from 'react';
import Link from 'next/link';
import { getDishStats } from '@/lib/stats';
import { buildRankings, MIN_VOTES } from '@/lib/ranking';
import { bn } from '@/lib/format';

export const metadata = { title: 'সেরা খাবার — Bangladesh Food Map' };

export default function TopPage() {
  return (
    <main className="mx-auto max-w-lg p-4 text-gray-900">
      <Link href="/" className="text-sm text-emerald-700 underline">← ম্যাপে ফিরি</Link>
      <h1 className="mt-2 text-2xl font-bold">সেরা খাবার</h1>
      <Suspense fallback={<p className="mt-4 text-gray-500">লোড হচ্ছে…</p>}>
        <Rankings />
      </Suspense>
    </main>
  );
}

const pct = (part: number, total: number) => bn(Math.round((part / total) * 100));

async function Rankings() {
  const { mostLoved, mostOverrated, districtRows } = buildRankings(await getDishStats());

  if (mostLoved.length === 0 && districtRows.length === 0) {
    return (
      <p className="mt-4 text-gray-600">
        এখনও যথেষ্ট ভোট জমেনি। তালিকা দেখাতে প্রতিটি খাবারে কমপক্ষে {bn(MIN_VOTES)}টি ভোট লাগবে।
      </p>
    );
  }

  const row = 'flex justify-between rounded-lg border border-gray-200 px-3 py-2';

  return (
    <>
      <section className="mt-6">
        <h2 className="text-lg font-semibold">😍 সবচেয়ে পছন্দের</h2>
        <ol className="mt-2 space-y-2">
          {mostLoved.map((r, i) => (
            <li key={r.dish.id}>
              <Link href={`/dish/${r.dish.slug}`} className={row}>
                <span>{bn(i + 1)}. {r.dish.nameBn}</span>
                <span className="text-gray-600">{pct(r.stat.loved, r.stat.votes)}%</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {mostOverrated.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">🙄 সবচেয়ে ওভাররেটেড</h2>
          <ol className="mt-2 space-y-2">
            {mostOverrated.map((r, i) => (
              <li key={r.dish.id}>
                <Link href={`/dish/${r.dish.slug}`} className={row}>
                  <span>{bn(i + 1)}. {r.dish.nameBn}</span>
                  <span className="text-gray-600">{pct(r.stat.overrated, r.stat.votes)}%</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {districtRows.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">🏆 সেরা খাবারের জেলা</h2>
          <ol className="mt-2 space-y-2">
            {districtRows.map((r, i) => (
              <li key={r.district.id} className={row}>
                <span>{bn(i + 1)}. {r.district.nameBn}</span>
                <span className="text-gray-600">{pct(r.loved, r.votes)}%</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}