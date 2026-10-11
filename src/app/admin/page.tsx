import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
import { sql } from '@/lib/db';
import { ADMIN_COOKIE, verifySession } from '@/lib/session';
import { districtById } from '@/lib/data';
import AdminLogin from '@/components/AdminLogin';
import ModerateButtons from '@/components/ModerateButtons';
import { MIN_PICKS } from '@/lib/spots';
import PlaceModerateRow from '@/components/PlaceModerateRow';

export const metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-lg p-4 text-gray-900">
      <h1 className="text-2xl font-bold">Dish suggestions</h1>
      <Suspense fallback={<p className="mt-4 text-gray-500">Loading…</p>}>
        <AdminContent />
      </Suspense>
    </main>
  );
}

async function AdminContent() {
  await connection();
  const store = await cookies();
  if (!verifySession(store.get(ADMIN_COOKIE)?.value, 'admin')) return <AdminLogin />;

  const pending = await sql`
    select id, name, district_id, note from dish_suggestions
    where status = 'pending' order by created_at asc limit 100`;
  const approved = await sql`
    select id, name, district_id, note from dish_suggestions
    where status = 'approved' order by created_at desc limit 100`;

  const placeQueue = await sql`
    with per_dish as (
        select place_id, dish_id, count(*) as picks
        from place_picks group by place_id, dish_id
    ), qualified as (
        select place_id, max(picks)::int as best
        from per_dish group by place_id
        having max(picks) >= ${MIN_PICKS}
    )
    select q.place_id, q.best,
            (select mode() within group (order by pp.place_name)
                from place_picks pp where pp.place_id = q.place_id) as name
    from qualified q
    left join place_moderation m on m.place_id = q.place_id
    where m.place_id is null
    order by q.best desc
    limit 50`;

  const placesApproved = await sql`
    select m.place_id,
            coalesce(m.display_name,
            (select mode() within group (order by pp.place_name)
                from place_picks pp where pp.place_id = m.place_id)) as name
    from place_moderation m
    where m.status = 'approved'
    order by m.updated_at desc
    limit 50`;

  const district = (id: string) => districtById[id]?.nameEn ?? id;

  return (
    <>
      <h2 className="mt-6 text-lg font-semibold">Pending ({pending.length})</h2>
      <ul className="mt-2 space-y-3">
        {pending.map((r) => (
          <li key={r.id} className="rounded-xl border border-gray-200 p-3">
            <p className="font-medium">{r.name}</p>
            <p className="text-sm text-gray-500">{district(r.district_id)}{r.note ? ` · ${r.note}` : ''}</p>
            <ModerateButtons id={r.id} status="pending" />
          </li>
        ))}
        {pending.length === 0 && <li className="text-sm text-gray-500">Nothing waiting.</li>}
      </ul>

      <h2 className="mt-8 text-lg font-semibold">Approved: add these to dishes.json ({approved.length})</h2>
      <ul className="mt-2 space-y-3">
        {approved.map((r) => (
          <li key={r.id} className="rounded-xl border border-emerald-200 p-3">
            <p className="font-medium">{r.name}</p>
            <p className="text-sm text-gray-500">{district(r.district_id)}{r.note ? ` · ${r.note}` : ''}</p>
            <ModerateButtons id={r.id} status="approved" />
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-lg font-semibold">Places to review ({placeQueue.length})</h2>
        <p className="text-xs text-gray-500">Shown after {MIN_PICKS}+ people named the same place for a dish. Fix the spelling, then approve or reject.</p>
        <ul className="mt-2 space-y-3">
        {placeQueue.map((r) => (
            <PlaceModerateRow
            key={r.place_id}
            placeId={r.place_id}
            initialName={r.name ?? ''}
            detail={`${r.best} people picked this for one dish`}
            />
        ))}
        {placeQueue.length === 0 && <li className="text-sm text-gray-500">Nothing waiting.</li>}
        </ul>

            <h2 className="mt-8 text-lg font-semibold">Approved places ({placesApproved.length})</h2>
            <ul className="mt-2 space-y-3">
            {placesApproved.map((r) => (
                <PlaceModerateRow key={r.place_id} placeId={r.place_id} initialName={r.name ?? ''} detail="Visible on dish pages" approved />
            ))}
        </ul>
    </>
  );
}