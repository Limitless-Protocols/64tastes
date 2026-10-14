import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isAdminPage } from '@/lib/admin';
import { dishes, districtById } from '@/lib/data';
import { loadDishContent } from '@/lib/dishContent';
import DishEditor from '@/components/DishEditor';

export const metadata = { title: 'Admin · Edit dish', robots: { index: false, follow: false } };

type Props = { params: Promise<{ slug: string }> };

export default function EditDishPage({ params }: Props) {
  return (
    <main className="mx-auto max-w-2xl p-4 text-gray-900">
      <Link href="/admin/dishes" className="text-sm text-emerald-700 underline">← All dishes</Link>
      <Suspense fallback={<p className="mt-4 text-gray-500">Loading…</p>}>
        <Editor params={params} />
      </Suspense>
    </main>
  );
}

async function Editor({ params }: Props) {
  if (!(await isAdminPage())) {
    return <p className="mt-4">Please <Link href="/admin" className="text-emerald-700 underline">log in</Link> first.</p>;
  }
  const { slug } = await params;
  const dish = dishes.find((d) => d.slug === slug);
  if (!dish) notFound();

  const initial = await loadDishContent(dish.id);
  return (
    <>
      <h1 className="mt-2 text-2xl font-bold">{dish.nameBn}</h1>
      <p className="text-sm text-gray-500">
        {dish.nameEn} · {districtById[dish.districtId]?.nameEn} ·{' '}
        <Link href={`/dish/${dish.slug}`} className="text-emerald-700 underline" target="_blank">view public page ↗</Link>
      </p>
      <DishEditor dishId={dish.id} initial={initial} />
    </>
  );
}