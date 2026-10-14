import { Suspense } from 'react';
import Link from 'next/link';
import { sql } from '@/lib/db';
import { isAdminPage } from '@/lib/admin';
import { dishes, districtById } from '@/lib/data';

export const metadata = { title: 'Admin · Dishes', robots: { index: false, follow: false } };

export default function AdminDishesPage() {
  return (
    <main className="mx-auto max-w-2xl p-4 text-gray-900">
      <Link href="/admin" className="text-sm text-emerald-700 underline">← Admin</Link>
      <h1 className="mt-2 text-2xl font-bold">Dish pages</h1>
      <Suspense fallback={<p className="mt-4 text-gray-500">Loading…</p>}>
        <DishList />
      </Suspense>
    </main>
  );
}

async function DishList() {
  if (!(await isAdminPage())) {
    return <p className="mt-4">Please <Link href="/admin" className="text-emerald-700 underline">log in</Link> first.</p>;
  }

  const [content, photos, spotCounts] = await Promise.all([
    sql`select dish_id, description_bn, description_en, ingredients, steps from dish_content`,
    sql`select dish_id from dish_photos`,
    sql`select dish_id, count(*)::int as n from dish_spots group by dish_id`,
  ]);
  const hasDesc = new Set(content.filter((r) => r.description_bn || r.description_en).map((r) => r.dish_id));
  const hasRecipe = new Set(content.filter((r) => r.ingredients || r.steps).map((r) => r.dish_id));
  const hasPhoto = new Set(photos.map((r) => r.dish_id));
  const spots = new Map<number, number>(spotCounts.map((r) => [r.dish_id, r.n]));

  const badge = (on: boolean, label: string) => (
    <span className={`rounded-full px-2 py-0.5 text-xs ${on ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'}`}>
      {label}
    </span>
  );

  return (
    <ul className="mt-4 space-y-2">
      {dishes.map((d) => (
        <li key={d.id}>
          <Link
            href={`/admin/dishes/${d.slug}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2"
          >
            <span>
              <span className="font-medium">{d.nameBn}</span>
              <span className="ml-2 text-sm text-gray-500">{d.nameEn} · {districtById[d.districtId]?.nameEn}</span>
            </span>
            <span className="flex gap-1">
              {badge(hasDesc.has(d.id), '📝')}
              {badge(hasPhoto.has(d.id), '📷')}
              {badge(hasRecipe.has(d.id), '🍳')}
              {badge((spots.get(d.id) ?? 0) > 0, `📍${spots.get(d.id) ?? 0}`)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}