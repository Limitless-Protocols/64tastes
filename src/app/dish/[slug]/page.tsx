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

/*
  Palette
  paddy   #F1F5EC  page background (pale rice-field)
  ink     #14261C  text
  jute    #0F5C3F  primary green
  shorshe #E8A317  mustard accent
  morich  #C8372D  chili red
  ash     #6B7A70  secondary text
*/

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
    <div className={`${body.className} min-h-screen text-[#14261C]`}>
      <div className="mx-auto max-w-2xl px-4 pb-8 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F5EC] px-3.5 py-1.5 text-sm font-medium text-[#0F5C3F] shadow-sm ring-1 ring-[#14261C]/10 transition hover:bg-[#0F5C3F] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5C3F]"
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
      <div className="aspect-[4/3] rounded-3xl bg-[#14261C]/10" />
      <div className="mt-6 h-4 w-2/3 rounded bg-[#14261C]/10" />
      <div className="mt-3 h-4 w-1/2 rounded bg-[#14261C]/10" />
      <div className="mt-8 h-40 rounded-3xl bg-[#14261C]/10" />
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
    <div className={dashed ? 'mt-4 border-t border-dashed border-[#14261C]/20 pt-4' : 'mt-3'}>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-semibold tabular-nums">{bn(pct)}%</span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[#14261C]/10">
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
              className="group flex items-start gap-3 rounded-2xl bg-[#F1F5EC] p-4 ring-1 ring-[#14261C]/10 transition hover:ring-[#0F5C3F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5C3F]"
            >
              <span
                aria-hidden
                className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#E8A317]/20 text-lg"
              >
                📍
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-[#0F5C3F] group-hover:underline">{s.name}</span>
                {s.area && <span className="block text-sm text-[#6B7A70]">{s.area}</span>}
                {s.note && <span className="mt-1 block text-sm leading-relaxed">{s.note}</span>}
              </span>
              <span className="shrink-0 pt-1 text-xs font-medium text-[#6B7A70]">Maps ↗</span>
            </a>
          </li>
        ))}
      </ul>

      {extra.length > 0 && (
        <>
          <p className="mt-5 text-sm font-medium text-[#6B7A70]">ব্যবহারকারীদের দেওয়া জায়গা</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {extra.map((s) => (
              <li key={s.id}>
                <a
                  href={mapsSearch(s.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#F1F5EC] py-1.5 pl-3.5 pr-2 text-sm ring-1 ring-[#14261C]/10 transition hover:ring-[#0F5C3F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5C3F]"
                >
                  <span className="font-medium text-[#0F5C3F]">{s.name}</span>
                  <span className="rounded-full bg-[#0F5C3F]/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-[#0F5C3F]">
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
    <div className="rounded-3xl bg-[#F1F5EC] p-5 ring-1 ring-[#14261C]/10">
      {(content.servings || content.minutes) && (
        <p className="mb-4 text-sm text-[#6B7A70]">
          {content.servings ? `${bn(content.servings)} জনের জন্য` : ''}
          {content.servings && content.minutes ? ' · ' : ''}
          {content.minutes ? `${bn(content.minutes)} মিনিট` : ''}
        </p>
      )}

      {content.ingredients.length > 0 && (
        <>
          <h3 className="font-semibold text-[#0F5C3F]">উপকরণ</h3>
          <ul className="mt-2 grid gap-x-6 gap-y-1.5 text-[15px] sm:grid-cols-2">
            {content.ingredients.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8A317]" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {content.steps.length > 0 && (
        <>
          <h3 className="mt-6 font-semibold text-[#0F5C3F]">প্রস্তুত প্রণালী</h3>
          <ol className="mt-3 space-y-4">
            {content.steps.map((line, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#0F5C3F] text-sm font-semibold text-white">
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
            <section className="bg-[#F1F5EC] rounded-3xl p-3">
              <h2 className="text-xl font-extrabold">
                {dish.nameBn} • {dish.nameEn}
              </h2>
              {content.descriptionBn && (
                <p className="whitespace-pre-line text-[17px] leading-8">{content.descriptionBn}</p>
              )}
              {content.descriptionEn && (
                <p className="mt-3 whitespace-pre-line border-2 border-[#E8A317] rounded-3xl p-3 text-sm italic leading-relaxed">
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
        <section className="rounded-3xl bg-[#F1F5EC] p-5 ring-1 ring-[#14261C]/10">
          <h2 className={`${display.className} text-xl font-extrabold`}>
            {bn(pct(stat.loved))}% বললেন দারুণ
          </h2>
          <p className="text-sm text-[#6B7A70]">{bn(votes)}টি ভোটের ভিত্তিতে</p>

          {/* combined strip */}
          <div
            className="mt-4 flex h-3 overflow-hidden rounded-full bg-[#14261C]/10"
            role="img"
            aria-label="ভোটের বিভাজন"
          >
            <div style={{ width: `${pct(stat.loved)}%`, background: '#0F5C3F' }} />
            <div style={{ width: `${pct(stat.okay)}%`, background: '#E8A317' }} />
            <div style={{ width: `${pct(stat.notForMe)}%`, background: '#C8372D' }} />
          </div>

          <Bar label="😍 দারুণ" pct={pct(stat.loved)} color="#0F5C3F" />
          <Bar label="🙂 মোটামুটি" pct={pct(stat.okay)} color="#E8A317" />
          <Bar label="😕 পছন্দ হয়নি" pct={pct(stat.notForMe)} color="#C8372D" />
          <Bar label="🙄 ওভাররেটেড বলেছেন" pct={pct(stat.overrated)} color="#6B7A70" dashed />
        </section>
      ) : (
        <section className="rounded-3xl border-2 border-dashed border-[#14261C]/20 p-5 text-center">
          <p className={`${display.className} text-lg font-extrabold`}>আরও ভোট দরকার</p>
          <p className="mt-1 text-sm text-[#6B7A70]">
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
      <header className="relative mt-4 overflow-hidden border-3 border-[#F1F5EC] rounded-3xl bg-[#0F5C3F]">
        {content.photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/dish-photo/${dish.id}?v=${content.photo.v}`}
              alt={dish.nameEn}
              className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F15]/90 via-[#0B1F15]/30 to-transparent" />
          </>
        ) : (
          <div
            className="aspect-[4/3] w-full sm:aspect-[16/10]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(232,163,23,0.35) 1.5px, transparent 0)',
              backgroundSize: '18px 18px',
            }}
          />
        )}

        <div className="absolute inset-x-0 bottom-0 p-5">
          <span className="inline-block rounded-full bg-[#E8A317] px-3 py-1 text-xs font-semibold text-[#14261C]">
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
          className="block rounded-2xl bg-[#0F5C3F] py-3.5 text-center font-semibold text-white shadow-lg shadow-[#0F5C3F]/30 transition hover:bg-[#0B4630] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5C3F]"
        >
          ম্যাপে গিয়ে রেটিং দাও
        </Link>
      </div>
    </>
  );
}