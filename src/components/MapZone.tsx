'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, FocusEvent } from 'react';
import { createPortal } from 'react-dom';
import { Minus, Plus } from 'lucide-react';
import { districtTone, type DistrictTone } from '@/lib/colors';
import { districts, paths, viewBox } from '@/lib/data';
import { districtAnchor } from '@/lib/pins';
import { BREAKPOINTS, useMedia } from '@/lib/hooks';
import { ZOOM_MAX, ZOOM_STEP } from '@/lib/mapTouch';
import { useHydrated } from '@/lib/store';
import MapTooltip from './MapTooltip';
import type { MapTooltipHandle } from './MapTooltip';

type Props = {
  eaten: Set<number>;
  selected: string | null;
  /** Mouse click / plain tap / Enter: open the district sheet. */
  onSelect: (id: string) => void;
  /** True while the district sheet is open — the pin then floats above it. */
  sheetOpen?: boolean;
  /** Tap/click the empty map background: clear the selection. */
  onClear?: () => void;
  /** District to pulse once — the "মানচিত্রে দেখো" / search "show on map" beat. */
  pulseId?: string | null;
};

/** The base viewBox as numbers, so zoom can derive sub-views from it. */
const [BX, BY, BW, BH] = viewBox.split(' ').map(Number);

/** A short Bangla suffix describing a district's state, for aria-labels. */
const STATE_LABEL: Record<DistrictTone, string> = {
  no: ' — কোনো খাবার নেই',
  has: ' — চেখা বাকি',
  done: ' — চেখেছ',
};

/** First `y` of a path ≈ its latitude — used to ripple districts north → south. */
function firstY(d: string) {
  return Number((d.match(/-?\d+(?:\.\d+)?/g) ?? ['0', '0'])[1]) || 0;
}

const MANDALA = (
  <svg viewBox="-50 -50 100 100" fill="none" stroke="currentColor" strokeWidth=".8" aria-hidden="true">
    <circle r="47" />
    <circle r="42" strokeDasharray="1 3.2" strokeLinecap="round" />
    <circle r="11" />
    <circle r="4" fill="currentColor" />
    {Array.from({ length: 12 }, (_, i) => (
      <g key={i} transform={`rotate(${i * 30})`}>
        <path d="M0-11C-8-21-8-32 0-40C8-32 8-21 0-11z" />
        <circle cy="-44" r="1.6" fill="currentColor" />
      </g>
    ))}
  </svg>
);

/** The nouka on the Bay of Bengal (prototype symbol `#nouka`) — token colours. */
const NOUKA = (
  <svg className="boat" viewBox="0 0 100 100" aria-hidden="true">
    <path d="M52 12v52" stroke="var(--ink)" strokeWidth="3" />
    <path d="M55 14c22 8 28 26 24 44H55z" fill="var(--mango)" />
    <path d="M49 20c-16 6-22 20-22 38h22z" fill="var(--tomato)" />
    <path d="M6 62c22 24 66 24 88 0z" fill="var(--leaf)" />
    <path d="M12 68c20 14 56 14 76 0" stroke="var(--mango)" strokeWidth="4" fill="none" />
  </svg>
);

/**
 * The map's one pin — a tomato teardrop with an ink outline and a cream eye,
 * its TIP at the origin. Drawn ~25 units tall; the map wraps it in
 * `scale(k)` so it stays a constant ~28px on screen at any zoom, and the
 * phone float copy wraps it in a 28px <svg> with a matching viewBox.
 */
const PIN_PATH = 'M0 0C-2.4-6-8-10-8-17a8 8 0 1 1 16 0c0 7-5.6 11-8 17z';
const PIN_H = 25;                       // drawn height in viewBox units
const PIN_PX = 28;                      // constant on-screen height, any zoom
function PinGlyph() {
  return (
    <>
      <path
        d={PIN_PATH}
        fill="var(--tomato)"
        stroke="var(--ink)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cy="-17" r="3.1" fill="var(--cream)" stroke="var(--ink)" strokeWidth="1.3" />
    </>
  );
}

