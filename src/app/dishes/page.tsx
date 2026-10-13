import FoodMap from '@/components/FoodMap';

export const metadata = { title: 'খাবার — খাবার বুক' };

/** The খাবার tab as its own URL — refreshing keeps you here. */
export default function DishesPage() {
  return <FoodMap initialView="dishes" />;
}
