import districtsJson from '@/data/districts.json';
import dishesJson from '@/data/dishes.json';
import pathsJson from '@/data/districtPaths.json';
import type { District, Dish } from './types';

export const districts = districtsJson as District[];
// districts.json lists every district; ones without a dish have empty-string fields
export const dishes = (dishesJson as Dish[]).filter((d) => d.nameEn !== '');
// The declared viewBox with a little padding, so the country (and the map's
// drop shadow) always sits fully inside the SVG box — nothing can spill out
// of the map zone and hide under the pieces around it.
export const viewBox: string = (() => {
  const [, , w, h] = pathsJson.viewBox.split(' ').map(Number);
  const pad = 14;
  return `${-pad} ${-pad} ${w + 2 * pad} ${h + 2 * pad}`;
})();
export const paths: Record<string, string> = pathsJson.paths;

export const dishesByDistrict: Record<string, Dish[]> = {};
for (const dish of dishes) {
  (dishesByDistrict[dish.districtId] ??= []).push(dish);
}

export const districtById: Record<string, District> = Object.fromEntries(
  districts.map((d) => [d.id, d])
);
export const dishBySlug: Record<string, Dish> = Object.fromEntries(
  dishes.map((d) => [d.slug, d])
);
export const totalDishes = dishes.length;