/**
 * The map zone: real geoBoundaries districts, alpona mandala, the stamp and
 * the Bay of Bengal. Districts carry a styled tooltip on hover AND focus
 * (replacing the native `title`); keyboard focus gets a visible ink ring, and
 * every path's aria-label carries its eaten state.
 *
 * Touch is the plain native gesture: a tap IS a click — it opens the district
 * sheet directly (no press-and-hold, no ring, no tooltip). The tooltip stays
 * on mouse/pen hover and keyboard focus, i.e. larger layouts only. A click
 * that follows a pinch (~350ms) is swallowed so zooming never pops a sheet.
 *
 * Pinch (two fingers) or the ± buttons zoom the map; the page itself never
 * scrolls. Tapping the empty background clears the selection. Exactly one pin
 * exists in the DOM at a time — it lives in the SVG, and floats above the open
 * sheet only while that sheet is up.
 */
export default function MapZone({
  eaten, selected, onSelect, sheetOpen = false, onClear, pulseId = null,
}: Props) {
  const zoneRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tipRef = useRef<MapTooltipHandle>(null);
  // pinch: active pointers on the svg, and the last measured span/midpoint
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; mx: number; my: number } | null>(null);
  // a click landing while this is in the future belongs to a pinch, not a tap
  const pinchUntil = useRef(0);
  // px per viewBox unit — lets the pin keep a constant on-screen size.
  const [scale, setScale] = useState(1);
  // pin position in screen px — only needed when the pin must float above the sheet
  const [pinPos, setPinPos] = useState<{ x: number; y: number } | null>(null);
  // zoom: null = the full base view; otherwise a sub-rect of it
  const [view, setView] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const hydrated = useHydrated();
  // On phones the district sheet is a bottom sheet that covers the map, so the
  // pin floats above it (portal on body). On desktop the popup is a centred
  // modal and the map stays visible, so the pin simply stays in the SVG.
  const isMobile = useMedia(BREAKPOINTS.mobile);

  const cells = useMemo(
    () =>
      districts.map((d, i) => ({
        id: d.id,
        d: paths[d.id],
        bn: d.nameBn,
        en: d.nameEn,
        delay: `${(0.4 + (firstY(paths[d.id]) / 1026) * 0.8 + (i % 4) * 0.04).toFixed(2)}s`,
      })),
    []
  );

  // ONE pin: drops onto the selected district (not tied to eaten). Anchored by
  // the pole of inaccessibility (polylabel). Keyed by district so it re-drops
  // whenever the selection changes.
  const pin = useMemo(() => {
    if (!selected || !paths[selected]) return null;
    const [x, y] = districtAnchor(paths[selected]);
    return { id: selected, x, y };
  }, [selected]);

  // Measure the SVG scale so the pin stays ~28px regardless of zoom, and track
  // its screen position so it can float above the mobile district sheet.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const apply = () => {
      const m = svg.getScreenCTM();
      if (!m) return;
      if (m.a) setScale(m.a);
      const p = pin;
      if (p) setPinPos({ x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f });
      else setPinPos(null);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(svg);
    window.addEventListener('resize', apply);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', apply);
    };
  }, [pin, view]);

  const hideLabel = useCallback(() => tipRef.current?.hide(), []);

  // ---- zoom -----------------------------------------------------------------
  /** Screen point → viewBox coords under the CURRENT transform. */
  const toView = useCallback((sx: number, sy: number) => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return { x: 0, y: 0 };
    const inv = m.inverse();
    return { x: inv.a * sx + inv.c * sy + inv.e, y: inv.b * sx + inv.d * sy + inv.f };
  }, []);

  const clampView = useCallback(
    (v: { x: number; y: number; w: number; h: number }) => {
      const w = Math.min(BW, Math.max(BW / ZOOM_MAX, v.w));
      const h = Math.min(BH, Math.max(BH / ZOOM_MAX, v.h));
      const x = Math.min(BX + BW - w, Math.max(BX, v.x));
      const y = Math.min(BY + BH - h, Math.max(BY, v.y));
      return { x, y, w, h };
    },
    []
  );

  /** Magnify by `k` around a screen point (the finger midpoint or the centre). */
  const zoomBy = useCallback(
    (k: number, sx?: number, sy?: number) => {
      const svg = svgRef.current;
      if (!svg) return;
      const cur = view ?? { x: BX, y: BY, w: BW, h: BH };
      const nx = sx ?? window.innerWidth / 2;
      const ny = sy ?? window.innerHeight / 2;
      const { x: vx, y: vy } = toView(nx, ny);
      const w = cur.w / k;
      const h = cur.h / k;
      // keep the point under the cursor fixed as the box resizes around it
      const next = clampView({
        x: vx - ((vx - cur.x) * w) / cur.w,
        y: vy - ((vy - cur.y) * h) / cur.h,
        w, h,
      });
      // back at (or past) 1x → snap to the full view
      setView(next.w >= BW - 0.5 && next.h >= BH - 0.5 ? null : next);
    },
    [view, toView, clampView]
  );

  const zoomIn = useCallback(() => zoomBy(ZOOM_STEP), [zoomBy]);
  const zoomOut = useCallback(() => zoomBy(1 / ZOOM_STEP), [zoomBy]);

  // Mouse / pen: label sits ABOVE the cursor, horizontally centred, flipped and
  // shifted by CSS so it never leaves the viewport. A finger never shows one.
  const onMove = useCallback(
    (e: ReactPointerEvent<SVGPathElement>, bn: string, en: string) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      tipRef.current?.setPoint(e.clientX, e.clientY);
      tipRef.current?.show(bn, en, e.pointerType);
    },
    []
  );

  // Mouse click, keyboard Enter, and a plain touch tap all land here — open.
  const onClick = useCallback(
    (e: React.MouseEvent<SVGPathElement>, id: string) => {
      if (performance.now() < pinchUntil.current) return; // pinch, not a tap
      onSelect(id);
    },
    [onSelect]
  );

  // ---- pinch (two fingers) --------------------------------------------------
  const onSvgDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType !== 'touch') return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      // a second finger means "gesture" — swallow the click that follows it
      pinchUntil.current = performance.now() + 350;
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
    }
  }, []);

  const onSvgMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (e.pointerType !== 'touch' || !pointers.current.has(e.pointerId)) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.current.size < 2 || !pinch.current) return;
      pinchUntil.current = performance.now() + 350;
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const { dist: d0, mx: px, my: py } = pinch.current;
      if (d0 > 0 && dist > 0) zoomBy(dist / d0, mx, my);
      // two-finger pan: slide the view by the midpoint's drift
      const svg = svgRef.current;
      const m = svg?.getScreenCTM();
      if (m && (mx !== px || my !== py)) {
        const cur = view ?? { x: BX, y: BY, w: BW, h: BH };
        setView(
          clampView({
            x: cur.x - ((mx - px) * cur.w) / (m.a || 1),
            y: cur.y - ((my - py) * cur.h) / (m.d || 1),
            w: cur.w, h: cur.h,
          })
        );
      }
      pinch.current = { dist, mx, my };
    },
    [view, zoomBy, clampView]
  );

  const onSvgUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  }, []);

  // Keyboard focus: pin the label just above the focused district. Gated off
  // on phones — a tap can focus the path, and phones get no tooltip at all.
  const onFocus = useCallback((e: FocusEvent<SVGPathElement>, bn: string, en: string) => {
    if (isMobile) return;
    const r = e.currentTarget.getBoundingClientRect();
    tipRef.current?.setPoint(r.left + r.width / 2, r.top);
    tipRef.current?.show(bn, en, 'mouse');
  }, [isMobile]);

  const currentView = view ?? { x: BX, y: BY, w: BW, h: BH };
  const zoomed = view !== null;

  return (
    <section className="map-zone" ref={zoneRef} aria-label="বাংলাদেশের খাবারের মানচিত্র">
      <div className="mand-bg" aria-hidden="true">{MANDALA}</div>

      <svg
        ref={svgRef}
        className="map-svg"
        viewBox={`${currentView.x} ${currentView.y} ${currentView.w} ${currentView.h}`}
        role="group"
        aria-label="Map of Bangladesh districts"
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={onSvgDown}
        onPointerMove={onSvgMove}
        onPointerUp={onSvgUp}
        onPointerCancel={onSvgUp}
        onClick={(e) => {
          // Tap the empty background (not a district path) → clear the pick.
          // Checked on the <svg> itself so the letterbox area counts too.
          if (onClear && !(e.target as Element).closest('path.d')) onClear();
        }}
      >
        {/* transparent backdrop: tapping the empty map clears the selection */}
        {/* transparent backdrop fills the viewBox so the map feels solid; the
            empty-space clear is handled by the <svg> onClick above */}
        <rect
          className="map-bg"
          x={BX} y={BY} width={BW} height={BH}
          fill="transparent"
        />
        {cells.map((c) => {
          const tone = districtTone(c.id, eaten);
          return (
            <path
              key={c.id}
              d={c.d}
              className={`d ${tone}${selected === c.id ? ' sel' : ''}${pulseId === c.id ? ' pulse' : ''}`}
              style={{ '--cd': c.delay } as CSSProperties}
              role="button"
              tabIndex={0}
              aria-label={`${c.bn} ${c.en}${STATE_LABEL[tone]}`}
              aria-pressed={selected === c.id}
              onClick={(e) => onClick(e, c.id)}
              onPointerMove={(e) => onMove(e, c.bn, c.en)}
              // Hide the label the moment the mouse/pen leaves the district —
              // without this it stays stuck at its last position over the sea.
              onPointerLeave={hideLabel}
              onFocus={(e) => onFocus(e, c.bn, c.en)}
              onBlur={hideLabel}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(c.id);
                }
              }}
            />
          );
        })}
        {/* ONE pin — the SVG copy. Suppressed only while the phone float copy
            is showing, so there is never more than one pin in the DOM. */}
        {pin && !(isMobile && hydrated && sheetOpen && pinPos) && (
          <g
            key={pin.id}
            className="pin-layer"
            transform={`translate(${pin.x} ${pin.y}) scale(${PIN_PX / PIN_H / (scale || 1)})`}
            aria-hidden="true"
          >
            <g className="pin-drop"><PinGlyph /></g>
          </g>
        )}
      </svg>

      {/* zoom: two 44px buttons at the left edge, mid-height (phones) */}
      <div className="zoom-ctl">
        <button className="zoom-btn" onClick={zoomIn} aria-label="জুম ইন" disabled={!zoomed && currentView.w <= BW / ZOOM_MAX}>
          <Plus className="icon" aria-hidden="true" />
        </button>
        <button className="zoom-btn" onClick={zoomOut} aria-label="জুম আউট" disabled={!zoomed}>
          <Minus className="icon" aria-hidden="true" />
        </button>
      </div>

      {/* single district-name label — portal + rAF, never trapped by stacking */}
      <MapTooltip ref={tipRef} />

      {/* phones: the selected pin floats above the open district sheet */}
      {isMobile && hydrated && sheetOpen && pinPos &&
        createPortal(
          <div className="pin-float" style={{ left: pinPos.x, top: pinPos.y }} aria-hidden="true">
            {/* same glyph, wrapped for HTML: viewBox bottom-centre = the tip,
                so translate(-50%,-100%) lands the tip exactly on the anchor */}
            <svg width={PIN_PX} height={(PIN_PX * (PIN_H + 1)) / 18} viewBox={`-9 ${-PIN_H - 1} 18 ${PIN_H + 1}`}>
              <PinGlyph />
            </svg>
          </div>,
          document.body
        )}

      <div className="stamp" aria-hidden="true">
        <div>
          <span className="stamp-top">খাবার বুক</span>
          <strong>৬৪ জেলা</strong>
          <span className="stamp-bot">EDITION 01</span>
        </div>
      </div>

      <div className="sea" aria-hidden="true">
        {NOUKA}
        <div className="waves">〰 〰</div>
        <div className="compass">✥<small>N · E · S · W</small></div>
      </div>
    </section>
  );
}
