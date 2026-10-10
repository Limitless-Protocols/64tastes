import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { ADMIN_COOKIE, verifySession } from '@/lib/session';
import { cleanPlaceName } from '@/lib/place';

export async function POST(req: Request) {
  const store = await cookies();
  if (!verifySession(store.get(ADMIN_COOKIE)?.value, 'admin')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const placeId = body?.placeId;
  const action = body?.action;
  if (
    typeof placeId !== 'string' || placeId.length > 200 || !/^(t|osm):/.test(placeId) ||
    !['approve', 'reject', 'reset'].includes(action)
  ) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  if (action === 'approve') {
    const displayName = typeof body?.displayName === 'string' ? cleanPlaceName(body.displayName) : null;
    await sql`
      insert into place_moderation (place_id, status, display_name)
      values (${placeId}, 'approved', ${displayName})
      on conflict (place_id)
      do update set status = 'approved', display_name = excluded.display_name, updated_at = now()`;
  } else if (action === 'reject') {
    await sql`
      insert into place_moderation (place_id, status, display_name)
      values (${placeId}, 'rejected', null)
      on conflict (place_id)
      do update set status = 'rejected', display_name = null, updated_at = now()`;
    await sql`delete from place_picks where place_id = ${placeId}`;
  } else {
    await sql`delete from place_moderation where place_id = ${placeId}`;
  }
  return NextResponse.json({ ok: true });
}