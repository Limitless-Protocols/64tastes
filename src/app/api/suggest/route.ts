import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { allow } from '@/lib/ratelimit';
import { ipHash } from '@/lib/ip';
import { COOKIE, verifySession } from '@/lib/session';
import { districtById } from '@/lib/data';
import { UUID } from '@/lib/validate';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const deviceId = body?.deviceId;
  const districtId = body?.districtId;
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const note = typeof body?.note === 'string' ? body.note.trim() : '';

  if (
    typeof deviceId !== 'string' || !UUID.test(deviceId) ||
    typeof districtId !== 'string' || !districtById[districtId] ||
    name.length < 2 || name.length > 80 || note.length > 200
  ) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const store = await cookies();
  if (!verifySession(store.get(COOKIE)?.value, deviceId)) {
    return NextResponse.json({ error: 'no_session' }, { status: 401 });
  }

  const okDevice = await allow(`sug:${deviceId}`, 5); // 5 per hour per device
  const okIp = await allow(`sugip:${ipHash(req)}`, 100);
  if (!okDevice || !okIp) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  // Skip exact duplicates that are still waiting for review
  await sql`
    insert into dish_suggestions (name, district_id, note, device_id)
    select ${name}::text, ${districtId}::text, ${note || null}::text, ${deviceId}::uuid
    where not exists (
      select 1 from dish_suggestions
      where lower(name) = lower(${name}::text)
        and district_id = ${districtId}::text
        and status = 'pending')`;

  return NextResponse.json({ ok: true });
}