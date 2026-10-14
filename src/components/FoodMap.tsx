'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Heart, Info, Map as MapIcon, MoreVertical, PackageOpen,
  RotateCcw, Search, Share2, Shuffle, Sprout, Trophy, Utensils,
} from 'lucide-react';
import { districts, dishes, dishesByDistrict, districtById, paths, totalDishes } from '@/lib/data';
import { bn } from '@/lib/format';
import { DERIVED, PALETTE } from '@/lib/palette';
import { useProgress } from '@/lib/useProgress';
import { useRatings } from '@/lib/useRatings';
import { getTier, getTierIndex, tiers } from '@/lib/tiers';
import { useMedia, BREAKPOINTS } from '@/lib/hooks';
import DistrictPanel from './DistrictPanel';
import MapZone from './MapZone';
import Passport from './Passport';
import Polaroids from './Polaroids';
import Sheet from './Sheet';
import SharePanel from './SharePanel';
import { TopStrip, TopPane } from './TopBoard';
import DishCatalog from './DishCatalog';
import DishModal from './DishModal';
import DistrictCombo from './DistrictCombo';
import MapDishPopup from './MapDishPopup';
import SuggestForm from './SuggestForm';
import { useHydrated } from '@/lib/store';
import { Piece, PrimaryButton, SecondaryButton, StatTile } from './ui';
import type { Dish } from '@/lib/types';

type View = 'map' | 'dishes' | 'top';

/**
 * ONE overlay owner — at most one [role="dialog"] in the DOM at a time.
 * `menu` on ≥768px is a popover (role=menu), not a dialog, but still exclusive.
 */
type Overlay =
  | null
  | { kind: 'menu' }
  | { kind: 'passport' }
  | { kind: 'about' }
  | { kind: 'share' }
  | { kind: 'suggest'; districtId: string | null }
  | { kind: 'reset' }
  | { kind: 'detail'; dish: Dish; source?: 'surprise' | 'map'; returnTo?: Overlay }
  | { kind: 'map'; districtId: string };

/** One URL per tab — refreshing lands you back on the tab you were on. */
const PATHS: Record<View, string> = { map: '/', dishes: '/dishes', top: '/top' };
function viewFromPath(path: string): View {
  if (path.startsWith('/dishes')) return 'dishes';
  if (path.startsWith('/top')) return 'top';
  return 'map';
}

/**
 * The Khabar Book — the whole app on one screen (style guide §1):
 * a paper book on a wooden desk, Bangla first.
 * The map is the hero; short actions are overlays. Desktop (≥1024px & tall
 * enough) never scrolls; below that the page scrolls normally.
 */
