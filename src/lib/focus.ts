'use client';
import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Shared overlay focus behaviour (design pass § overlay system):
 * while `active`, Tab cycles inside the element, the element receives focus
 * on mount, and the previously focused element gets focus back on unmount.
 * Every [role="dialog"] in the app uses this — one implementation, not nine.
 */
export function useFocusTrap<T extends HTMLElement>(active = true) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    el?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !el) return;
      const list = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      const cur = document.activeElement;
      const inside = cur ? el.contains(cur) : false;
      if (e.shiftKey && (!inside || cur === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!inside || cur === last)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (prev?.isConnected) prev.focus();
    };
  }, [active]);

  return ref;
}
