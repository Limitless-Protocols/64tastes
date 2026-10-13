export type Tier = { min: number; en: string; bn: string };

/**
 * The Khabar Book prototype's five tiers, expressed over its 13 demo dishes
 * (`0, 1, 4, 8, 13`). They scale to whatever the dataset holds, so a 42-dish
 * set feels the same as the prototype's 13.
 */
const STEP = (n: number) => n / 13;

export const tiers: Tier[] = [
  { min: STEP(0),  en: 'Just Getting Started',    bn: 'সবে শুরু' },
  { min: STEP(1),  en: 'Curious Taster',          bn: 'কৌতূহলী ভোজনরসিক' },
  { min: STEP(4),  en: 'Street Food Survivor',    bn: 'স্ট্রিট ফুড সারভাইভার' },
  { min: STEP(8),  en: 'Grand Foodie',            bn: 'মহা ভোজনরসিক' },
  { min: STEP(13), en: 'Food Map Master',         bn: 'ফুড ম্যাপ মাস্টার' },
];

export function getTierIndex(eaten: number, total: number): number {
  if (total <= 0 || eaten <= 0) return 0;
  const pct = eaten / total;
  let result = 0;
  for (let i = 0; i < tiers.length; i++) {
    if (pct >= tiers[i].min) result = i;
  }
  return result;
}

export const getTier = (eaten: number, total: number): Tier =>
  tiers[getTierIndex(eaten, total)];
