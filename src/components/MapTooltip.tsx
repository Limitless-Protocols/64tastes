'use client';
import { createPortal } from 'react-dom';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { computePosition, flip, offset, shift } from '@floating-ui/react-dom';
import { useHydrated } from '@/lib/store';

export type MapTooltipHandle = {
  /** Show the label for a district; `pt` picks the gap above the point. */
  show: (bn: string, en: string, pt?: 'mouse' | 'pen' | 'touch') => void;
  /** Hide and stop following. */
  hide: () => void;
  /** Feed the latest client coords (called on pointermove; no re-render). */
  setPoint: (x: number, y: number) => void;
};

/** Gap between the point and the label — mouse/pen 14px, touch 56px (finger). */
const GAP: Record<'mouse' | 'pen' | 'touch', number> = { mouse: 14, pen: 14, touch: 56 };

/**
 * The single district-name label. Lives in a portal on document.body so no
 * stacking context can trap it; pointer-events:none so it never blocks the
 * map. Positioned ABOVE the point via floating-ui (`offset` + `flip` + `shift`),
 * so it never leaves the viewport near an edge. Position is written straight to
 * the DOM via rAF + translate3d — the pointer position never touches React
 * state, so the map re-renders zero times on move.
 */
const MapTooltip = forwardRef<MapTooltipHandle>(function MapTooltip(_props, ref) {
  const hydrated = useHydrated();
  const elRef = useRef<HTMLDivElement | null>(null);
  const point = useRef({ x: 0, y: 0, has: false });
  const gap = useRef(GAP.mouse);
  const raf = useRef<number | null>(null);
  const dirty = useRef(false);
  const computing = useRef(false);

  useImperativeHandle(ref, () => ({
    show(bn, en, pt = 'mouse') {
      const el = elRef.current;
      if (!el) return;
      el.querySelector<HTMLElement>('.ml-bn')!.textContent = bn;
      el.querySelector<HTMLElement>('.ml-en')!.textContent = en;
      gap.current = GAP[pt];
      el.style.opacity = '1';
      dirty.current = true;
    },
    hide() {
      const el = elRef.current;
      if (!el) return;
      el.style.opacity = '0';
    },
    setPoint(x, y) {
      point.current = { x, y, has: true };
      dirty.current = true;
    },
  }));

  // rAF loop: recompute the floating position when the point moved, and paint
  // it without touching React. computePosition is async, so only one is in
  // flight at a time; a move during a compute re-queues one more.
  useEffect(() => {
    if (!hydrated) return;
    const tick = async () => {
      const el = elRef.current;
      const p = point.current;
      if (el && p.has && dirty.current && !computing.current) {
        dirty.current = false;
        computing.current = true;
        // a zero-size virtual anchor at the pointer/focus point
        const virtual = {
          getBoundingClientRect: () => ({
            x: p.x, y: p.y, left: p.x, top: p.y, right: p.x, bottom: p.y,
            width: 0, height: 0, toJSON: () => ({}),
          }) as DOMRect,
        };
        try {
          const { x, y } = await computePosition(virtual, el, {
            placement: 'top',
            middleware: [offset(gap.current), flip({ padding: 8 }), shift({ padding: 8 })],
          });
          el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
        } finally {
          computing.current = false;
        }
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
