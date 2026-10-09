import type { Metadata } from 'next';
import ResultView from '@/components/ResultView';
import { decodeProgress } from '@/lib/share';
import { getTier } from '@/lib/tiers';
import { totalDishes } from '@/lib/data';
import { bn } from '@/lib/format';

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const eaten = decodeProgress(code);
  const tier = getTier(eaten.size, totalDishes);
  const title = `আমি ${bn(eaten.size)}টি খাবার চেখে দেখেছি — ${tier.bn}`;
  const description = 'তুমি কতটা চেখেছ? তোমার ফুড ম্যাপ বানাও।';
  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description, images: ['/og/default.png'], locale: 'bn_BD', type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: ['/og/default.png'] },
  };
}

export default async function ResultPage({ params }: Props) {
  const { code } = await params;
  return <ResultView code={code} />;
}