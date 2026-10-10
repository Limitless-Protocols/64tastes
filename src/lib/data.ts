import districtsJson from '@/data/districts.json';
import dishesJson from '@/data/dishes.json';
import pathsJson from '@/data/districtPaths.json';
import type { District, Dish } from './types';

export const districts = districtsJson as District[];
// districts.json lists every district; ones without a dish have empty-string fields
export const dishes = (dishesJson as Dish[]).filter((d) => d.nameEn !== '');
export const viewBox: string = pathsJson.viewBox;
export const paths: Record<string, string> = pathsJson.paths;

export const dishesByDistrict: Record<string, Dish[]> = {};
for (const dish of dishes) {
  (dishesByDistrict[dish.districtId] ??= []).push(dish);
}

export const districtById: Record<string, District> = Object.fromEntries(
  districts.map((d) => [d.id, d])
);
export const totalDishes = dishes.length;