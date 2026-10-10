'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import MiniMap from './MiniMap';
import { decodeProgress } from '@/lib/share';
import { useProgress } from '@/lib/useProgress';
import { dishes, totalDishes } from '@/lib/data';
import { getTier } from '@/lib/tiers';
import { bn } from '@/lib/format';

export default function ResultView({ code }: { code: string }) {
  const theirs = useMemo(() => decodeProgress(code), [code]);
  const { eaten: mine, loaded } = useProgress();
  const tier = getTier(theirs.size, totalDishes);

  const hasMine = loaded && mine.size > 0;
  const theyHaveYouDont = dishes.filter((d) => theirs.has(d.id) && !mine.has(d.id));

  return (
    <main className="mx-auto max-w-lg p-4 text-gray-900">
      <p className="text-sm text-gray-500">বাংলাদেশ ফুড ম্যাপ</p>
      <h1 className="text-2xl font-bold">{tier.bn}</h1>
      <p className="mt-1 text-gray-700">
        {bn(theirs.size)} / {bn(totalDishes)} খাবার চেখে দেখেছেন
      </p>

      <MiniMap eaten={theirs} style={{ width: '100%', height: 'auto', marginTop: 16 }} />

      {hasMine ? (
        <section className="mt-4 rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold">তোমার সাথে তুলনা</h2>
          <p className="mt-1 text-sm text-gray-700">
            তুমি {bn(mine.size)}টি · তারা {bn(theirs.size)}টি
          </p>
          {theyHaveYouDont.length > 0 ? (
            <>
              <p className="mt-3 text-sm text-gray-700">
                তারা চেখেছেন কিন্তু তুমি এখনও চাখোনি ({bn(theyHaveYouDont.length)}টি):
              </p>
              <ul className="mt-1 list-inside list-disc text-sm">
                {theyHaveYouDont.slice(0, 6).map((d) => (
                  <li key={d.id}>{d.nameBn}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-3 text-sm text-gray-700">তুমি তাদের সব খাবারই চেখেছ!</p>
          )}
        </section>
      ) : (
        <p className="mt-4 text-sm text-gray-600">নিজের ম্যাপ বানালে এখানে তুলনা দেখতে পাবে।</p>
      )}

      <Link
        href="/"
        className="mt-4 block rounded-lg bg-emerald-600 py-3 text-center font-medium text-white"
      >
        আমার ম্যাপ বানাই
      </Link>
    </main>
  );
}