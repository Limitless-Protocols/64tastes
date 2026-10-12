'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, FocusEvent } from 'react';
import { districtTone } from '@/lib/colors';
import { districts, paths, viewBox } from '@/lib/data';
import { districtAnchor } from '@/lib/pins';
import MapTooltip from './MapTooltip';
import type { MapTooltipHandle } from './MapTooltip';

type Props = {
  eaten: Set<number>;
  selected: string | null;
  onSelect: (id: string) => void;
};

/** Touch-and-hold reveals the label; a quick tap is a plain single-step select. */
const TOUCH_HOLD_LABEL = true;
const TOUCH_HOLD_MS = 400;

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
 * The map zone: real geoBoundaries districts, alpona mandala, the stamp and
 * the Bay of Bengal. Districts carry a styled tooltip on hover AND focus
 * (replacing the native `title`); keyboard focus gets a visible ink ring.
 */
export default function MapZone({ eaten, selected, onSelect }: Props) {
  const zoneRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tipRef = useRef<MapTooltipHandle>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // px per viewBox unit — lets the 📍 pin keep a constant on-screen size.
  const [scale, setScale] = useState(1);

  const cells = useMemo(
    () =>
      districts.map((d, i) => ({
        id: d.id,
        d: paths[d.id],
        label: `${d.nameBn} ${d.nameEn}`,
        bn: d.nameBn,
        en: d.nameEn,
        delay: `${(0.4 + (firstY(paths[d.id]) / 1026) * 0.8 + (i % 4) * 0.04).toFixed(2)}s`,
      })),
    []
  );

  // ONE 📌 pin: drops onto the selected district (not tied to eaten). Anchored
  // by the pole of inaccessibility (polylabel). Keyed by district so it re-drops
  // whenever the selection changes.
  const pin = useMemo(() => {
    if (!selected || !paths[selected]) return null;
    const [x, y] = districtAnchor(paths[selected]);
    return { id: selected, x, y };
  }, [selected]);

  // Measure the SVG scale so the pin stays 28–32px regardless of zoom.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const apply = () => {
      const ctm = svg.getScreenCTM();
      if (ctm && ctm.a) setScale(ctm.a);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(svg);
    return () => ro.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
    },
    []
  );

  const hideLabel = useCallback(() => tipRef.current?.hide(), []);

  // Mouse / pen: label sits to the RIGHT of the cursor, vertically centred.
  const onMove = useCallback(
    (e: ReactPointerEvent<SVGPathElement>, bn: string, en: string) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      tipRef.current?.setPoint(e.clientX, e.clientY);
      tipRef.current?.show(bn, en, e.pointerType);
    },
    []
  );

  // Touch: a 400ms hold reveals the label above the finger; a quick tap is a
  // plain select (the click handler), so no label and no two-step flow.
  const onDown = useCallback(
    (e: ReactPointerEvent<SVGPathElement>, bn: string, en: string) => {
      if (e.pointerType !== 'touch' || !TOUCH_HOLD_LABEL) return;
      if (holdTimer.current) clearTimeout(holdTimer.current);
      holdTimer.current = setTimeout(() => {
        tipRef.current?.setPoint(e.clientX, e.clientY);
        tipRef.current?.show(bn, en, 'touch');
      }, TOUCH_HOLD_MS);
    },
    []
  );

  const cancelHold = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    tipRef.current?.hide();
  }, []);

  // Keyboard focus: pin the label just to the right of the focused district.
  const onFocus = useCallback((e: FocusEvent<SVGPathElement>, bn: string, en: string) => {
    const r = e.currentTarget.getBoundingClientRect();
    tipRef.current?.setPoint(r.right, r.top + r.height / 2);
    tipRef.current?.show(bn, en, 'mouse');
  }, []);

  return (
    <section className="map-zone" ref={zoneRef} aria-label="বাংলাদেশের খাবারের মানচিত্র">
      <div className="mand-bg" aria-hidden="true">{MANDALA}</div>

      <svg ref={svgRef} className="map-svg" viewBox={viewBox} role="group" aria-label="Map of Bangladesh districts">
        {cells.map((c) => (
          <path
            key={c.id}
            d={c.d}
            className={`d ${districtTone(c.id, eaten)}${selected === c.id ? ' sel' : ''}`}
            style={{ '--cd': c.delay } as CSSProperties}
            role="button"
            tabIndex={0}
            aria-label={c.label}
            aria-pressed={selected === c.id}
            onClick={() => onSelect(c.id)}
            onPointerMove={(e) => onMove(e, c.bn, c.en)}
            onPointerDown={(e) => onDown(e, c.bn, c.en)}
            onPointerLeave={cancelHold}
            onPointerCancel={cancelHold}
            onPointerUp={cancelHold}
            onFocus={(e) => onFocus(e, c.bn, c.en)}
            onBlur={hideLabel}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(c.id);
              }
            }}
          />
        ))}
        {/* ONE 📌 pin — separate positioning (<g>) from animation (<text>). */}
        {pin && (
          <g key={pin.id} className="pin-layer" transform={`translate(${pin.x} ${pin.y})`} aria-hidden="true">
            <text
              className="pin-drop"
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontSize: `${30 / (scale || 1)}px` }}
            >
              📌
            </text>
          </g>
        )}
      </svg>

      {/* single district-name label — portal + rAF, never trapped by stacking */}
      <MapTooltip ref={tipRef} />

      <div className="stamp" aria-hidden="true">
        <div>খাবার বুক<strong>৬৪ জেলা</strong>EDITION 01</div>
      </div>

      <div className="sea" aria-hidden="true">
        {NOUKA}
        <div className="waves">〰 〰</div>
        <div className="compass">✥<small>N · E · S · W</small></div>
      </div>
    </section>
  );
}
