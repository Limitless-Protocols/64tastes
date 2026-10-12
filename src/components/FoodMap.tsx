'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Map as MapIcon, MoreVertical, RotateCcw, Share2, Shuffle, Sprout, Trophy, X } from 'lucide-react';
import { districts, dishesByDistrict, districtById, totalDishes } from '@/lib/data';
import { bn } from '@/lib/format';
import { DERIVED, PALETTE } from '@/lib/palette';
import { useProgress } from '@/lib/useProgress';
import { useRatings } from '@/lib/useRatings';
import { useTopData } from '@/lib/useTopData';
import { getTier } from '@/lib/tiers';
import DistrictPanel from './DistrictPanel';
import MapZone from './MapZone';
import Passport from './Passport';
import Polaroids from './Polaroids';
import SharePanel from './SharePanel';
import { TopStrip, TopPane } from './TopBoard';
import DishCatalog from './DishCatalog';
import DishModal from './DishModal';
import DistrictCombo from './DistrictCombo';
import DistrictSheet from './DistrictSheet';
import SuggestForm from './SuggestForm';
import { usePlacePicks } from '@/lib/usePlacePicks';
import { Piece, PrimaryButton, SecondaryButton } from './ui';
import type { Dish } from '@/lib/types';

type Modal = null | 'share' | 'suggest';
type View = 'map' | 'dishes' | 'top';

/** One URL per tab — refreshing lands you back on the tab you were on. */
const PATHS: Record<View, string> = { map: '/', dishes: '/khabar', top: '/sera' };
function viewFromPath(path: string): View {
  if (path.startsWith('/khabar')) return 'dishes';
  if (path.startsWith('/sera')) return 'top';
  return 'map';
}

/** Districts whose food you haven't finished tasting (today: one dish each). */
function untasted(eaten: Set<number>) {
  return districts.filter((d) => {
    const list = dishesByDistrict[d.id] ?? [];
    return list.length > 0 && !list.every((x) => eaten.has(x.id));
  });
}

/**
 * The Khabar Book — the whole app on one screen (style guide §1):
 * a paper book on a wooden desk, never scrolling, Bangla first.
 * The map is the hero (~56% of the width); short actions are modals.
 */
