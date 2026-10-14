import { connection } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifySession } from './session';

export async function isAdminApi(): Promise<boolean> {
  const store = await cookies();
  return verifySession(store.get(ADMIN_COOKIE)?.value, 'admin');
}

export async function isAdminPage(): Promise<boolean> {
  await connection();
  return isAdminApi();
}