import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { allow } from '@/lib/ratelimit';
import { ipHash } from '@/lib/ip';
import { COOKIE, verifySession } from '@/lib/session';
import { UUID, validDishIds } from '@/lib/validate';
import { cleanPlaceName, normalizeKey, OSM_REF } from '@/lib/place';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const { deviceId, dishId } = body ?? {};
  const rawName = body?.name; 

  if (
    typeof deviceId !== 'string' || !UUID.test(deviceId) ||
    !validDishIds.has(dishId) ||
    (rawName !== null && typeof rawName !== 'string')
  ) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const store = await cookies();
  if (!verifySession(store.get(COOKIE)?.value, deviceId)) {
    return NextResponse.json({ error: 'no_session' }, { status: 401 });
  }

  const okDevice = await allow(`place:${deviceId}`, 100);
  const okIp = await allow(`placeip:${ipHash(req)}`, 1000);
  if (!okDevice || !okIp) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  if (rawName === null) {
    await sql`delete from place_picks where device_id = ${deviceId} and dish_id = ${dishId}`;
    return NextResponse.json({ ok: true });
  }

  const name = cleanPlaceName(rawName);
  if (!name) return NextResponse.json({ error: 'bad_name' }, { status: 400 });

  const rated = await sql`select 1 from ratings where device_id = ${deviceId} and dish_id = ${dishId}`;
  if (rated.length === 0) return NextResponse.json({ error: 'rate_first' }, { status: 409 });

  const osmRef = typeof body?.osmRef === 'string' && OSM_REF.test(body.osmRef) ? body.osmRef : null;
  const key = osmRef ? `osm:${osmRef}` : `t:${normalizeKey(name)}`;
  const source = osmRef ? 'osm' : 'text';
  const blocked = await sql`
    select 1 from place_moderation where place_id = ${key} and status = 'rejected'`;
  if (blocked.length > 0) return NextResponse.json({ ok: true }); 

  await sql`
    insert into place_picks (device_id, dish_id, place_id, place_name, source)
    values (${deviceId}, ${dishId}, ${key}, ${name}, ${source})
    on conflict (device_id, dish_id)
    do update set place_id = excluded.place_id, place_name = excluded.place_name,
                  source = excluded.source, created_at = now()`;
  return NextResponse.json({ ok: true });
}