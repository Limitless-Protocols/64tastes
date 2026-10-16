import { Suspense } from 'react';
import type { Metadata } from 'next';
import { districts, dishesByDistrict } from '@/lib/data';
import { getGuideSpots } from '@/lib/spots';
import { bn } from '@/lib/format';
import FoodGuide, { type FoodGuideStop } from '@/components/FoodGuide';

export const metadata: Metadata = {
  title: 'খাবারের পথ — Bangladesh Food Map',
  description: 'বাংলাদেশের জেলার স্বাদ আর মানুষের পছন্দের খাবারের জায়গা ধরে এগিয়ে চলো।',
};

export default function GuidePage() {
  return (
    <main className="food-guide-main">
      <Suspense fallback={<p className="guide-loading">খাবারের পথ তৈরি হচ্ছে…</p>}>
        <GuideContent />
      </Suspense>
    </main>
  );
}

async function GuideContent() {
  const spotByDish = new Map((await getGuideSpots()).map((spot) => [spot.dishId, spot]));
  const stops: FoodGuideStop[] = districts.flatMap((district) =>
    (dishesByDistrict[district.id] ?? []).flatMap((dish) => {
      const spot = spotByDish.get(dish.id);
      return spot ? [{
        id: `${district.id}-${dish.id}`,
        districtId: district.id,
        district: district.nameEn,
        districtBn: district.nameBn,
        division: district.division,
        dishId: dish.id,
        slug: dish.slug,
        dish: dish.nameEn,
        dishBn: dish.nameBn,
        spotId: spot.id,
        spot: spot.name,
        picks: spot.picks,
      }] : [];
    })
  );

  return <FoodGuide stops={stops} totalDistricts={bn(new Set(stops.map((stop) => stop.districtId)).size)} />;
}
