'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { districts } from '@/lib/data';

type Props = {
  onPick: (districtId: string) => void;
};

/**
 * "জেলা খুঁজুন" — a small combobox so every district is reachable by name
 * (tiny ones around Dhaka especially). Keyboard: ↓/↑ move, Enter picks,
 * Esc closes. Picking a district behaves exactly like clicking it on the map.
 */
export default function DistrictCombo({ onPick }: Props) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => {
    const n = q.trim().toLowerCase();
    const hit = n
      ? districts.filter(
          (d) =>
            d.nameBn.includes(n) ||
            d.nameEn.toLowerCase().includes(n) ||
            d.id.includes(n)
        )
      : districts;
    return hit.slice(0, 40);
  }, [q]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-hi="1"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [hi, open]);

  function pick(id: string) {
    onPick(id);
    setQ('');
    setOpen(false);
  }

  return (
    <div className="combo">
      <Search className="icon" aria-hidden="true" />
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls="combo-list"
        aria-autocomplete="list"
        aria-label="জেলা খুঁজুন"
        placeholder="জেলা খুঁজুন…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setHi(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            setHi((h) => Math.min(h + 1, rows.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHi((h) => Math.max(h - 1, 0));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            if (open && rows[hi]) pick(rows[hi].id);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
      />
      {open && (
        <div className="combo-list" id="combo-list" role="listbox" aria-label="জেলার তালিকা" ref={listRef}>
          {rows.length === 0 ? (
            <p className="combo-empty">কোনো জেলা পাওয়া যায়নি</p>
          ) : (
            rows.map((d, i) => (
              <div
                key={d.id}
                role="option"
                aria-selected={i === hi}
                data-hi={i === hi ? '1' : undefined}
                className={`combo-opt${i === hi ? ' hi' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(d.id);
                }}
                onMouseEnter={() => setHi(i)}
              >
                {d.nameBn}
                <small>{d.nameEn}</small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
