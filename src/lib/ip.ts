import { createHash } from 'node:crypto';

export function ipHash(req: Request): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  return createHash('sha256')
    .update(ip + (process.env.SESSION_SECRET ?? ''))
    .digest('hex')
    .slice(0, 24);
}