'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { bn } from '@/lib/format';

export type FoodGuideStop = {
  id: string;
  districtId: string;
  district: string;
  districtBn: string;
  division: string;
  dishId: number;
  slug: string;
  dish: string;
  dishBn: string;
  spotId: string;
  spot: string;
  picks: number;
};

const DIVISIONS: Record<string, string> = {
  barishal: 'বরিশাল',
  chattogram: 'চট্টগ্রাম',
  dhaka: 'ঢাকা',
  khulna: 'খুলনা',
  rajshahi: 'রাজশাহী',
  rangpur: 'রংপুর',
  sylhet: 'সিলেট',
  mymensingh: 'ময়মনসিংহ',
};

function mapsUrl(stop: FoodGuideStop) {
  const query = `${stop.spot}, ${stop.district}, Bangladesh`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default function FoodGuide({ stops, totalDistricts }: { stops: FoodGuideStop[]; totalDistricts: string }) {
  const [division, setDivision] = useState('all');
  const [selectedId, setSelectedId] = useState(stops[0]?.id ?? '');
  const divisions = useMemo(() => [...new Set(stops.map((stop) => stop.division))], [stops]);
  const visibleStops = useMemo(
    () => division === 'all' ? stops : stops.filter((stop) => stop.division === division),
    [division, stops]
  );
  const selected = visibleStops.find((stop) => stop.id === selectedId) ?? visibleStops[0];

  function cycleStop(direction: number) {
    if (visibleStops.length < 2 || !selected) return;
    const currentIndex = visibleStops.findIndex((stop) => stop.id === selected.id);
    const nextIndex = (currentIndex + direction + visibleStops.length) % visibleStops.length;
    setSelectedId(visibleStops[nextIndex].id);
  }

  return (
    <div className="food-guide">
      <Link href="/" className="guide-back">← মানচিত্রে ফিরি</Link>

      <header className="guide-hero">
        <span className="guide-kicker"><i /> COMMUNITY FOOD TRAIL</span>
        <h1>স্বাদের পথে<br /><em>বেরিয়ে পড়ো।</em></h1>
        <p>জেলা ধরে এগোও, মানুষের পছন্দের খাবার চেখে দেখো, আর প্রতিটি থামার জায়গা Google Maps-এ খুঁজে নাও।</p>
        <div className="guide-summary">
          <span><b>{bn(stops.length)}</b> খাবারের স্টপ</span>
          <span><b>{totalDistricts}</b> জেলা</span>
          <span><b>{bn(divisions.length)}</b> বিভাগ</span>
        </div>
      </header>

      {stops.length === 0 ? (
        <section className="guide-empty">
          <span aria-hidden="true">📍</span>
          <h2>পথটা এখনো তৈরি হচ্ছে</h2>
          <p>কোনো খাবারের জায়গা এখনও পর্যাপ্ত কমিউনিটি ভোট পেয়ে অনুমোদিত হয়নি। খাবার রেট করে জায়গার নাম যোগ করলে এই পথে স্টপ তৈরি হবে।</p>
          <Link href="/" className="guide-primary-link">মানচিত্রে খাবার খুঁজে দেখো <span aria-hidden="true">→</span></Link>
        </section>
      ) : (
        <>
          <nav className="guide-filters" aria-label="বিভাগ বেছে নাও">
            <button type="button" className={division === 'all' ? 'is-active' : ''} onClick={() => setDivision('all')}>সব পথ</button>
            {divisions.map((id) => (
              <button key={id} type="button" className={division === id ? 'is-active' : ''} onClick={() => setDivision(id)}>
                {DIVISIONS[id] ?? id}
              </button>
            ))}
          </nav>

          <div className="guide-layout">
            {selected && (
              <section className="guide-detail" aria-live="polite" aria-label="নির্বাচিত খাবারের স্টপ">
                <div className="guide-detail-top">
                  <span>তোমার পরের স্টপ</span>
                  <span>{bn(visibleStops.findIndex((stop) => stop.id === selected.id) + 1)} / {bn(visibleStops.length)}</span>
                </div>
                <div className="guide-map-mark" aria-hidden="true"><span>✳</span></div>
                <p className="guide-district">{selected.districtBn} · {DIVISIONS[selected.division] ?? selected.division}</p>
                <h2>{selected.dishBn}</h2>
                <p className="guide-dish-en">{selected.dish}</p>
                <div className="guide-spot-box">
                  <span className="guide-pin" aria-hidden="true">📍</span>
                  <div>
                    <small>COMMUNITY TOP SPOT</small>
                    <strong>{selected.spot}</strong>
                    <span>{bn(selected.picks)} জন খাবারপ্রেমী এই জায়গাটি বেছে নিয়েছেন</span>
                  </div>
                </div>
                <div className="guide-actions">
                  <a className="guide-map-link" href={mapsUrl(selected)} target="_blank" rel="noreferrer">
                    <span aria-hidden="true">↗</span> Google Maps-এ দেখো
                  </a>
                  <Link className="guide-dish-link" href={`/dish/${selected.slug}`}>খাবার সম্পর্কে <span aria-hidden="true">→</span></Link>
                </div>
                <div className="guide-step-controls">
                  <button type="button" onClick={() => cycleStop(-1)} disabled={visibleStops.length < 2}>← আগের স্টপ</button>
                  <button type="button" onClick={() => cycleStop(1)} disabled={visibleStops.length < 2}>পরের স্টপ →</button>
                </div>
                <p className="guide-map-note">স্টপগুলো বিভাগ ও জেলার ক্রমে সাজানো; Google Maps-এ সঠিক জায়গাটি বেছে নাও।</p>
              </section>
            )}

            <section className="guide-route" aria-label="খাবারের ট্রেইল স্টপগুলো">
              <div className="guide-route-heading">
                <div><span>THE TRAIL</span><h2>পথের স্টপগুলো</h2></div>
                <span>{bn(visibleStops.length)}টি</span>
              </div>
              <ol className="guide-stop-list">
                {visibleStops.map((stop, index) => (
                  <li key={stop.id}>
                    <button type="button" onClick={() => setSelectedId(stop.id)} className={`guide-stop ${selected?.id === stop.id ? 'is-selected' : ''}`} aria-current={selected?.id === stop.id ? 'step' : undefined}>
                      <span className="guide-stop-number">{bn(index + 1)}</span>
                      <span className="guide-stop-copy">
                        <span className="guide-stop-district">{stop.districtBn} <i>·</i> {DIVISIONS[stop.division] ?? stop.division}</span>
                        <strong>{stop.dishBn}</strong>
                        <span className="guide-stop-spot">📍 {stop.spot}</span>
                      </span>
                      <span className="guide-stop-votes">{bn(stop.picks)}<small> picks</small></span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
