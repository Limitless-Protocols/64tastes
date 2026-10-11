'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import MiniMap from './MiniMap';
import { decodeProgress } from '@/lib/share';
import { useProgress } from '@/lib/useProgress';
import { dishes, totalDishes } from '@/lib/data';
import { getTier } from '@/lib/tiers';
import { bn } from '@/lib/format';

/** A shared map (/r/…) — one paper piece on the same wooden desk. */
export default function ResultView({ code }: { code: string }) {
  const theirs = useMemo(() => decodeProgress(code), [code]);
  const { eaten: mine } = useProgress();
  const tier = getTier(theirs.size, totalDishes);

  const hasMine = mine.size > 0;
  const theyHaveYouDont = dishes.filter((d) => theirs.has(d.id) && !mine.has(d.id));

  return (
    <>
      <div className="desk" aria-hidden="true" />
      <main className="book result">
        <article className="piece result-card">
          <div className="eyebrow">খাবার বুক · শেয়ার করা ম্যাপ</div>
          <h1>{tier.bn}</h1>
          <p className="result-sub">
            {bn(theirs.size)} / {bn(totalDishes)} খাবার চেখে দেখেছেন
          </p>

          <MiniMap eaten={theirs} className="result-map" />

          {hasMine ? (
            <section className="result-compare">
              <h3>তোমার সাথে তুলনা</h3>
              <p>তুমি {bn(mine.size)}টি · তারা {bn(theirs.size)}টি</p>
              {theyHaveYouDont.length > 0 ? (
                <>
                  <p>
                    তারা চেখেছেন কিন্তু তুমি এখনও খাওনি ({bn(theyHaveYouDont.length)}টি):
                  </p>
                  <ul>
                    {theyHaveYouDont.slice(0, 6).map((d) => (
                      <li key={d.id}>{d.nameBn}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>তুমি তাদের সব খাবারই চেখেছ!</p>
              )}
            </section>
          ) : (
            <p className="result-sub">নিজের ম্যাপ বানালে এখানে তুলনা দেখতে পাবে।</p>
          )}

          <Link href="/" className="btn">
            আমার ম্যাপ বানাই
          </Link>
          <p className="result-credit">Map data: geoBoundaries</p>
        </article>
      </main>
    </>
  );
}
