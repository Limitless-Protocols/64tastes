import districtsJson from '@/data/districts.json';
import dishesJson from '@/data/dishes.json';
import pathsJson from '@/data/districtPaths.json';
import type { District, Dish } from './types';

export const districts = districtsJson as District[];
export const dishes = dishesJson as Dish[];
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