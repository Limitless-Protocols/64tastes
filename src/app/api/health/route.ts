import { connection } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  // Defer to request time. Without this, `next build` prerenders the handler
  // and tries to open a Neon connection at build time, where DATABASE_URL is
  // usually absent — that throws and fails the whole build.
  await connection();
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`select now() as now`;
  return Response.json({ ok: true, now: rows[0].now });
}
