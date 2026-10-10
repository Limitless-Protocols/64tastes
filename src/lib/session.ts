import { createHmac, timingSafeEqual } from 'node:crypto';

export const COOKIE = 'ft_session';
export const MAX_AGE = 60 * 60 * 24 * 3; // 3 days

const sign = (data: string) =>
  createHmac('sha256', process.env.SESSION_SECRET!).update(data).digest('base64url');

export function makeSession(deviceId: string): string {
  const data = `${deviceId}.${Date.now() + MAX_AGE * 1000}`;
  return `${data}.${sign(data)}`;
}

export function verifySession(value: string | undefined, deviceId: string): boolean {
  if (!value) return false;
  const parts = value.split('.');
  if (parts.length !== 3) return false;
  const [id, exp, sig] = parts;
  if (id !== deviceId || Number(exp) < Date.now()) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(`${id}.${exp}`));
  return a.length === b.length && timingSafeEqual(a, b);
}