export default function FoodMap({ initialView = 'map' }: { initialView?: View }) {
  const { eaten, toggle, reset } = useProgress();
  const { ratings, toggleLove } = useRatings();
  const [selected, setSelected] = useState<string | null>(null);
  // one-shot "মানচিত্রে দেখো" bloom — cleared after the animation finishes
  const [pulseId, setPulseId] = useState<string | null>(null);
  const [view, setView] = useState<View>(initialView);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [toast, setToast] = useState<string | null>(null);
  // phone header 🔍 → forces the search sheet open (the inline input lives in
  // .intro, which is display:none on phones, so the sheet is the only door)
  const [searchOpen, setSearchOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuBtnRef = useRef<HTMLSpanElement>(null);
  const dockMoreRef = useRef<HTMLButtonElement>(null);
  const isMobile = useMedia(BREAKPOINTS.mobile);
  // Closing the map popup's dish card returns to the district popup it
  // opened from (stored in `returnTo`); every other overlay just closes.
  const closeOverlay = useCallback(() => {
    setOverlay((cur) => (cur?.kind === 'detail' && cur.returnTo ? cur.returnTo : null));
  }, []);
  const router = useRouter();
  /**
   * Clicking a dish (catalog card, polaroid, highlight, search hit, board row)
   * opens its full PAGE at /dishes/[slug] — the DishModal card is reserved for
   * Surprise (it needs the in-card re-roll).
   */
  const openDish = useCallback((d: Dish) => router.push(`/dishes/${d.slug}`), [router]);

  // Map popup rows open the dish's CARD (tick & rate) on top of the popup —
  // no navigation away from the map; closing the card returns to the popup.
  const openCard = useCallback(
    (d: Dish) =>
      setOverlay((cur) => ({
        kind: 'detail',
        dish: d,
        source: 'map',
        returnTo: cur?.kind === 'map' ? cur : undefined,
      })),
    []
  );

  const count = eaten.size;
  const tier = getTier(count, totalDishes);
  const remaining = totalDishes - count;
  const loveCount = useMemo(
    () => Object.values(ratings).filter((r) => r.rating === 'love').length,
    [ratings]
  );
  // Dish of the Day: deterministic from the Asia/Dhaka calendar date, so it's
  // the same for everyone on a given day and stable across renders. Independent
  // of progress — the right column is a static featured card, never a popup.
  // Gated on hydration so new Date() never runs during prerender.
  const hydrated = useHydrated();
  const special = useMemo(() => {
    if (!hydrated) return null;
    const day = Math.floor(
      Date.parse(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' }) + 'T00:00:00Z') /
        86400000
    );
    const withFood = districts.filter((d) => (dishesByDistrict[d.id] ?? []).length > 0);
    return withFood[((day % withFood.length) + withFood.length) % withFood.length]?.id ?? null;
  }, [hydrated]);

  const showToast = useCallback((m: string) => {
    setToast(m);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  // Escape closes the single open overlay.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOverlay(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // body scroll lock while an overlay is open (the phone menu is a sheet too)
  useEffect(() => {
    document.body.style.overflow = overlay ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [overlay]);

  // the ⋯ menu closes on any outside press (desktop popover). On phones the
  // menu is the HamburgerDrawer — it has its own backdrop, and presses inside
  // it (or on the dock's আরও trigger) must not close it out from under a click.
  useEffect(() => {
    if (overlay?.kind !== 'menu') return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || typeof t.closest !== 'function') return;
      if (menuBtnRef.current?.contains(t)) return;
      if (dockMoreRef.current?.contains(t)) return;
      if (t.closest('[role="dialog"]')) return;
      setOverlay(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [overlay]);

  /** Shallow tab switch: update the URL without a page navigation, so the
   *  mounted map keeps its state. Back/forward walk through the tabs. */
  const goTo = useCallback((v: View) => {
    setView(v);
    if (window.location.pathname !== PATHS[v]) {
      window.history.pushState(null, '', PATHS[v]);
    }
  }, []);

  useEffect(() => {
    const onPop = () => setView(viewFromPath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /** Confetti petals when something good happens. */
  const burst = useCallback((el: HTMLElement | null) => {
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const colors = [PALETTE.tomato, PALETTE.mango, PALETTE.leaf, DERIVED.leaf2];
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('i');
      const a = (i / 14) * Math.PI * 2;
      const dist = 36 + Math.random() * 34;
      p.className = 'bit';
      p.style.left = `${r.left + r.width / 2}px`;
      p.style.top = `${r.top + r.height / 2}px`;
      p.style.setProperty('--dx', `${Math.cos(a) * dist}px`);
      p.style.setProperty('--dy', `${Math.sin(a) * dist}px`);
      p.style.background = colors[i % colors.length];
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  }, []);

  // Tapping/clicking a district opens the district popup on every breakpoint;
  // the right panel stays the static Dish of the Day.
  const select = useCallback((id: string) => {
    setSelected(id);
    setOverlay({ kind: 'map', districtId: id });
  }, []);

  // Tapping the empty map background clears the selection (map gesture).
  const clearSelection = useCallback(() => {
    setSelected(null);
    setOverlay((cur) => (cur?.kind === 'map' ? null : cur));
  }, []);

  // "মানচিত্রে দেখো" / search "show on map" / ?district= deep link: bloom the
  // district once, then let the class fall off so the pulse can re-fire later.
  const pulse = useCallback((id: string) => {
    setPulseId(null);
    window.setTimeout(() => setPulseId(id), 30);
    window.setTimeout(() => setPulseId(null), 1100);
  }, []);

  // ?district=<id> deep link (shared/searched URLs): land on the map tab with
  // that district selected and pulsed. Read client-side and applied in a
  // timeout so it never blocks prerendering (cacheComponents) and never counts
  // as a synchronous setState in an effect (react-hooks/set-state-in-effect).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('district');
    if (!id || !paths[id]) return;
    const t = window.setTimeout(() => {
      setSelected(id);
      setView('map');
      pulse(id);
    }, 0);
    return () => window.clearTimeout(t);
  }, [pulse]);

  const toggleEat = useCallback(
    (dishId: number, el?: HTMLElement | null) => {
      const wasEaten = eaten.has(dishId);
      toggle(dishId);
      if (wasEaten) return;
      burst(el ?? null);
      const next = getTier(count + 1, totalDishes);
      if (next.bn !== tier.bn) showToast('নতুন ব্যাজ: ' + next.bn + ' 🎉');
    },
    [eaten, toggle, count, tier.bn, burst, showToast]
  );

  const surprise = useCallback(() => {
    const pool = dishes.filter((d) => !eaten.has(d.id));
    if (!pool.length) {
      showToast('সব খাবার চেখে ফেলেছ! 🎉');
      return;
    }
    setOverlay({ kind: 'detail', dish: pool[Math.floor(Math.random() * pool.length)], source: 'surprise' });
  }, [eaten, showToast]);

  // Re-roll inside an open surprise modal — never touches Dish of the Day.
  const reroll = useCallback(() => {
    setOverlay((cur) => {
      if (cur?.kind !== 'detail' || cur.source !== 'surprise') return cur;
      const pool = dishes.filter((d) => !eaten.has(d.id) && d.id !== cur.dish.id);
      if (!pool.length) return cur;
      return { kind: 'detail', dish: pool[Math.floor(Math.random() * pool.length)], source: 'surprise' };
    });
  }, [eaten]);

  const heart = useCallback(
    (dishId: number, el: HTMLElement | null) => {
      if (ratings[dishId]?.rating !== 'love') burst(el);
      toggleLove(dishId);
    },
    [ratings, toggleLove, burst]
  );

  const overlayKind = overlay?.kind ?? null;

  return (
    <>
      <div className="desk" aria-hidden="true" />
      <div className="book">
        <span className="leaf one" aria-hidden="true"><Sprout /></span>

        <header>
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">🍛</div>
            <div>
              <div className="brand-name">Khabar<span>Book</span></div>
              <div className="tagline">খাবার বুক · Edition 01 · Bangladesh</div>
            </div>
          </div>

          {/* desktop nav */}
          <nav aria-label="Main navigation">
            <button
              className={view === 'map' ? 'active' : ''}
              aria-current={view === 'map'}
              onClick={() => goTo('map')}
            >
              <MapIcon className="icon" aria-hidden="true" /> মানচিত্র
            </button>
            <button
              className={view === 'dishes' ? 'active' : ''}
              aria-current={view === 'dishes'}
              onClick={() => goTo('dishes')}
            >
              <BookOpen className="icon" aria-hidden="true" /> খাবার
            </button>
            <button
              className={view === 'top' ? 'active' : ''}
              aria-current={view === 'top'}
              onClick={() => goTo('top')}
            >
              <Trophy className="icon" aria-hidden="true" /> সেরা
            </button>
            <button className="cta" aria-label="শেয়ার" onClick={() => setOverlay({ kind: 'share' })}>
              <Share2 className="icon" aria-hidden="true" />{' '}
              <span className="cta-txt">শেয়ার</span>
            </button>
          </nav>

          {/* phones: search + share only — the hamburger is gone, its menu
              lives in the bottom dock's আরও slot */}
          <div className="mobile-actions" role="group" aria-label="অ্যাকশন">
            <button
              className="icon-btn"
              aria-label="জেলা খুঁজুন"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="icon" aria-hidden="true" />
            </button>
            <button
              className="icon-btn"
              aria-label="শেয়ার"
              onClick={() => setOverlay({ kind: 'share' })}
            >
              <Share2 className="icon" aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className={view === 'map' ? undefined : 'off'}>
          <section className="intro">
            <div className="eyebrow">খাবারের মানচিত্র</div>
            <h1>তুমি <em>বাংলাদেশের</em> কতটা চেখেছ?</h1>
            <div className="sub">How much of Bangladesh have you tasted?</div>
            <p>প্রতিটি জেলার স্বাদ খুঁজে নাও, রেটিং দাও, আর দেখো তোমার ম্যাপ কতটা ভরল।</p>
            <DistrictCombo
              open={searchOpen}
              onOpenChange={setSearchOpen}
              onPick={select}
              onOpenDish={openDish}
            />
          </section>

          <Passport
            count={count}
            total={totalDishes}
            tier={tier}
            love={loveCount}
            onOpen={() => setOverlay({ kind: 'passport' })}
          />

          <MapZone
            eaten={eaten}
            selected={selected}
            onSelect={select}
            sheetOpen={overlayKind === 'map'}
            onClear={clearSelection}
            pulseId={pulseId}
          />

          <Polaroids ratings={ratings} onOpenDish={openDish} onHeart={heart} />

          <Piece className="next" tilt="-2deg">
            <div className="next-h">
              <h2>এরপর কী?</h2>
              <span ref={menuBtnRef} style={{ position: 'relative', display: 'inline-flex' }}>
                <button
                  className="icon-btn"
                  aria-label="আরও অপশন"
                  aria-haspopup="menu"
                  aria-expanded={overlayKind === 'menu'}
                  onClick={() => setOverlay(overlayKind === 'menu' ? null : { kind: 'menu' })}
                >
                  <MoreVertical className="icon" aria-hidden="true" />
                </button>
                {overlayKind === 'menu' && !isMobile && (
                  <div className="menu" role="menu">
                    <button
                      role="menuitem"
                      onClick={() => setOverlay({ kind: 'reset' })}
                    >
                      <RotateCcw className="icon" aria-hidden="true" /> অগ্রগতি রিসেট
                    </button>
                  </div>
                )}
              </span>
            </div>
            <p>আরও <b>{bn(remaining)}</b>টি খাবার চেখে ম্যাপ ভরে ফেলো!</p>
            <PrimaryButton onClick={surprise}>
              <Shuffle className="icon" aria-hidden="true" /> সারপ্রাইজ
            </PrimaryButton>
          </Piece>

          <TopStrip onOpen={() => goTo('top')} />

          <Piece className="panel" tilt={isMobile ? undefined : '1.5deg'}>
            {/* desktop label — the phone flap carries its own mango tab */}
            <div className="p-label">আজকের হাইলাইট 🔥</div>
            <DistrictPanel
              districtId={special}
              eaten={eaten}
              onToggle={toggleEat}
              onOpenDish={openDish}
              onSuggest={() => setOverlay({ kind: 'suggest', districtId: special })}
            />
          </Piece>
        </main>

        {view === 'dishes' && (
          <main className="pane">
            <DishCatalog
              onOpenDish={openDish}
              onSuggest={() => setOverlay({ kind: 'suggest', districtId: null })}
            />
          </main>
        )}

        {view === 'top' && (
          <main className="pane">
            <TopPane
              onOpenDish={openDish}
              onSelect={(id) => {
                select(id);
                goTo('map');
                pulse(id);
              }}
            />
          </main>
        )}

        {/* phones: the bottom dock (display:none ≥768px — desktop keeps nav).
            z-index below the modal/scrim layers, so the raised সারপ্রাইজ can
            never draw on top of the district sheet. */}
        <nav className="dock" aria-label="নিচের নেভিগেশন">
          <button
            className={`dock-btn${view === 'map' ? ' active' : ''}`}
            aria-current={view === 'map' ? 'page' : undefined}
            onClick={() => goTo('map')}
          >
            <MapIcon className="icon" aria-hidden="true" />
            <span>মানচিত্র</span>
          </button>
          <button
            className={`dock-btn${view === 'dishes' ? ' active' : ''}`}
            aria-current={view === 'dishes' ? 'page' : undefined}
            onClick={() => goTo('dishes')}
          >
            <BookOpen className="icon" aria-hidden="true" />
            <span>খাবার</span>
          </button>
          <span className="dock-mid">
            <button className="dock-surprise" aria-label="সারপ্রাইজ" onClick={surprise}>
              <span className="dock-circle">
                <Shuffle className="icon" aria-hidden="true" />
              </span>
              <span className="dock-lbl">সারপ্রাইজ</span>
            </button>
          </span>
          <button
            className={`dock-btn${view === 'top' ? ' active' : ''}`}
            aria-current={view === 'top' ? 'page' : undefined}
            onClick={() => goTo('top')}
          >
            <Trophy className="icon" aria-hidden="true" />
            <span>সেরা</span>
          </button>
          <button
            ref={dockMoreRef}
            className="dock-btn"
            aria-haspopup="dialog"
            aria-expanded={overlayKind === 'menu'}
            onClick={() => setOverlay(overlayKind === 'menu' ? null : { kind: 'menu' })}
          >
            <MoreVertical className="icon" aria-hidden="true" />
            <span>আরও</span>
          </button>
        </nav>

        {/* toast sits at book level so it works from every tab */}
        <div className={`toast${toast ? ' show' : ''}`} role="status">
          {toast}
        </div>

        {/* one overlay at a time */}
        {/* phones: the dock's আরও sheet — reset + about only, never the nav
            (the dock already owns navigation) */}
        {overlay?.kind === 'menu' && isMobile && (
          <Sheet label="মেনু" title="মেনু" onClose={closeOverlay}>
            <button className="menu-row" onClick={() => setOverlay({ kind: 'reset' })}>
              <RotateCcw className="icon" aria-hidden="true" /> অগ্রগতি রিসেট
            </button>
            <button className="menu-row" onClick={() => setOverlay({ kind: 'about' })}>
              <Info className="icon" aria-hidden="true" /> সম্পর্কে
            </button>
          </Sheet>
        )}

        {/* phones: the passport ribbon opens its full sheet (stats, tier
            ladder, share) — the desktop passport card is always visible */}
        {overlay?.kind === 'passport' && (
          <Sheet label="ফুড পাসপোর্ট" title="তোমার ফুড পাসপোর্ট" onClose={closeOverlay} className="pass-sheet">
            <div className="stats">
              <StatTile value={bn(count)} label="চেখেছি" icon={<Utensils aria-hidden="true" />} />
              <StatTile value={bn(remaining)} label="বাকি" icon={<PackageOpen aria-hidden="true" />} />
              <StatTile value={bn(loveCount)} label="দারুণ" icon={<Heart aria-hidden="true" />} />
            </div>
            <ul className="tier-list">
              {tiers.map((t, i) => {
                const on = i === getTierIndex(count, totalDishes);
                return (
                  <li key={t.bn} className={on ? 'on' : undefined}>
                    <b>{t.bn}</b>
                    <span>{bn(Math.round(t.min * totalDishes))}টি+</span>
                  </li>
                );
              })}
            </ul>
            <PrimaryButton onClick={() => setOverlay({ kind: 'share' })}>
              <Share2 className="icon" aria-hidden="true" /> শেয়ার করো
            </PrimaryButton>
          </Sheet>
        )}

        {overlay?.kind === 'about' && (
          <Sheet label="সম্পর্কে" title="সম্পর্কে" onClose={closeOverlay}>
            <p className="note big">
              খাবার বুক — বাংলাদেশের ৬৪ জেলার খাবারের মানচিত্র। যা চেখেছ তা মানচিত্রে
              দাগাও, রেটিং দাও, আর তোমার ফুড জার্নাল বন্ধুদের সঙ্গে শেয়ার করো।
            </p>
            <p className="note">Edition 01 · খাবারের তথ্য ডেমো।</p>
          </Sheet>
        )}

        {overlay?.kind === 'detail' && (
          <DishModal
            dish={overlay.dish}
            onClose={closeOverlay}
            onShowOnMap={(id) => {
              setOverlay(null);
              select(id);
              goTo('map');
              pulse(id);
            }}
            onReroll={overlay.source === 'surprise' ? reroll : undefined}
            surprise={overlay.source === 'surprise'}
            rate={overlay.source === 'map'}
          />
        )}

        {overlay?.kind === 'share' && <SharePanel eaten={eaten} onClose={closeOverlay} />}

        {overlay?.kind === 'map' && (
          <MapDishPopup
            districtId={overlay.districtId}
            eaten={eaten}
            onOpenDish={openCard}
            onSuggest={() => setOverlay({ kind: 'suggest', districtId: overlay.districtId })}
            onClose={closeOverlay}
          />
        )}

        {overlay?.kind === 'suggest' && (
          <Sheet label="খাবার পরামর্শ দাও" title="খাবার পরামর্শ দাও" onClose={closeOverlay}>
            <p className="note">
              {overlay.districtId
                ? `${districtById[overlay.districtId]?.nameBn} জেলার জন্য`
                : 'বইয়ের যেকোনো জেলার জন্য'}
            </p>
            <SuggestForm
              key={overlay.districtId ?? 'any'}
              districtId={overlay.districtId ?? undefined}
              standalone
            />
          </Sheet>
        )}

        {overlay?.kind === 'reset' && (
          <Sheet label="অগ্রগতি রিসেট করবে?" title="অগ্রগতি মুছে ফেলবে?" onClose={closeOverlay}>
            <p className="note big">
              তোমার {bn(count)}টি চেখে ফেওয়ার খাবার আর রেটিং মুছে যাবে। এটা ফেরানো যাবে না।
            </p>
            <div className="acts">
              <PrimaryButton
                onClick={() => {
                  closeOverlay();
                  reset();
                  showToast('অগ্রগতি মুছে ফেলা হয়েছ');
                }}
              >
                হ্যাঁ, মুছে ফেলো
              </PrimaryButton>
              <SecondaryButton onClick={closeOverlay}>না, থাক</SecondaryButton>
            </div>
          </Sheet>
        )}
      </div>
    </>
  );
}
