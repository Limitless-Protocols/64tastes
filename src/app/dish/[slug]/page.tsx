import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Noto_Serif_Bengali, Hind_Siliguri } from 'next/font/google';
import { notFound } from 'next/navigation';
import { dishes, districtById } from '@/lib/data';
import { getDishStats } from '@/lib/stats';
import { MIN_VOTES } from '@/lib/ranking';
import { getTopSpots, type Spot } from '@/lib/spots';
import { getDishContent, type DishContent, type DishSpot } from '@/lib/dishContent';
import { normalizeKey } from '@/lib/place';
import { bn } from '@/lib/format';
import DishTabs, { type TabDef } from '@/components/DishTabs';

/* ---------- fonts (Bengali-capable) ---------- */
const display = Noto_Serif_Bengali({
  subsets: ['bengali', 'latin'],
  weight: ['600', '800'],
  display: 'swap',
});
const body = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

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
    <div className={`${body.className} min-h-screen text-[#20291F]`}>
      <div className="mx-auto max-w-2xl px-4 pb-8 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#E1C714] px-3.5 py-1.5 text-sm font-medium text-black shadow-sm ring-1 ring-[#20291F]/10 transition hover:bg-[#3D852D] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3D852D]"
        >
          <span aria-hidden>←</span> ম্যাপে ফিরি
        </Link>
        <Suspense fallback={<DishSkeleton />}>
          <DishContentView params={params} />
        </Suspense>
      </div>
    </div>
  );
}

/* ---------- loading state ---------- */
function DishSkeleton() {
  return (
    <div className="mt-4 animate-pulse motion-reduce:animate-none" aria-label="লোড হচ্ছে…">
      <div className="aspect-[4/3] rounded-3xl bg-[#3D852D]/10" />
      <div className="mt-6 h-4 w-2/3 rounded bg-[#3D852D]/10" />
      <div className="mt-3 h-4 w-1/2 rounded bg-[#3D852D]/10" />
      <div className="mt-8 h-40 rounded-3xl bg-[#3D852D]/10" />
    </div>
  );
}

