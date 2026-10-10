import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { allow } from '@/lib/ratelimit';
import { ipHash } from '@/lib/ip';
import { COOKIE, verifySession } from '@/lib/session';
import { dishes } from '@/lib/data';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RATINGS = ['loved', 'okay', 'not_for_me'];
const validIds = new Set(dishes.map((d) => d.id));

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const { deviceId, dishId, rating, overrated } = body ?? {};

  if (
    typeof deviceId !== 'string' || !UUID.test(deviceId) ||
    !validIds.has(dishId) ||
    (rating !== null && !RATINGS.includes(rating)) ||
    typeof overrated !== 'boolean'
  ) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const store = await cookies();
  if (!verifySession(store.get(COOKIE)?.value, deviceId)) {
    return NextResponse.json({ error: 'no_session' }, { status: 401 });
  }

  const okDevice = await allow(`dev:${deviceId}`, 300);
  const okIp = await allow(`ip:${ipHash(req)}`, 2000);
  if (!okDevice || !okIp) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  if (rating === null) {
    await sql`delete from ratings where device_id = ${deviceId} and dish_id = ${dishId}`;
  } else {
    await sql`
      insert into ratings (device_id, dish_id, rating, overrated, updated_at)
      values (${deviceId}, ${dishId}, ${rating}, ${overrated}, now())
      on conflict (device_id, dish_id)
      do update set rating = excluded.rating, overrated = excluded.overrated, updated_at = now()`;
  }
  return NextResponse.json({ ok: true });
}