export default function FoodMap({ initialView = 'map' }: { initialView?: View }) {
  const { eaten, toggle, reset } = useProgress();
  const { ratings, rate, toggleLove, toggleOverrated } = useRatings();
  const { picks, pick } = usePlacePicks();
  const top = useTopData();
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<View>(initialView);
  const [modal, setModal] = useState<Modal>(null);
  const [dish, setDish] = useState<Dish | null>(null);
  const [sheet, setSheet] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  // suggest modal target: null = unlocked (district dropdown, catalog entry);
  // a district id = locked (map panel entry, defaults to today's special)
  const [suggestFrom, setSuggestFrom] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const count = eaten.size;
  const tier = getTier(count, totalDishes);
  const remaining = totalDishes - count;
  const loveCount = useMemo(
    () => Object.values(ratings).filter((r) => r.rating === 'love').length,
    [ratings]
  );
  // Today's special: the first district you haven't tasted yet — stable across
  // renders and identical on server and client.
  const special = useMemo(() => untasted(eaten)[0]?.id ?? null, [eaten]);

  // "% দারুণ" for the panel's dish — only from the real board, never demo data.
  const panelDishId = useMemo(() => {
    const id = selected ?? special;
    return id ? (dishesByDistrict[id] ?? [])[0]?.id : undefined;
  }, [selected, special]);
  const lovePct = useMemo(() => {
    if (panelDishId == null || !top || top.empty) return null;
    return top.mostLoved.find((r) => r.id === panelDishId)?.pct ?? null;
  }, [top, panelDishId]);

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

  // Escape closes any open modal (prototype behaviour).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModal(null);
        setDish(null);
        setMenu(false);
        setConfirmReset(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // the ⋯ menu closes on any outside press
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menu]);

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

  const select = useCallback(
    (id: string) => {
      const next = selected === id ? null : id;
      setSelected(next);
      // phones: tapping a district also opens the slide-up sheet
      if (window.matchMedia('(max-width:760px)').matches) setSheet(next);
    },
    [selected]
  );

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
    const pool = untasted(eaten);
    if (!pool.length) {
      showToast('সব খাবার চেখে ফেলেছ! 🎉');
      return;
    }
    setModal(null);
    select(pool[Math.floor(Math.random() * pool.length)].id);
  }, [eaten, select, showToast]);

  const heart = useCallback(
    (dishId: number, el: HTMLElement | null) => {
      if (ratings[dishId]?.rating !== 'love') burst(el);
      toggleLove(dishId);
    },
    [ratings, toggleLove, burst]
  );

  const selectedDistrict = selected ? districtById[selected] : null;

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
            <button className="cta" aria-label="শেয়ার" onClick={() => setModal('share')}>
              <Share2 className="icon" aria-hidden="true" />{' '}
              <span className="cta-txt">শেয়ার</span>
            </button>
          </nav>
        </header>

        <main className={view === 'map' ? undefined : 'off'}>
          <section className="intro">
            <div className="eyebrow">খাবারের মানচিত্র</div>
            <h1>তুমি <em>বাংলাদেশের</em> কতটা চেখেছ?</h1>
            <div className="sub">How much of Bangladesh have you tasted?</div>
            <p>প্রতিটি জেলার স্বাদ খুঁজে নাও, রেটিং দাও, আর দেখো তোমার ম্যাপ কতটা ভরল।</p>
            <DistrictCombo onPick={select} />
          </section>

          <Passport count={count} total={totalDishes} tier={tier} love={loveCount} />

          <MapZone eaten={eaten} selected={selected} onSelect={select} />

          <Polaroids ratings={ratings} onSelect={select} onHeart={heart} />

          <Piece className="next" tilt="-2deg">
            <div className="next-h">
              <h2>এরপর কী?</h2>
              <span ref={menuRef} style={{ position: 'relative', display: 'inline-flex' }}>
                <button
                  className="icon-btn"
                  aria-label="আরও অপশন"
                  aria-haspopup="menu"
                  aria-expanded={menu}
                  onClick={() => setMenu((m) => !m)}
                >
                  <MoreVertical className="icon" aria-hidden="true" />
                </button>
                {menu && (
                  <div className="menu" role="menu">
                    <button
                      role="menuitem"
                      onClick={() => {
                        setMenu(false);
                        setConfirmReset(true);
                      }}
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

          <Piece className="panel" tilt="1.5deg">
            <div className="p-label">
              {selectedDistrict
                ? `📍 ${selectedDistrict.nameBn} · ${selectedDistrict.nameEn}`
                : 'আজকের স্পেশাল'}
            </div>
            <DistrictPanel
              districtId={selected ?? special}
              eaten={eaten}
              ratings={ratings}
              places={picks}
              lovePct={lovePct}
              onToggle={toggleEat}
              onRate={rate}
              onOverrate={toggleOverrated}
              onPlace={pick}
              onSuggest={() => {
                setSuggestFrom(selected ?? special);
                setModal('suggest');
              }}
            />
          </Piece>
        </main>

        {view === 'dishes' && (
          <main className="pane">
            <DishCatalog
              onOpenDish={setDish}
              onSuggest={() => {
                setSuggestFrom(null);
                setModal('suggest');
              }}
            />
          </main>
        )}

        {view === 'top' && (
          <main className="pane">
            <TopPane
              onOpenDish={setDish}
              onSelect={(id) => {
                select(id);
                goTo('map');
              }}
            />
          </main>
        )}

        {/* toast + modals sit at book level so they work from every tab */}
        <div className={`toast${toast ? ' show' : ''}`} role="status">
          {toast}
        </div>

        {dish && (
          <DishModal
            dish={dish}
            onClose={() => setDish(null)}
            onShowOnMap={(id) => {
              setDish(null);
              select(id);
              goTo('map');
            }}
          />
        )}

        {modal === 'share' && <SharePanel eaten={eaten} onClose={() => setModal(null)} />}
        {modal === 'suggest' && (
          <div
            className="mb"
            role="dialog"
            aria-modal="true"
            aria-label="খাবার পরামর্শ দাও"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setModal(null);
            }}
          >
            <div className="modal">
              <h2>
                খাবার পরামর্শ দাও
                <button className="x" onClick={() => setModal(null)} aria-label="বন্ধ করো">
                  <X className="icon" aria-hidden="true" />
                </button>
              </h2>
              <p className="note">
                {suggestFrom
                  ? `${districtById[suggestFrom]?.nameBn} জেলার জন্য`
                  : 'বইয়ের যেকোনো জেলার জন্য'}
              </p>
              <SuggestForm key={suggestFrom ?? 'any'} districtId={suggestFrom ?? undefined} standalone />
            </div>
          </div>
        )}

        {confirmReset && (
          <div
            className="mb"
            role="dialog"
            aria-modal="true"
            aria-label="অগ্রগতি রিসেট করবে?"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setConfirmReset(false);
            }}
          >
            <div className="modal">
              <h2>
                অগ্রগতি মুছে ফেলবে?
                <button className="x" onClick={() => setConfirmReset(false)} aria-label="বন্ধ করো">
                  <X className="icon" aria-hidden="true" />
                </button>
              </h2>
              <p className="note big">
                তোমার {bn(count)}টি চেখে ফেওয়ার খাবার আর রেটিং মুছে যাবে। এটা ফেরানো যাবে না।
              </p>
              <div className="acts">
                <PrimaryButton
                  onClick={() => {
                    setConfirmReset(false);
                    reset();
                    showToast('অগ্রগতি মুছে ফেলা হয়েছ');
                  }}
                >
                  হ্যাঁ, মুছে ফেলো
                </PrimaryButton>
                <SecondaryButton onClick={() => setConfirmReset(false)}>না, থাক</SecondaryButton>
              </div>
            </div>
          </div>
        )}

        {sheet && (
          <DistrictSheet
            districtId={sheet}
            eaten={eaten}
            ratings={ratings}
            places={picks}
            onToggle={toggleEat}
            onRate={rate}
            onPlace={pick}
            onClose={() => setSheet(null)}
          />
        )}
      </div>
    </>
  );
}
