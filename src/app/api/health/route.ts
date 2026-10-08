import { neon } from '@neondatabase/serverless';

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`select now() as now`;
  return Response.json({ ok: true, now: rows[0].now });
}