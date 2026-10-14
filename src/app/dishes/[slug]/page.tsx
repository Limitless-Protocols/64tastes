import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { dishes } from '@/lib/data';
import { getDishStats } from '@/lib/stats';
import { MIN_VOTES } from '@/lib/ranking';
import { bn } from '@/lib/format';
import DishActions from '@/components/DishActions';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dish = dishes.find((d) => d.slug === slug);
  if (!dish) return {};
  const title = `${dish.nameBn} — তুমি কেমন পেয়েছ?`;
  const description = 'রেসিপি পড়ো, চেখেছি দাও, আর নিজের রেটিং রাখো।';
  return {
    title,
    description,
    openGraph: { title, description, images: ['/og/default.png'], locale: 'bn_BD', type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: ['/og/default.png'] },
  };
}

/**
 * /dishes/[slug] — the dish's recipe PAGE. Clicking a dish anywhere in the
 * book (catalog card, polaroid, highlight, search, board row, district
 * popup) lands here instead of opening the old detail card. Bound-book frame
 * like /r/[code]; the interactive half (চেখেছি, chips, কোথায় পাবেন) is the
 * client DishActions component.
 *
 * Next 16 (cacheComponents): the frame is static and prerenders; the recipe
 * and the vote stats each stream in behind their own <Suspense>, because
 * `params` and the DB read are runtime data.
 */
export default function DishPage({ params }: Props) {
  return (
    <>
      <div className="desk" aria-hidden="true" />
      <main className="book result dish-page">
        <article className="piece result-card">
          <div className="eyebrow">খাবার বুক · রেসিপি</div>

          <Suspense fallback={<p className="note">লোড হচ্ছে…</p>}>
            <DishRecipe params={params} />
          </Suspense>

          <Suspense fallback={null}>
            <DishStats params={params} />
          </Suspense>

          <Link href="/" className="btn">
            ম্যাপে ফিরে যাও
          </Link>
          <p className="result-credit">Map data: geoBoundaries</p>
        </article>
      </main>
    </>
  );
}

/** Static JSON lookup (no DB) — streams as soon as the route params resolve. */
async function DishRecipe({ params }: Props) {
  const { slug } = await params;
  const dish = dishes.find((d) => d.slug === slug);
  if (!dish) notFound();
  return <DishActions dish={dish} />;
}

function Bar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="bar">
      <div className="bar-h"><span>{label}</span><b>{bn(pct)}%</b></div>
      <div className="bar-t"><i style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  );
}

/** Community vote stats — the only DB-reading part, deferred to request time
    so `next build` never opens a Neon connection for this route.

    The DB read is wrapped in try/catch on purpose: this section streams in
    AFTER the page shell, so a thrown error would bubble to the root error
    boundary and replace the whole dish page. A missing/broken DATABASE_URL
    must degrade to the "not enough votes" note instead. */
async function DishStats({ params }: Props) {
  const { slug } = await params;
  const dish = dishes.find((d) => d.slug === slug);
  if (!dish) return null;

  let stat: Awaited<ReturnType<typeof getDishStats>>[number] | undefined;
  try {
    await connection();
    stat = (await getDishStats()).find((s) => s.id === dish.id);
  } catch (err) {
    console.error('[dish-stats] falling back:', err);
  }
  const votes = stat?.votes ?? 0;
  const pct = (n: number) => (votes ? Math.round((n / votes) * 100) : 0);

  if (votes < MIN_VOTES || !stat) {
    return (
      <p className="note big">
        এখনও {bn(votes)}টি ভোট। ফলাফল দেখাতে কমপক্ষে {bn(MIN_VOTES)}টি ভোট লাগবে।
      </p>
    );
  }

  return (
    <section className="dish-stats">
      <h2>কে কী বলছে</h2>
      <p className="note">{bn(votes)}টি ভোটের ভিত্তিতে</p>
      <Bar label="😍 দারুণ" pct={pct(stat.loved)} color="var(--leaf)" />
      <Bar label="🙂 মোটামুটি" pct={pct(stat.okay)} color="var(--mango)" />
      <Bar label="😕 পছন্দ হয়নি" pct={pct(stat.notForMe)} color="var(--tomato)" />
      <Bar label="🙄 ওভাররেটেড বলেছেন" pct={pct(stat.overrated)} color="var(--muted)" />
    </section>
  );
}