/* ---------- vote row ---------- */
function Bar({
  label,
  pct,
  color,
  dashed = false,
}: {
  label: string;
  pct: number;
  color: string;
  dashed?: boolean;
}) {
  return (
    <div className={dashed ? 'mt-4 border-t border-dashed border-[#20291F]/20 pt-4' : 'mt-3'}>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-semibold tabular-nums">{bn(pct)}%</span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[#20291F]/10">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/* ---------- popular spots ---------- */
function PopularSpots({ curated, community }: { curated: DishSpot[]; community: Spot[] }) {
  // hide community spots the admin has already listed
  const listed = new Set(curated.map((s) => `t:${normalizeKey(s.name)}`));
  const extra = community.filter((s) => s.name && !listed.has(s.id));
  if (curated.length === 0 && extra.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className={`${display.className} text-xl font-extrabold`}>কোথায় খাবে</h2>

      <ul className="mt-3 space-y-3">
        {curated.map((s) => (
          <li key={s.id}>
            <a
              href={mapsSearch(s.name, s.area)}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start gap-3 rounded-2xl bg-white border-2 border-[#E69030] p-4 ring-1 ring-[#20291F]/10 transition hover:ring-[#3D852D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3D852D]"
            >
              <span
                aria-hidden
                className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F0BE64]/35 text-lg"
              >
                📍
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-[#3D852D] group-hover:underline">{s.name}</span>
                {s.area && <span className="block text-sm text-[#596653]">{s.area}</span>}
                {s.note && <span className="mt-1 block text-sm leading-relaxed">{s.note}</span>}
              </span>
              <span className="shrink-0 pt-1 text-xs font-medium text-[#596653]">Maps ↗</span>
            </a>
          </li>
        ))}
      </ul>

      {extra.length > 0 && (
        <>
          <p className="mt-5 text-sm font-medium text-[#596653]">ব্যবহারকারীদের দেওয়া জায়গা</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {extra.map((s) => (
              <li key={s.id}>
                <a
                  href={mapsSearch(s.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-3.5 pr-2 text-sm ring-1 ring-[#20291F]/10 transition hover:ring-[#3D852D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3D852D]"
                >
                  <span className="font-medium text-[#3D852D]">{s.name}</span>
                  <span className="rounded-full bg-[#3D852D]/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-[#3D852D]">
                    {bn(s.picks)} জন
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

/* ---------- recipe ---------- */
function Recipe({ content }: { content: DishContent }) {
  if (content.ingredients.length === 0 && content.steps.length === 0) return null;
  return (
    <div className="rounded-3xl bg-white border-2 border-[#E69030] p-5 ring-1 ring-[#20291F]/10">
      {(content.servings || content.minutes) && (
        <p className="mb-4 text-sm text-[#596653]">
          {content.servings ? `${bn(content.servings)} জনের জন্য` : ''}
          {content.servings && content.minutes ? ' · ' : ''}
          {content.minutes ? `${bn(content.minutes)} মিনিট` : ''}
        </p>
      )}

      {content.ingredients.length > 0 && (
        <>
          <h3 className="font-semibold text-[#3D852D]">উপকরণ</h3>
          <ul className="mt-2 grid gap-x-6 gap-y-1.5 text-[15px] sm:grid-cols-2">
            {content.ingredients.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E1C714]" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {content.steps.length > 0 && (
        <>
          <h3 className="mt-6 font-semibold text-[#3D852D]">প্রস্তুত প্রণালী</h3>
          <ol className="mt-3 space-y-4">
            {content.steps.map((line, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#3D852D] text-sm font-semibold text-white">
                  {bn(i + 1)}
                </span>
                <p className="pt-0.5 text-[15px] leading-relaxed">{line}</p>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

/* ---------- main content ---------- */
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

  const hasAbout =
    Boolean(content.descriptionBn || content.descriptionEn) ||
    content.spots.length > 0 ||
    community.length > 0;
  const hasRecipe = content.ingredients.length > 0 || content.steps.length > 0;

  const tabs: TabDef[] = [];

  if (hasAbout) {
    tabs.push({
      id: 'about',
      label: 'বিবরণ',
      content: (
        <>
          {(content.descriptionBn || content.descriptionEn) && (
            <section className="rounded-3xl bg-white border-2 border-[#E69030] p-3 ring-1 ring-[#20291F]/10">
              <h2 className="text-xl font-extrabold">
                {dish.nameBn} • {dish.nameEn}
              </h2>
              {content.descriptionBn && (
                <p className="whitespace-pre-line text-[17px] leading-8">{content.descriptionBn}</p>
              )}
              {content.descriptionEn && (
                <p className="mt-3 whitespace-pre-line border-2 border-[#E1C714] rounded-3xl p-3 text-sm italic leading-relaxed">
                  {content.descriptionEn}
                </p>
              )}
            </section>
          )}
          <PopularSpots curated={content.spots} community={community} />
        </>
      ),
    });
  }

  tabs.push({
    id: 'ratings',
    label: 'রেটিং',
    content:
      votes >= MIN_VOTES && stat ? (
        <section className="rounded-3xl bg-white border-2 border-[#E69030] p-5 ring-1 ring-[#20291F]/10">
          <h2 className={`${display.className} text-xl font-extrabold`}>
            {bn(pct(stat.loved))}% বললেন দারুণ
          </h2>
          <p className="text-sm text-[#596653]">{bn(votes)}টি ভোটের ভিত্তিতে</p>

          {/* combined strip */}
          <div
            className="mt-4 flex h-3 overflow-hidden rounded-full bg-[#20291F]/10"
            role="img"
            aria-label="ভোটের বিভাজন"
          >
            <div style={{ width: `${pct(stat.loved)}%`, background: '#3D852D' }} />
            <div style={{ width: `${pct(stat.okay)}%`, background: '#F0BE64' }} />
            <div style={{ width: `${pct(stat.notForMe)}%`, background: '#D23021' }} />
          </div>

          <Bar label="😍 দারুণ" pct={pct(stat.loved)} color="#3D852D" />
          <Bar label="🙂 মোটামুটি" pct={pct(stat.okay)} color="#F0BE64" />
          <Bar label="😕 পছন্দ হয়নি" pct={pct(stat.notForMe)} color="#D23021" />
          <Bar label="🙄 ওভাররেটেড বলেছেন" pct={pct(stat.overrated)} color="#E69030" dashed />
        </section>
      ) : (
        <section className="rounded-3xl border-2 border-dashed border-[#3D852D]/30 bg-white p-5 text-center">
          <p className={`${display.className} text-lg font-extrabold`}>আরও ভোট দরকার</p>
          <p className="mt-1 text-sm text-[#596653]">
            এখনও {bn(votes)}টি ভোট। ফলাফল দেখাতে কমপক্ষে {bn(MIN_VOTES)}টি ভোট লাগবে।
          </p>
        </section>
      ),
  });

  if (hasRecipe) {
    tabs.push({ id: 'recipe', label: 'রেসিপি', content: <Recipe content={content} /> });
  }

  return (
    <>
      {/* Hero */}
      <header className="relative mt-4 overflow-hidden border-3 border-[#E9EEE0] rounded-3xl bg-[#3D852D]">
        {content.photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/dish-photo/${dish.id}?v=${content.photo.v}`}
              alt={dish.nameEn}
              className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#20291F]/90 via-[#20291F]/30 to-transparent" />
          </>
        ) : (
          <div
            className="aspect-[4/3] w-full sm:aspect-[16/10]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(225,209,20,0.35) 1.5px, transparent 0)',
              backgroundSize: '18px 18px',
            }}
          />
        )}

        <div className="absolute inset-x-0 bottom-0 p-5">
          <span className="inline-block rounded-full bg-[#E1C714] px-3 py-1 text-xs font-semibold text-[#20291F]">
            {district.nameBn}
          </span>
          <h1 className={`${display.className} mt-2 text-3xl font-extrabold leading-tight text-white sm:text-4xl`}>
            {dish.nameBn}
          </h1>
          <p className="text-sm text-white/80">{dish.nameEn}</p>
        </div>

        {content.photo?.credit && (
          <p className="absolute right-3 top-3 max-w-[60%] truncate rounded-full bg-black/40 px-2.5 py-0.5 text-[11px] text-white/90 backdrop-blur-sm">
            {content.photo.credit}
          </p>
        )}
      </header>

      {/* Tabs */}
      <DishTabs tabs={tabs} />

      {/* CTA */}
      <div className="sticky bottom-4 mt-8">
        <Link
          href="/"
          className="block rounded-2xl bg-[#3D852D] py-3.5 text-center font-semibold text-white shadow-lg shadow-[#285C20]/30 transition hover:bg-[#285C20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3D852D]"
        >
          ম্যাপে গিয়ে রেটিং দাও
        </Link>
      </div>
    </>
  );
}
