export type Tier = { min: number; en: string; bn: string };

export const tiers: Tier[] = [
  { min: 0,   en: 'Just Getting Started',   bn: 'সবে শুরু' },
  { min: 0,   en: 'Curious Taster',         bn: 'কৌতূহলী ভোজনরসিক' },
  { min: 0.2, en: 'Street Food Regular',    bn: 'পথের খাবারের ভক্ত' },
  { min: 0.4, en: 'Seasoned Foodie',        bn: 'পাকা ভোজনরসিক' },
  { min: 0.6, en: 'Food Explorer',          bn: 'খাদ্য অভিযাত্রী' },
  { min: 0.8, en: 'Bangladesh Food Legend', bn: 'বাংলাদেশের খাদ্য কিংবদন্তি' },
];

export function getTier(eaten: number, total: number): Tier {
  if (eaten === 0 || total === 0) return tiers[0];
  const pct = eaten / total;
  let result = tiers[1];
  for (const tier of tiers.slice(1)) {
    if (pct >= tier.min) result = tier;
  }
  return result;
}