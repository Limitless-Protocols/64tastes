'use client';
import { useEffect } from 'react';
import { captureHistoryBaseline } from '@/lib/history';

/**
 * Mounted once in the root layout: records the tab's first history.length so
 * BackButton can tell a cold load (no in-app history → fall back to the map)
 * apart from "navigated here from the catalog/search/board" (→ history.back).
 */
export default function HistoryBaseline() {
  useEffect(() => {
    captureHistoryBaseline();
  }, []);
  return null;
}
