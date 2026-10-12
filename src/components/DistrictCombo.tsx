'use client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import { autoUpdate, flip, offset, shift, size, useFloating } from '@floating-ui/react-dom';
import { districtById, dishById } from '@/lib/data';
import { searchAll, type SearchHit } from '@/lib/search';
import { useMedia, BREAKPOINTS } from '@/lib/hooks';
import { useHydrated } from '@/lib/store';
import type { Dish } from '@/lib/types';

type Props = {
  onPick: (districtId: string) => void;
  /** Dish results open the dish detail instead of selecting a district. */
  onOpenDish?: (dish: Dish) => void;
};

/**
 * "জেলা খুঁজুন" — an ARIA 1.2 combobox over districts AND dishes. On desktop the
 * listbox is portaled to document.body via floating-ui so no stacking context
 * can ever cover it; on mobile it's a full-screen search sheet. Keyboard: ↓/↑
 * move, Enter picks, Esc closes. NFC-normalised, prefix ranked above substring.
 */
export default function DistrictCombo({ onPick, onOpenDish }: Props) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMedia(BREAKPOINTS.mobile);
  const hydrated = useHydrated();
  const listId = useId();

  const rows = useMemo(() => searchAll(q, 40), [q]);

  const { refs, floatingStyles } = useFloating<HTMLDivElement>({
    open: open && !isMobile,
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        apply({ elements, availableHeight }) {
          elements.floating.style.maxHeight = `${Math.max(160, Math.min(availableHeight, 360))}px`;
        },
      }),
    ],
  });

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-hi="1"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [hi, open]);

  function pick(hit: SearchHit) {
    if (hit.kind === 'dish') {
      const dish = dishById[hit.id];
      if (dish && onOpenDish) onOpenDish(dish);
      else onPick(hit.districtId);
    } else {
      onPick(hit.districtId);
    }
    setQ('');
    setOpen(false);
    inputRef.current?.blur();
  }

  // --- desktop: inline input + portaled listbox -----------------------------
  const listbox =
    open && !isMobile && hydrated &&
    createPortal(
      <div
        id={listId}
        ref={(node) => {
          listRef.current = node;
          refs.setFloating(node);
        }}
        className="combo-list"
        role="listbox"
        aria-label="জেলা ও খাবার"
        style={floatingStyles}
      >
        {rows.length === 0 ? (
          <p className="combo-empty">কিছু পাওয়া যায়নি</p>
        ) : (
          rows.map((hit, i) => (
            <div
              key={`${hit.kind}-${hit.id}`}
              role="option"
              aria-selected={i === hi}
              id={`${listId}-opt-${i}`}
              data-hi={i === hi ? '1' : undefined}
              className={`combo-opt${i === hi ? ' hi' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(hit);
              }}
              onMouseEnter={() => setHi(i)}
            >
              {hit.bn}
              <small>
                {hit.en}
                {hit.kind === 'dish' ? ` · ${districtById[hit.districtId]?.nameBn ?? ''}` : ''}
              </small>
            </div>
          ))
        )}
      </div>,
      document.body
    );

  // --- mobile: full-screen search sheet (portaled to escape stacking) --------
  const sheet =
    open && isMobile &&
    hydrated &&
    createPortal(
      <div className="search-sheet" role="dialog" aria-modal="true" aria-label="খুঁজুন">
        <div className="search-bar">
          <Search className="icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={rows[hi] ? `${listId}-opt-${hi}` : undefined}
            aria-label="জেলা বা খাবার খুঁজুন"
            placeholder="জেলা বা খাবার খুঁজুন…"
            value={q}
            autoFocus
            onChange={(e) => {
              setQ(e.target.value);
              setHi(0);
            }}
            onKeyDown={onKeyDown}
          />
          <button className="icon-btn" aria-label="বন্ধ করো" onClick={() => setOpen(false)}>
            <X className="icon" aria-hidden="true" />
          </button>
        </div>
        <div id={listId} ref={listRef} className="search-results" role="listbox" aria-label="ফলাফল">
          {rows.length === 0 ? (
            <p className="combo-empty">কিছু পাওয়া যায়নি</p>
          ) : (
            rows.map((hit, i) => (
              <div
                key={`${hit.kind}-${hit.id}`}
                role="option"
                aria-selected={i === hi}
                id={`${listId}-opt-${i}`}
                data-hi={i === hi ? '1' : undefined}
                className={`combo-opt${i === hi ? ' hi' : ''}`}
                onClick={() => pick(hit)}
              >
                {hit.bn}
                <small>
                  {hit.en}
                  {hit.kind === 'dish' ? ` · ${districtById[hit.districtId]?.nameBn ?? ''}` : ''}
                </small>
              </div>
            ))
          )}
        </div>
      </div>,
      document.body
    );

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHi((h) => Math.min(h + 1, rows.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHi((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && rows[hi]) pick(rows[hi]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="combo">
      <Search className="icon" aria-hidden="true" />
      <input
        ref={(node) => {
          inputRef.current = node;
          refs.setReference(node);
        }}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-activedescendant={open && rows[hi] ? `${listId}-opt-${hi}` : undefined}
        aria-label="জেলা খুঁজুন"
        placeholder="জেলা খুঁজুন…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setHi(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {listbox}
      {sheet}
    </div>
  );
}
