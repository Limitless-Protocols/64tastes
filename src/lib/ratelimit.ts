import { sql } from './db';

export async function allow(bucket: string, limit: number): Promise<boolean> {
  const rows = await sql`
    insert into rate_limits (bucket, window_start, count)
    values (${bucket}, date_trunc('hour', now()), 1)
    on conflict (bucket, window_start)
    do update set count = rate_limits.count + 1
    returning count`;
  if (Math.random() < 0.01) {
    await sql`delete from rate_limits where window_start < now() - interval '1 day'`;
  }
  return Number(rows[0].count) <= limit;
}