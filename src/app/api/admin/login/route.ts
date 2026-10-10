import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { allow } from '@/lib/ratelimit';
import { ipHash } from '@/lib/ip';
import { ADMIN_COOKIE, makeSession } from '@/lib/session';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === 'string' ? body.token : '';

  if (!(await allow(`admin:${ipHash(req)}`, 10))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const expected = process.env.ADMIN_TOKEN ?? '';
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  const ok = expected.length > 0 && a.length === b.length && timingSafeEqual(a, b);
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeSession('admin'), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return res;
}