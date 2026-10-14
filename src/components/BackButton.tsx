'use client';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { canGoBackInApp } from '@/lib/history';

/**
 * "← পেছনে" — steps back through history to whatever opened this page (catalog,
 * search, polaroid, top board…). A cold load with no in-app history falls back
 * to the map so the button is never a dead end — history.length alone can't
 * tell those apart (it counts the about:blank tab entry), so the root layout
 * snapshots the baseline via <HistoryBaseline />.
 */
export default function BackButton() {
  const router = useRouter();
  return (
    <button
      className="btn alt back-btn"
      onClick={() => (canGoBackInApp() ? router.back() : router.push('/'))}
    >
      <ArrowLeft className="icon" aria-hidden="true" /> পেছনে
    </button>
  );
}
