import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dishes, districtById } from '@/lib/data';
import { getDishStats } from '@/lib/stats';
import { MIN_VOTES } from '@/lib/ranking';
import { getTopSpots, type Spot } from '@/lib/spots';
import { getDishContent, type DishContent, type DishSpot } from '@/lib/dishContent';
import { normalizeKey } from '@/lib/place';
import { bn } from '@/lib/format';

type Props = { params: Promise<{ slug: string }> };

const mapsSearch = (...parts: string[]) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    parts.filter(Boolean).join(' ') + ' Bangladesh'
  )}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dish = dishes.find((d) => d.slug === slug);
  if (!dish) return {};

  const content = await getDishContent(dish.id);
  const title = `${dish.nameBn} — তুমি কেমন পেয়েছ?`;
  const description =
    (content.descriptionBn || content.descriptionEn).replace(/\s+/g, ' ').slice(0, 160) ||
    'বাংলাদেশ ফুড ম্যাপে এই খাবারের রেটিং দেখো আর নিজের মতামত দাও।';
  const image = content.photo ? `/dish-photo/${dish.id}?v=${content.photo.v}` : '/og/default.png';

  return {
    title,
    description,
    openGraph: { title, description, images: [image], locale: 'bn_BD', type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default function DishPage({ params }: Props) {
  return (
    <main className="mx-auto max-w-lg p-4 text-gray-900">
      <Link href="/" className="text-sm text-emerald-700 underline">← ম্যাপে ফিরি</Link>
      <Suspense fallback={<p className="mt-4 text-gray-500">লোড হচ্ছে…</p>}>
        <DishContentView params={params} />
      </Suspense>
    </main>
  );
}

function Bar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="mt-3">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{bn(pct)}%</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-gray-200">
        <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function PopularSpots({ curated, community }: { curated: DishSpot[]; community: Spot[] }) {
  // hide community spots the admin has already listed
  const listed = new Set(curated.map((s) => `t:${normalizeKey(s.name)}`));
  const extra = community.filter((s) => s.name && !listed.has(s.id));
  if (curated.length === 0 && extra.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold">📍 জনপ্রিয় জায়গা</h2>
      <ul className="mt-2 space-y-2">
        {curated.map((s) => (
          <li key={s.id} className="rounded-lg border border-gray-200 px-3 py-2">
            <a href={mapsSearch(s.name, s.area)} target="_blank" rel="noreferrer" className="font-medium text-emerald-700 underline">
              {s.name}
            </a>
            {(s.area || s.note) && (
              <p className="text-sm text-gray-600">{[s.area, s.note].filter(Boolean).join(' · ')}</p>
            )}
          </li>
        ))}
        {extra.map((s) => (
          <li key={s.id} className="flex justify-between rounded-lg border border-gray-200 px-3 py-2">
            <a href={mapsSearch(s.name)} target="_blank" rel="noreferrer" className="text-emerald-700 underline">
              {s.name}
            </a>
            <span className="text-sm text-gray-600">{bn(s.picks)} জন</span>
          </li>
        ))}
      </ul>
      {extra.length > 0 && <p className="mt-2 text-xs text-gray-400">কিছু জায়গা ব্যবহারকারীদের দেওয়া তথ্য</p>}
    </section>
  );
}

function Recipe({ content }: { content: DishContent }) {
  if (content.ingredients.length === 0 && content.steps.length === 0) return null;
  return (
    <details className="mt-6 rounded-xl border border-gray-200 p-3">
      <summary className="cursor-pointer text-lg font-semibold">🍳 রেসিপি</summary>
      {(content.servings || content.minutes) && (
        <p className="mt-2 text-sm text-gray-600">
          {content.servings ? `${bn(content.servings)} জনের জন্য` : ''}
          {content.servings && content.minutes ? ' · ' : ''}
          {content.minutes ? `${bn(content.minutes)} মিনিট` : ''}
        </p>
      )}
      {content.ingredients.length > 0 && (
        <>
          <h3 className="mt-3 font-semibold">উপকরণ</h3>
          <ul className="mt-1 list-inside list-disc space-y-1 text-sm">
            {content.ingredients.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        </>
      )}
      {content.steps.length > 0 && (
        <>
          <h3 className="mt-3 font-semibold">প্রস্তুত প্রণালী</h3>
          <ol className="mt-1 list-inside list-decimal space-y-2 text-sm">
            {content.steps.map((line, i) => <li key={i}>{line}</li>)}
          </ol>
        </>
      )}
    </details>
  );
}

async function DishContentView({ params }: Props) {
  const { slug } = await params;
  const dish = dishes.find((d) => d.slug === slug);
  if (!dish) notFound();

  const district = districtById[dish.districtId];
  const [allStats, content, community] = await Promise.all([
    getDishStats(),
    getDishContent(dish.id),
    getTopSpots(dish.id),
  ]);
  const stat = allStats.find((s) => s.id === dish.id);
  const votes = stat?.votes ?? 0;
  const pct = (n: number) => (votes ? Math.round((n / votes) * 100) : 0);

  return (
    <>
      <h1 className="mt-2 text-2xl font-bold">{dish.nameBn}</h1>
      <p className="text-sm text-gray-500">{dish.nameEn} · {district.nameBn}</p>

      {content.photo && (
        <figure className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/dish-photo/${dish.id}?v=${content.photo.v}`}
            alt={dish.nameEn}
            className="w-full rounded-xl object-cover"
            style={{ aspectRatio: '4 / 3' }}
          />
          {content.photo.credit && (
            <figcaption className="mt-1 text-xs text-gray-500">{content.photo.credit}</figcaption>
          )}
        </figure>
      )}

      {(content.descriptionBn || content.descriptionEn) && (
        <section className="mt-4">
          {content.descriptionBn && <p className="whitespace-pre-line">{content.descriptionBn}</p>}
          {content.descriptionEn && (
            <p className="mt-2 whitespace-pre-line text-sm italic text-gray-600">{content.descriptionEn}</p>
          )}
        </section>
      )}

      {votes >= MIN_VOTES && stat ? (
        <section className="mt-6">
          <p className="text-sm text-gray-600">{bn(votes)}টি ভোটের ভিত্তিতে</p>
          <Bar label="😍 দারুণ" pct={pct(stat.loved)} color="#059669" />
          <Bar label="🙂 মোটামুটি" pct={pct(stat.okay)} color="#f59e0b" />
          <Bar label="😕 পছন্দ হয়নি" pct={pct(stat.notForMe)} color="#ef4444" />
          <Bar label="🙄 ওভাররেটেড বলেছেন" pct={pct(stat.overrated)} color="#6b7280" />
        </section>
      ) : (
        <p className="mt-6 text-gray-600">
          এখনও {bn(votes)}টি ভোট। ফলাফল দেখাতে কমপক্ষে {bn(MIN_VOTES)}টি ভোট লাগবে।
        </p>
      )}

      <PopularSpots curated={content.spots} community={community} />
      <Recipe content={content} />

      <Link href="/" className="mt-6 block rounded-lg bg-emerald-600 py-3 text-center font-medium text-white">
        ম্যাপে গিয়ে রেটিং দাও
      </Link>
    </>
  );
}