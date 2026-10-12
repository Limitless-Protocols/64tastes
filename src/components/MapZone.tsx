'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent, FocusEvent } from 'react';
import { districtTone } from '@/lib/colors';
import { districtById, districts, dishesByDistrict, paths, viewBox } from '@/lib/data';
import { districtAnchor } from '@/lib/pins';

type Props = {
  eaten: Set<number>;
  selected: string | null;
  onSelect: (id: string) => void;
};

type Tip = { x: number; y: number; t: string; s: string };

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
  const [tip, setTip] = useState<Tip | null>(null);
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

  // ONE 📍 pin: only on the selected district, and only once its food is eaten.
  // Anchored by the pole of inaccessibility (polylabel).
  const pin = useMemo(() => {
    if (!selected) return null;
    const hasEaten = (dishesByDistrict[selected] ?? []).some((x) => eaten.has(x.id));
    if (!hasEaten || !paths[selected] || !districtById[selected]) return null;
    const [x, y] = districtAnchor(paths[selected]);
    return { x, y, name: districtById[selected].nameBn };
  }, [selected, eaten]);

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

  const showTip = useCallback((el: Element, t: string, s: string) => {
    const zone = zoneRef.current;
    if (!zone) return;
    const zr = zone.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setTip({ x: r.left + r.width / 2 - zr.left, y: r.top - zr.top - 8, t, s });
  }, []);

  const hideTip = useCallback(() => setTip(null), []);

  return (
    <section className="map-zone" ref={zoneRef} aria-label="বাংলাদেশের খাবারের মানচিত্র">
      <div className="mand-bg" aria-hidden="true">{MANDALA}</div>

      <svg ref={svgRef} className="map-svg" viewBox={viewBox} role="group" aria-label="Map of Bangladesh districts">
        {cells.map((c) => {
          const onEnter = (e: MouseEvent<SVGPathElement>) =>
            showTip(e.currentTarget, c.bn, c.en);
          const onFocus = (e: FocusEvent<SVGPathElement>) =>
            showTip(e.currentTarget, c.bn, c.en);
          return (
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
              onMouseEnter={onEnter}
              onMouseLeave={hideTip}
              onFocus={onFocus}
              onBlur={hideTip}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(c.id);
                }
              }}
            />
          );
        })}
        {/* ONE 📍 pin — separate positioning (<g>) from animation (<text>). */}
        {pin && (
          <g className="pin-layer" transform={`translate(${pin.x} ${pin.y})`} aria-hidden="true">
            <text
              className="pin-drop"
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontSize: `${30 / (scale || 1)}px` }}
            >
              📍
            </text>
          </g>
        )}
      </svg>

      {tip && (
        <div className="tip" role="presentation">
          <b>{tip.t}</b>
          <small>{tip.s}</small>
        </div>
      )}

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
