import { cacheLife } from 'next/cache';
import { sql } from './db';

export const MIN_PICKS = Number(process.env.MIN_PICKS ?? 3);

export type Spot = { id: string; name: string; picks: number };

export async function getTopSpots(dishId: number): Promise<Spot[]> {
  'use cache';
  cacheLife('minutes');
  const rows = await sql`
    select p.place_id,
            coalesce(max(m.display_name), mode() within group (order by p.place_name)) as name,
            count(*)::int as picks
    from place_picks p
    join place_moderation m on m.place_id = p.place_id and m.status = 'approved'
    where p.dish_id = ${dishId}
    group by p.place_id
    having count(*) >= ${MIN_PICKS}
    order by picks desc
    limit 3`;
  return rows.map((r) => ({ id: r.place_id, name: r.name ?? '', picks: r.picks }));
}