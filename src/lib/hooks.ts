'use client';
import { useCallback, useSyncExternalStore } from 'react';

/** SSR-safe matchMedia hook — false on server, live value on the client. */
export function useMedia(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query]
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => false, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Breakpoint tokens used across the app. */
export const BREAKPOINTS = {
  mobile: '(max-width: 767px)',     // < 768px
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  tall: '(min-height: 700px)',
} as const;
