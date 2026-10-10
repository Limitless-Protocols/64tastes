import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dishes, districtById } from '@/lib/data';
import { getDishStats } from '@/lib/stats';
import { MIN_VOTES } from '@/lib/ranking';
import { bn } from '@/lib/format';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dish = dishes.find((d) => d.slug === slug);
  if (!dish) return {};
  const title = `${dish.nameBn} — তুমি কেমন পেয়েছ?`;
  const description = 'বাংলাদেশ ফুড ম্যাপে এই খাবারের রেটিং দেখো আর নিজের মতামত দাও।';
  return {
    title,
    description,
    openGraph: { title, description, images: ['/og/default.png'], locale: 'bn_BD', type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: ['/og/default.png'] },
  };
}

export default function DishPage({ params }: Props) {
  return (
    <main className="mx-auto max-w-lg p-4 text-gray-900">
      <Link href="/" className="text-sm text-emerald-700 underline">← ম্যাপে ফিরি</Link>
      <Suspense fallback={<p className="mt-4 text-gray-500">লোড হচ্ছে…</p>}>
        <DishContent params={params} />
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

async function DishContent({ params }: Props) {
  const { slug } = await params;
  const dish = dishes.find((d) => d.slug === slug);
  if (!dish) notFound();

  const district = districtById[dish.districtId];
  const stat = (await getDishStats()).find((s) => s.id === dish.id);
  const votes = stat?.votes ?? 0;
  const pct = (n: number) => (votes ? Math.round((n / votes) * 100) : 0);

  return (
    <>
      <h1 className="mt-2 text-2xl font-bold">{dish.nameBn}</h1>
      <p className="text-sm text-gray-500">{dish.nameEn} · {district.nameBn}</p>

      {votes >= MIN_VOTES && stat ? (
        <section className="mt-4">
          <p className="text-sm text-gray-600">{bn(votes)}টি ভোটের ভিত্তিতে</p>
          <Bar label="😍 দারুণ" pct={pct(stat.loved)} color="#059669" />
          <Bar label="🙂 মোটামুটি" pct={pct(stat.okay)} color="#f59e0b" />
          <Bar label="😕 পছন্দ হয়নি" pct={pct(stat.notForMe)} color="#ef4444" />
          <Bar label="🙄 ওভাররেটেড বলেছেন" pct={pct(stat.overrated)} color="#6b7280" />
        </section>
      ) : (
        <p className="mt-4 text-gray-600">
          এখনও {bn(votes)}টি ভোট। ফলাফল দেখাতে কমপক্ষে {bn(MIN_VOTES)}টি ভোট লাগবে।
        </p>
      )}

      <Link href="/" className="mt-6 block rounded-lg bg-emerald-600 py-3 text-center font-medium text-white">
        ম্যাপে গিয়ে রেটিং দাও
      </Link>
    </>
  );
}