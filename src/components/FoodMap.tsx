'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { districts, dishesByDistrict, districtById, totalDishes } from '@/lib/data';
import { bn } from '@/lib/format';
import { useProgress } from '@/lib/useProgress';
import { useRatings } from '@/lib/useRatings';
import { getTier } from '@/lib/tiers';
import DistrictPanel from './DistrictPanel';
import MapZone from './MapZone';
import Passport from './Passport';
import Polaroids from './Polaroids';
import SharePanel from './SharePanel';
import { TopModal, TopStrip } from './TopBoard';

type Modal = null | 'top' | 'share';

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
 */
export default function FoodMap() {
  const { eaten, toggle, reset } = useProgress();
  const { ratings, setRating, toggleLove } = useRatings();

  const [selected, setSelected] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [tab, setTab] = useState<'love' | 'over'>('love');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = eaten.size;
  const tier = getTier(count, totalDishes);
  const remaining = totalDishes - count;
  const loveCount = useMemo(
    () => Object.values(ratings).filter((r) => r === 'love').length,
    [ratings]
  );
  // Today's special: the first district you haven't tasted yet — stable across
  // renders and identical on server and client.
  const special = useMemo(() => untasted(eaten)[0]?.id ?? null, [eaten]);

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
      if (e.key === 'Escape') setModal(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /** Confetti petals when something good happens. */
  const burst = useCallback((el: HTMLElement | null) => {
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const colors = ['#E94D2E', '#F6C94C', '#47764A', '#86A889'];
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

  const select = useCallback((id: string) => {
    setSelected((prev) => (prev === id ? null : id));
  }, []);

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
      if (ratings[dishId] !== 'love') burst(el);
      toggleLove(dishId);
    },
    [ratings, toggleLove, burst]
  );

  const selectedDistrict = selected ? districtById[selected] : null;

  return (
    <>
      <div className="desk" aria-hidden="true" />
      <div className="book">
        <span className="leaf one" aria-hidden="true">🌿</span>
        <span className="leaf two" aria-hidden="true">🌱</span>

        <header>
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">🍛</div>
            <div>
              <div className="brand-name">Khabar<span>Book</span></div>
              <div className="tagline">খাবার বুক · Edition 01 · Bangladesh</div>
            </div>
          </div>
          <nav aria-label="Main navigation">
            <button className={modal === null ? 'active' : ''} onClick={() => setModal(null)}>
              🗺️ মানচিত্র
            </button>
            <button
              className={modal === 'top' ? 'active' : ''}
              onClick={() => {
                setTab('love');
                setModal('top');
              }}
            >
              🏆 সেরা
            </button>
            <button className="cta" onClick={() => setModal('share')}>
              📤 শেয়ার
            </button>
          </nav>
        </header>

        <main>
          <section className="intro">
            <div className="eyebrow">খাবারের মানচিত্র</div>
            <h1>তুমি <em>বাংলাদেশের</em> কতটা চেখেছ?</h1>
            <div className="sub">How much of Bangladesh have you tasted?</div>
            <p>প্রতিটি জেলার স্বাদ খুঁজে নাও, রেটিং দাও, আর দেখো তোমার ম্যাপ কতটা ভরল।</p>
          </section>

          <Passport count={count} total={totalDishes} tier={tier} love={loveCount} />

          <MapZone eaten={eaten} selected={selected} onSelect={select} />

          <Polaroids ratings={ratings} onSelect={select} onHeart={heart} />

          <aside className="piece next">
            <h3>📍 এরপর কী?</h3>
            <p>আরও <b>{bn(remaining)}</b>টি খাবার চেখে ম্যাপ ভরে ফেলো!</p>
            <button className="btn" onClick={surprise}>🎲 সারপ্রাইজ</button>
            <button
              className="link"
              onClick={() => {
                if (window.confirm('সব অগ্রগতি মুছে ফেলবে?')) reset();
              }}
            >
              অগ্রগতি রিসেট
            </button>
          </aside>

          <TopStrip onOpen={() => { setTab('love'); setModal('top'); }} />

          <aside className="piece panel">
            <div className="p-label">
              {selectedDistrict
                ? `📍 ${selectedDistrict.nameBn} · ${selectedDistrict.nameEn}`
                : '🔥 আজকের স্পেশাল'}
            </div>
            <DistrictPanel
              districtId={selected ?? special}
              eaten={eaten}
              ratings={ratings}
              onToggle={toggleEat}
              onRate={setRating}
              onSuggest={() => showToast('ধন্যবাদ! সাজেস্ট ফর্ম শীঘ্রই আসবে।')}
            />
          </aside>

          <div className={`toast${toast ? ' show' : ''}`} role="status">
            {toast}
          </div>

          {modal === 'top' && (
            <TopModal tab={tab} onTab={setTab} onClose={() => setModal(null)} />
          )}
          {modal === 'share' && <SharePanel eaten={eaten} onClose={() => setModal(null)} />}
        </main>
      </div>
    </>
  );
}
