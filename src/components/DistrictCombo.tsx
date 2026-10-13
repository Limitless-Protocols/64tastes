'use client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import { autoUpdate, flip, offset, shift, size, useFloating } from '@floating-ui/react-dom';
import { districtById, dishesByDistrict, dishById } from '@/lib/data';
import { searchAll, type SearchHit } from '@/lib/search';
import { useMedia, BREAKPOINTS } from '@/lib/hooks';
import { useHydrated } from '@/lib/store';
import type { Dish } from '@/lib/types';

type Props = {
  onPick: (districtId: string) => void;
  /** Dish results open the dish detail instead of selecting a district. */
  onOpenDish?: (dish: Dish) => void;
  /**
   * Controlled open state. The phone header's 🔍 passes it so search opens as
   * a full-screen sheet — on phones `.intro` (and the inline input inside it)
   * is display:none, so the sheet is the ONLY way to search there.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * The desktop dropdown stops at 7 rows so it never buries the intro; the
 * phone sheet is a full-screen, self-scrolling list and keeps a wider net.
 */
const DROPDOWN_ROWS = 7;
const SHEET_ROWS = 40;

/** Districts with no dish yet — they land on the "শীঘ্রই আসছে" panel, so
 *  they're dimmed in results rather than looking like broken entries. */
function isSoon(hit: SearchHit): boolean {
  return hit.kind === 'district' && !dishesByDistrict[hit.districtId]?.length;
}

/**
 * "জেলা খুঁজুন" — an ARIA 1.2 combobox over districts AND dishes. On desktop the
 * listbox is portaled to document.body via floating-ui so no stacking context
 * can ever cover it; on mobile it's a full-screen search sheet. Keyboard: ↓/↑
 * move, Home/End jump, Enter picks, Esc clears then closes, Tab hands focus
 * on. NFC-normalised, prefix ranked above substring.
 */
export default function DistrictCombo({ onPick, onOpenDish, open: ctlOpen, onOpenChange }: Props) {
  const [q, setQ] = useState('');
  const [innerOpen, setInnerOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMedia(BREAKPOINTS.mobile);
  const hydrated = useHydrated();
  const listId = useId();

  const controlled = ctlOpen !== undefined;
  const open = controlled ? ctlOpen : innerOpen;

  /** Open/close through one door so the controlled and uncontrolled modes
   *  behave identically for every caller (focus, Esc, Tab, pick, ✕). */
  function setOpen(v: boolean) {
    if (controlled) onOpenChange?.(v);
    else setInnerOpen(v);
  }

  /** Closing always parks the highlight back at the top, so reopening never
   *  resumes on a stale row. */
  function close() {
    setOpen(false);
    setHi(0);
  }

  const rows = useMemo(
    () => searchAll(q, isMobile ? SHEET_ROWS : DROPDOWN_ROWS),
    [q, isMobile]
  );

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
    close();
    inputRef.current?.blur();
  }

  /** One row renderer shared by the dropdown and the sheet. */
  function row(hit: SearchHit, i: number) {
    const activate = () => pick(hit);
    const soon = isSoon(hit);
    return (
      <div
        key={`${hit.kind}-${hit.id}`}
        role="option"
        aria-selected={i === hi}
        id={`${listId}-opt-${i}`}
        data-hi={i === hi ? '1' : undefined}
        className={`combo-opt${i === hi ? ' hi' : ''}${soon ? ' dim' : ''}`}
        // desktop fires on mousedown (preventDefault) so the input never
        // blurs and unmounts the listbox before the pick lands; a touch
        // never blurs early, so it uses the ordinary click.
        onMouseDown={
          isMobile
            ? undefined
            : (e) => {
                e.preventDefault();
                activate();
              }
        }
        onClick={isMobile ? activate : undefined}
        onMouseEnter={() => setHi(i)}
      >
        {hit.bn}
        <small>
          {hit.en}
          {hit.kind === 'dish' ? ` · ${districtById[hit.districtId]?.nameBn ?? ''}` : ''}
          {soon ? ' · শীঘ্রই' : ''}
        </small>
      </div>
    );
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
          rows.map((hit, i) => row(hit, i))
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
            aria-expanded={open}
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
          <button
            className="icon-btn"
            aria-label="বন্ধ করো"
            onClick={() => {
              setQ('');
              close();
            }}
          >
            <X className="icon" aria-hidden="true" />
          </button>
        </div>
        <div id={listId} ref={listRef} className="search-results" role="listbox" aria-label="ফলাফল">
          {rows.length === 0 ? (
            <p className="combo-empty">কিছু পাওয়া যায়নি</p>
          ) : (
            rows.map((hit, i) => row(hit, i))
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
    } else if (e.key === 'Home') {
      e.preventDefault();
      setHi(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setHi(Math.max(0, rows.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && rows[hi]) pick(rows[hi]);
    } else if (e.key === 'Escape') {
      // Esc twice: first wipe the query, then close. stopPropagation so
      // FoodMap's global Esc doesn't dismiss an unrelated overlay beneath.
      e.stopPropagation();
      if (q) {
        setQ('');
        setHi(0);
      } else {
        close();
      }
    } else if (e.key === 'Tab') {
      // Tab hands focus on — drop the list so it doesn't chase the caret
      if (open) close();
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
