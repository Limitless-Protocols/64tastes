'use client';
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { artFor } from '@/lib/art';
import { districtTone } from '@/lib/colors';
import { districts, dishesByDistrict, paths, viewBox } from '@/lib/data';
import { districtAnchor } from '@/lib/pins';

type Props = {
  eaten: Set<number>;
  selected: string | null;
  onSelect: (id: string) => void;
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

/** The nouka on the Bay of Bengal (prototype symbol `#nouka`). */
const NOUKA = (
  <svg className="boat" viewBox="0 0 100 100" aria-hidden="true">
    <path d="M52 12v52" stroke="#24231F" strokeWidth="3" />
    <path d="M55 14c22 8 28 26 24 44H55z" fill="#F6C94C" />
    <path d="M49 20c-16 6-22 20-22 38h22z" fill="#E94D2E" />
    <path d="M6 62c22 24 66 24 88 0z" fill="#47764A" />
    <path d="M12 68c20 14 56 14 76 0" stroke="#F6C94C" strokeWidth="4" fill="none" />
  </svg>
);

export default function MapZone({ eaten, selected, onSelect }: Props) {
  const cells = useMemo(
    () =>
      districts.map((d, i) => ({
        id: d.id,
        d: paths[d.id],
        label: `${d.nameBn} ${d.nameEn}`,
        title: `${d.nameBn} · ${d.nameEn}`,
        delay: `${(0.4 + (firstY(paths[d.id]) / 1026) * 0.8 + (i % 4) * 0.04).toFixed(2)}s`,
      })),
    []
  );

  // Pins appear on eaten districts — computed lazily, only for those.
  const pins = useMemo(
    () =>
      districts.flatMap((d) => {
        const dish = (dishesByDistrict[d.id] ?? []).find((x) => eaten.has(x.id));
        if (!dish || !paths[d.id]) return [];
        const [x, y] = districtAnchor(paths[d.id]);
        return [{ id: d.id, x, y, e: artFor(dish).e }];
      }),
    [eaten]
  );

  return (
    <section className="map-zone" aria-label="বাংলাদেশের খাবারের মানচিত্র">
      <div className="mand-bg" aria-hidden="true">{MANDALA}</div>

      <svg className="map-svg" viewBox={viewBox} role="group" aria-label="Map of Bangladesh districts">
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(c.id);
              }
            }}
          >
            <title>{c.title}</title>
          </path>
        ))}
        <g aria-hidden="true">
          {pins.map((p) => (
            <text key={p.id} className="pin" x={p.x} y={p.y} fontSize={30} textAnchor="middle" dominantBaseline="central">
              {p.e}
            </text>
          ))}
        </g>
      </svg>

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
