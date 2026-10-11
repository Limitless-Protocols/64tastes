import { NextResponse } from 'next/server';
import { allow } from '@/lib/ratelimit';
import { ipHash } from '@/lib/ip';
import { makeSession, COOKIE, MAX_AGE } from '@/lib/session';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const deviceId = body?.deviceId;
  const token = body?.token;
  if (typeof deviceId !== 'string' || !UUID.test(deviceId) || typeof token !== 'string') {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  // Generous limit: many Bangladeshi mobile users share one IP address
  if (!(await allow(`sess:${ipHash(req)}`, 60))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token }),
  });
  const result = await check.json().catch(() => null);
  if (!result?.success) {
    return NextResponse.json({ error: 'verification_failed' }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, makeSession(deviceId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
  return res;
}