import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { ADMIN_COOKIE, verifySession } from '@/lib/session';

export async function POST(req: Request) {
  const store = await cookies();
  if (!verifySession(store.get(ADMIN_COOKIE)?.value, 'admin')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const id = body?.id;
  const status = body?.status;
  if (!Number.isInteger(id) || !['pending', 'approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
  await sql`update dish_suggestions set status = ${status} where id = ${id}`;
  return NextResponse.json({ ok: true });
}