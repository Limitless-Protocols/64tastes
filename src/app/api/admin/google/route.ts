import { NextResponse } from 'next/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { allow } from '@/lib/ratelimit';
import { ipHash } from '@/lib/ip';
import { ADMIN_COOKIE, makeSession } from '@/lib/session';

const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const ADMIN_TTL = 60 * 60 * 8; // 8 hours

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(req: Request) {
  if (!(await allow(`admin:${ipHash(req)}`, 20))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const credential = typeof body?.credential === 'string' ? body.credential : '';
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!credential || !clientId) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  try {
    const { payload } = await jwtVerify(credential, JWKS, {
      audience: clientId,
      issuer: ISSUERS,
      algorithms: ['RS256'],
    });

    const email = typeof payload.email === 'string' ? payload.email.toLowerCase() : '';
    if (payload.email_verified !== true || !adminEmails().includes(email)) {
      return NextResponse.json({ error: 'not_admin' }, { status: 403 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, makeSession('admin', ADMIN_TTL), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_TTL,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }
}