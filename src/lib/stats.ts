import { cacheLife } from 'next/cache';
import { sql } from './db';

export type DishStat = {
  id: number;
  votes: number;
  loved: number;
  okay: number;
  notForMe: number;
  overrated: number;
};

export async function getDishStats(): Promise<DishStat[]> {
  'use cache';
  cacheLife('minutes');
  const rows = await sql`
    select dish_id,
      count(*)::int as votes,
      (count(*) filter (where rating = 'loved'))::int as loved,
      (count(*) filter (where rating = 'okay'))::int as okay,
      (count(*) filter (where rating = 'not_for_me'))::int as not_for_me,
      (count(*) filter (where overrated))::int as overrated
    from ratings group by dish_id`;
  return rows.map((r) => ({
    id: r.dish_id,
    votes: r.votes,
    loved: r.loved,
    okay: r.okay,
    notForMe: r.not_for_me,
    overrated: r.overrated,
  }));
}