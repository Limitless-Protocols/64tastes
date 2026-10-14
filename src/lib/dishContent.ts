import { cacheLife, cacheTag } from 'next/cache';
import { sql } from './db';

export type DishSpot = { id: number; name: string; area: string; note: string };

export type DishContent = {
  descriptionBn: string;
  descriptionEn: string;
  servings: number | null;
  minutes: number | null;
  ingredients: string[];
  steps: string[];
  spots: DishSpot[];
  photo: { credit: string; v: number } | null; 
};

export const dishTag = (id: number) => `dish-${id}`;

export function splitLines(text: string | null | undefined): string[] {
  return (text ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
}

export async function loadDishContent(dishId: number): Promise<DishContent> {
  const [contentRows, photoRows, spotRows] = await Promise.all([
    sql`select description_bn, description_en, servings, minutes, ingredients, steps
        from dish_content where dish_id = ${dishId}`,
    sql`select credit, extract(epoch from updated_at)::bigint as v
        from dish_photos where dish_id = ${dishId}`,
    sql`select id, name, area, note from dish_spots where dish_id = ${dishId} order by sort, id`,
  ]);
  const c = contentRows[0];
  const p = photoRows[0];
  return {
    descriptionBn: c?.description_bn ?? '',
    descriptionEn: c?.description_en ?? '',
    servings: c?.servings ?? null,
    minutes: c?.minutes ?? null,
    ingredients: splitLines(c?.ingredients),
    steps: splitLines(c?.steps),
    spots: spotRows.map((s) => ({
      id: s.id,
      name: s.name,
      area: s.area ?? '',
      note: s.note ?? '',
    })),
    photo: p ? { credit: p.credit ?? '', v: Number(p.v) } : null,
  };
}

export async function getDishContent(dishId: number): Promise<DishContent> {
  'use cache';
  cacheLife('minutes');
  cacheTag(dishTag(dishId));
  return loadDishContent(dishId);
}