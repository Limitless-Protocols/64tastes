import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { sql } from '@/lib/db';
import { isAdminApi } from '@/lib/admin';
import { validDishIds } from '@/lib/validate';
import { dishTag, splitLines } from '@/lib/dishContent';

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const intOrNull = (v: unknown, max: number) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 && n <= max ? n : null;
};
const lines = (v: unknown, maxLines: number, maxLen: number) =>
  splitLines(clean(v, maxLines * maxLen))
    .slice(0, maxLines)
    .map((l) => l.slice(0, maxLen))
    .join('\n');

export async function POST(req: Request) {
  if (!(await isAdminApi())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const dishId = body?.dishId;
  if (!validDishIds.has(dishId)) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const descriptionBn = clean(body.descriptionBn, 1500);
  const descriptionEn = clean(body.descriptionEn, 1500);
  const ingredients = lines(body.ingredients, 60, 200);
  const steps = lines(body.steps, 40, 600);
  const servings = intOrNull(body.servings, 100);
  const minutes = intOrNull(body.minutes, 2000);
  const credit = clean(body.photoCredit, 120);

  const spots = (Array.isArray(body.spots) ? body.spots.slice(0, 8) : [])
    .map((s: { name?: unknown; area?: unknown; note?: unknown }) => ({
      name: clean(s?.name, 80),
      area: clean(s?.area, 80),
      note: clean(s?.note, 160),
    }))
    .filter((s: { name: string }) => s.name.length >= 2);

  await sql`
    insert into dish_content (dish_id, description_bn, description_en, servings, minutes, ingredients, steps)
    values (${dishId}, ${descriptionBn || null}, ${descriptionEn || null}, ${servings}, ${minutes},
            ${ingredients || null}, ${steps || null})
    on conflict (dish_id) do update set
      description_bn = excluded.description_bn,
      description_en = excluded.description_en,
      servings = excluded.servings,
      minutes = excluded.minutes,
      ingredients = excluded.ingredients,
      steps = excluded.steps,
      updated_at = now()`;

  await sql`update dish_photos set credit = ${credit || null} where dish_id = ${dishId}`;

  await sql`delete from dish_spots where dish_id = ${dishId}`;
  for (let i = 0; i < spots.length; i++) {
    const s = spots[i];
    await sql`
      insert into dish_spots (dish_id, name, area, note, sort)
      values (${dishId}, ${s.name}, ${s.area || null}, ${s.note || null}, ${i})`;
  }

  revalidateTag(dishTag(dishId), 'max');
  return NextResponse.json({ ok: true });
}