import FoodMap from '@/components/FoodMap';

export const metadata = { title: 'সেরা — খাবার বুক' };

/** The সেরা tab as its own URL — refreshing keeps you here. */
export default function TopPage() {
  return <FoodMap initialView="top" />;
}
