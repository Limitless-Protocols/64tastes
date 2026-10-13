'use client';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { districts, paths, viewBox, totalDishes, dishes, districtById } from '@/lib/data';
import { useProgress } from '@/lib/useProgress';
import { getTier } from '@/lib/tiers';
import { districtTone, type DistrictTone } from '@/lib/colors';
import DistrictSheet from './DistrictSheet';
import SharePanel from './SharePanel';
import Link from 'next/link';
import { usePlacePicks } from '@/lib/usePlacePicks';
import { useRatings } from '@/lib/useRatings';
import { bn } from '@/lib/format';

const FILLS: Record<DistrictTone, { base: string; selected: string }> = {
  empty: { base: 'tone-empty', selected: 'tone-empty' },
  new: { base: 'tone-new', selected: 'tone-new' },
  partial: { base: 'tone-partial', selected: 'tone-partial' },
  complete: { base: 'tone-complete', selected: 'tone-complete' },
};

export default function FoodMap() {
  const { eaten, toggle, reset } = useProgress();
  const { ratings, rate } = useRatings();
  const { picks, pick, clearLocal } = usePlacePicks();
  const [selected, setSelected] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const count = eaten.size;
  const tier = getTier(count, totalDishes);
  const pct = totalDishes ? Math.round((count / totalDishes) * 100) : 0;
  const nextDish = useMemo(() => dishes.find((d) => !eaten.has(d.id)), [eaten]);
  const spotlights = [dishes[0], dishes.find((d) => d.slug === 'cumilla-roshmalai'), dishes.find((d) => d.slug === 'moulvibazar-seven-color-tea')].filter(Boolean);

  function handleToggle(id: number) {
    if (eaten.has(id)) {
      if (ratings[id]) rate(id, null);
      clearLocal(id);
    }
    toggle(id);
  }

  function fillOf(districtId: string) {
    return FILLS[districtTone(districtId, eaten)];
  }

  function surprise() {
    const remaining = dishes.filter((d) => !eaten.has(d.id));
    if (!remaining.length) return;
    const dish = remaining[Math.floor(Math.random() * remaining.length)];
    setSelected(dish.districtId);
  }

  function nextDistrict() {
    if (!selected) return;
    const current = districts.findIndex((district) => district.id === selected);
    setSelected(districts[(current + 1) % districts.length].id);
  }

  return (
    <div className="food-app">
      <div className="book-frame">
        <header className="site-header bg-[#827148]">
          <Link className="brand-lockup" href="/" aria-label="Khabar Book home">
            <span><strong>64<span>Tastes</span></strong><small>64 Tastes · Edition 01 · Bangladesh</small></span>
          </Link>
          <nav className="site-nav" aria-label="Main navigation">
            <a className="nav-current" href="#map">মানচিত্র</a>
            <Link href="/top">সেরা খাবার</Link>
            <button className="nav-share" onClick={() => setShowShare(true)}><span aria-hidden="true">➤</span> শেয়ার</button>
          </nav>
        </header>

        <main className="food-dashboard">
          <section className="intro-card">
            <span className="eyebrow"><i /> বাংলাদেশ ঘুরি স্বাদের সন্ধানে</span>
            <h1>দেশের স্বাদ,<br /><em>তোমার গল্প।</em></h1>
            <p className="intro-english">How much of Bangladesh have you tasted?</p>
            <p>৬৪ জেলার পরিচিত স্বাদ ঘুরে দেখো। যেগুলো চেখেছ, সেগুলো যোগ করো তোমার নিজের খাবারের মানচিত্রে।</p>
          </section>

          <aside className="passport card-piece" aria-label="Your food passport">
            <div className="passport-title"><span className="passport-icon">✳</span><span>তোমার ফুড পাসপোর্ট</span><span className="passport-edition">খাবার বুক · ০১</span></div>
            <div className="passport-progress">
              <div className="progress-ring" style={{ '--progress': `${pct}%` } as React.CSSProperties}><span>{pct}<small>%</small></span></div>
              <div><b className="passport-count">{count}<small> / {totalDishes}</small></b><strong>{tier.bn}</strong><em>{tier.en}</em></div>
            </div>
            <div className="passport-bar"><span style={{ width: `${pct}%` }} /></div>
          </aside>

          <section className="map-stage" id="map" aria-label="Explore Bangladesh by district">
            <div className="map-poster">
              <div className="lotus-clip" aria-hidden="true">
                <Image
                  className="map-lotus"
                  src="/Lotus.svg"
                  alt=""
                  width={317}
                  height={317}
                />
              </div>
              <div className="poster-heading">
                <div><span>বাংলাদেশ খাবার মানচিত্র</span><strong>স্বাদের বাংলাদেশ</strong></div>
                <div className="poster-count"><b>{bn(count)}</b><span>/{bn(totalDishes)}<small>খাবার</small></span></div>
              </div>
              <svg viewBox={viewBox} className="district-map" role="group" aria-label="Map of Bangladesh districts">
                {districts.map((d, i) => (
                  <path key={d.id} d={paths[d.id]} vectorEffect="non-scaling-stroke"
                    className={`district-shape ${fillOf(d.id).base} ${selected === d.id ? 'district-selected' : ''}`}
                    style={{ '--cell-delay': `${Math.min(i * 8, 320)}ms` } as React.CSSProperties}
                    role="button" tabIndex={0} aria-label={d.nameEn} aria-pressed={selected === d.id}
                    onClick={() => setSelected(d.id)} onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(d.id); }
                    }} />
                ))}
              </svg>
              <div className="poster-signature"><span>64 Tastes</span><i /> <span>৬৪ জেলা · BANGLADESH</span></div>
            </div>
            <div className="map-legend"><span><i className="legend-dot tasted" /> চেখেছি</span><span><i className="legend-dot waiting" /> খাওয়ার অপেক্ষায়</span><span><i className="legend-dot empty" /> অজানা</span></div>
          </section>

          <section className="share-banner">
            <span className="share-symbol" aria-hidden="true">➤</span>
            <div><strong>স্বাদের গল্পটা শেয়ার করো</strong><small>তোমার মানচিত্র শেয়ার বন্ধুদের সাথে</small></div>
            <button onClick={() => setShowShare(true)}>কার্ড বানাও <span aria-hidden="true">→</span></button>
          </section>

          <section className="dish-postcards" aria-label="Taste of Bangladesh">
            <div className="dish-section-heading"><div><span className="section-kicker">জেলা ধরে ঘুরে দেখো</span><h2>কোথা থেকে শুরু করবে?</h2></div><Link href="/top">র‍্যাঙ্কিং <span aria-hidden="true">↗</span></Link></div>
            {spotlights.map((dish, i) => dish && <button className={`dish-postcard postcard-${i + 1}`} key={dish.id} onClick={() => setSelected(dish.districtId)}>
              <span className="dish-art" aria-hidden="true">{dish.category === 'drink' ? '🍵' : dish.category === 'savory' || dish.category === 'main' ? '🍲' : '🍮'}</span>
              <strong>{dish.nameBn}</strong><small>{districtById[dish.districtId]?.nameBn} · {dish.nameEn}</small>
            </button>)}
          </section>

          <aside className="next-card card-piece">
            <span className="section-kicker">তোমার পরের কামড়</span>
            {nextDish ? <><p>পরের স্বাদ হতে পারে <b>{nextDish.nameBn}</b>!</p><button className="primary-button" onClick={surprise}>🎲 সারপ্রাইজ দাও</button></> : <><p>দারুণ! সব খাবার চেখে দেখেছ।</p><button className="primary-button" onClick={() => { if (confirm('Reset all progress?')) reset(); }}>আবার শুরু করো</button></>}
          </aside>

          <footer className="home-footer"><span>Map data: geoBoundaries</span></footer>
        </main>
      </div>

      {selected && <DistrictSheet districtId={selected} eaten={eaten} ratings={ratings} places={picks} onToggle={handleToggle} onRate={rate} onPlace={pick} onNext={nextDistrict} onClose={() => setSelected(null)} />}
      {showShare && <SharePanel eaten={eaten} onClose={() => setShowShare(false)} />}
    </div>
  );
}
