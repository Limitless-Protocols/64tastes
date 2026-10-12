'use client';
import { createPortal } from 'react-dom';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useHydrated } from '@/lib/store';

export type MapTooltipHandle = {
  /** Show the label for a district and begin following the pointer. */
  show: (bn: string, en: string) => void;
  /** Hide and stop following. */
  hide: () => void;
  /** Feed the latest client coords (called on pointermove; no re-render). */
  setPoint: (x: number, y: number) => void;
};

/**
 * The single district-name label. Lives in a portal on document.body so no
 * stacking context can trap it; pointer-events:none so it never blocks the
 * map. Position is written straight to the DOM via rAF + translate3d — the
 * pointer position never touches React state, so the map re-renders zero times
 * on move. Callers decide the gap (mouse 14px above, touch 56px above).
 */
const MapTooltip = forwardRef<MapTooltipHandle>(function MapTooltip(_props, ref) {
  const hydrated = useHydrated();
  const elRef = useRef<HTMLDivElement | null>(null);
  const point = useRef({ x: 0, y: 0, has: false });
  const raf = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    show(bn, en) {
      const el = elRef.current;
      if (!el) return;
      el.querySelector<HTMLElement>('.ml-bn')!.textContent = bn;
      el.querySelector<HTMLElement>('.ml-en')!.textContent = en;
      el.style.opacity = '1';
    },
    hide() {
      const el = elRef.current;
      if (!el) return;
      el.style.opacity = '0';
    },
    setPoint(x, y) {
      point.current = { x, y, has: true };
    },
  }));

  // rAF loop: paint the latest pointer position without touching React.
  useEffect(() => {
    if (!hydrated) return;
    const tick = () => {
      const el = elRef.current;
      const p = point.current;
      if (el && p.has) {
        el.style.transform = `translate3d(${Math.round(p.x)}px, ${Math.round(p.y)}px, 0)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [hydrated]);

  if (!hydrated) return null;
  return createPortal(
    <div className="map-label" ref={elRef} aria-hidden="true">
      <div className="ml-card">
        <span className="ml-bn" />
        <span className="ml-en" />
      </div>
    </div>,
    document.body
  );
});

export default MapTooltip;
