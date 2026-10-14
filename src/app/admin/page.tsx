import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
import { sql } from '@/lib/db';
import { ADMIN_COOKIE, verifySession } from '@/lib/session';
import { districtById } from '@/lib/data';
import { bn } from '@/lib/format';
import AdminLogin from '@/components/AdminLogin';
import ModerateButtons from '@/components/ModerateButtons';
import { MIN_PICKS } from '@/lib/spots';
import PlaceModerateRow from '@/components/PlaceModerateRow';
import LogoutButton from '@/components/LogoutButton';
import BackButton from '@/components/BackButton';

export const metadata = { title: 'Admin', robots: { index: false, follow: false } };

/**
 * /admin — the moderation desk, printed on the same paper book as the wiki
 * and result pages (`.desk` + `.book.admin`): topbar, title band, then one
 * nakshi-kantha piece per review queue. Never linked from the UI — it is a
 * secret URL behind the ft_admin cookie (token form or Google sign-in).
 */
export default function AdminPage() {
  return (
    <>
      <div className="desk" aria-hidden="true" />
      <main className="book admin">
        <Suspense fallback={<p className="note">লোড হচ্ছে…</p>}>
          <AdminContent />
        </Suspense>
      </main>
    </>
  );
}

async function AdminContent() {
  await connection();
  const store = await cookies();
  const authed = verifySession(store.get(ADMIN_COOKIE)?.value, 'admin');

  let queues: ReactNode = <AdminLogin />;

  if (authed) {
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

    queues = (
      <>
        <section className="piece admin-sec">
          <div className="admin-sec-h">
            <h2>Food suggestions to review</h2>
            <span className="admin-count">{bn(pending.length)}</span>
          </div>
          <ul className="admin-list">
            {pending.map((r) => (
              <li key={r.id} className="adm-row">
                <p className="adm-name">{r.name}</p>
                <p className="note">
                  {district(r.district_id)}
                  {r.note ? ` · ${r.note}` : ''}
                </p>
                <ModerateButtons id={r.id} status="pending" />
              </li>
            ))}
            {pending.length === 0 && <li className="note">Nothing waiting.</li>}
          </ul>
        </section>

        <section className="piece admin-sec approved">
          <div className="admin-sec-h">
            <h2>Approved: add these to dishes.json</h2>
            <span className="admin-count">{bn(approved.length)}</span>
          </div>
          <ul className="admin-list">
            {approved.map((r) => (
              <li key={r.id} className="adm-row">
                <p className="adm-name">{r.name}</p>
                <p className="note">
                  {district(r.district_id)}
                  {r.note ? ` · ${r.note}` : ''}
                </p>
                <ModerateButtons id={r.id} status="approved" />
              </li>
            ))}
            {approved.length === 0 && <li className="note">Nothing approved yet.</li>}
          </ul>
        </section>

        <section className="piece admin-sec">
          <div className="admin-sec-h">
            <h2>Places to review</h2>
            <span className="admin-count">{bn(placeQueue.length)}</span>
          </div>
          <p className="note">
            Shown after {MIN_PICKS}+ people named the same place for a dish. Fix the
            spelling, then approve or reject.
          </p>
          <ul className="admin-list">
            {placeQueue.map((r) => (
              <PlaceModerateRow
                key={r.place_id}
                placeId={r.place_id}
                initialName={r.name ?? ''}
                detail={`${r.best} people picked this for one dish`}
              />
            ))}
            {placeQueue.length === 0 && <li className="note">Nothing waiting.</li>}
          </ul>
        </section>

        <section className="piece admin-sec approved">
          <div className="admin-sec-h">
            <h2>Approved places</h2>
            <span className="admin-count">{bn(placesApproved.length)}</span>
          </div>
          <ul className="admin-list">
            {placesApproved.map((r) => (
              <PlaceModerateRow
                key={r.place_id}
                placeId={r.place_id}
                initialName={r.name ?? ''}
                detail="Visible on dish pages"
                approved
              />
            ))}
            {placesApproved.length === 0 && <li className="note">Nothing approved yet.</li>}
          </ul>
        </section>
      </>
    );
  }

  return (
    <div className="admin-wrap">
      <div className="wiki-topbar">
        <BackButton />
        <div className="eyebrow">খাবার বুক · অ্যাডমিন</div>
        {authed && <LogoutButton />}
      </div>

      <header className="wiki-head">
        <h1 className="wiki-title">Admin Moderation</h1>
        <p className="wiki-en">Suggestions &amp; places waiting for review</p>
      </header>

      {queues}
    </div>
  );
}
