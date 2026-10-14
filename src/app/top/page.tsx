import { Suspense } from 'react';
import Link from 'next/link';
import { getDishStats } from '@/lib/stats';
import { buildRankings, MIN_VOTES } from '@/lib/ranking';
import { districtById } from '@/lib/data';
import { bn } from '@/lib/format';

export const metadata = { title: 'সেরা খাবার — Bangladesh Food Map' };

const ART: Record<string, string> = { drink: '🍵', savory: '🍲', main: '🍲' };
const artOf = (category: string) => ART[category] ?? '🍮';

export default function TopPage() {
  return (
    <div className="food-app">
      <div className="book-frame">
        <header className="site-header bg-[#827148]">
          <Link className="brand-lockup" href="/" aria-label="Khabar Book home">
            <span><strong>64<span>Tastes</span></strong><small>One Bangladesh, 64 different tastes</small></span>
          </Link>
          <nav className="site-nav" aria-label="Main navigation">
            <Link href="/">মানচিত্র</Link>
            <span className="nav-current">সেরা খাবার</span>
          </nav>
        </header>

        <main className="food-dashboard top-dashboard">
          <section className="intro-card">
            <span className="eyebrow"><i/> বাংলাদেশ ঘুরি স্বাদের সন্ধানে</span>
            <h1>সেরা খাবার,<br /><em>ভোটের ভিত্তিতে।</em></h1>
            <p className="intro-english">The most loved — and most overrated — tastes of Bangladesh</p>
            <p>যে খাবার সবাই পছন্দ করেছে, আর যেটাকে ওভাররেটেড বলা হয়েছে — সব এক জায়গায়। খাতা খুলে রাখো, পরের ঘোরে কাজে লাগবে।</p>
          </section>

          <Suspense fallback={<p className="top-loading">লোড হচ্ছে…</p>}>
            <Rankings />
          </Suspense>

          <section className="share-banner top-cta">
            <span className="share-symbol" aria-hidden="true">➤</span>
            <div><strong>ম্যাপে ফিরে যাও</strong><small>নিজের খাবারের তালিকা বানাও আর রেটিং দাও</small></div>
            <Link href="/" className="top-cta-button">মানচিত্র <span aria-hidden="true">→</span></Link>
          </section>

          <footer className="home-footer">
            <span>Map data: geoBoundaries</span>
            <span>৬৪ জেলা · BANGLADESH</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

const pctNum = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);
const pct = (part: number, total: number) => bn(pctNum(part, total));

async function Rankings() {
  const { mostLoved, mostOverrated, districtRows } = buildRankings(await getDishStats());

  if (mostLoved.length === 0 && districtRows.length === 0) {
    return (
      <section className="card-piece top-empty">
        <span className="section-kicker">এখনো শুরু হয়নি</span>
        <p>এখনও যথেষ্ট ভোট জমেনি। তালিকা দেখাতে প্রতিটি খাবারে কমপক্ষে {bn(MIN_VOTES)}টি ভোট লাগবে।</p>
      </section>
    );
  }

  return (
    <div className="rank-column">
      <section className="card-piece rank-card rank-loved">
        <div className="rank-heading">
          <div><span className="section-kicker">সবচেয়ে পছন্দের</span><h2>😍 সবার প্রিয় খাবার</h2></div>
          <span className="rank-tag">{bn(mostLoved.length)}টি</span>
        </div>
        <ol className="rank-list">
          {mostLoved.map((r, i) => (
            <li key={r.dish.id}>
              <Link href={`/dish/${r.dish.slug}`} className="rank-row">
                <span className="rank-num">{bn(i + 1)}</span>
                <span className="rank-art" aria-hidden="true">{artOf(r.dish.category)}</span>
                <span className="rank-body">
                  <strong>{r.dish.nameBn}</strong>
                  <small>{districtById[r.dish.districtId]?.nameBn} · {r.dish.nameEn}</small>
                </span>
                <span className="rank-score">
                  <b>{pct(r.stat.loved, r.stat.votes)}%</b>
                  <span className="rank-bar"><span style={{ width: `${pctNum(r.stat.loved, r.stat.votes)}%` }} /></span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {mostOverrated.length > 0 && (
        <section className="card-piece rank-card rank-over">
          <div className="rank-heading">
            <div><span className="section-kicker">সবচেয়ে ওভাররেটেড</span><h2>🙄 যতটা ভাবা হয়েছিল, তার চেয়ে কম</h2></div>
            <span className="rank-tag">{bn(mostOverrated.length)}টি</span>
          </div>
          <ol className="rank-list">
            {mostOverrated.map((r, i) => (
              <li key={r.dish.id}>
                <Link href={`/dish/${r.dish.slug}`} className="rank-row">
                  <span className="rank-num">{bn(i + 1)}</span>
                  <span className="rank-art" aria-hidden="true">{artOf(r.dish.category)}</span>
                  <span className="rank-body">
                    <strong>{r.dish.nameBn}</strong>
                    <small>{districtById[r.dish.districtId]?.nameBn} · {r.dish.nameEn}</small>
                  </span>
                  <span className="rank-score">
                    <b>{pct(r.stat.overrated, r.stat.votes)}%</b>
                    <span className="rank-bar"><span style={{ width: `${pctNum(r.stat.overrated, r.stat.votes)}%` }} /></span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {districtRows.length > 0 && (
        <section className="card-piece rank-card rank-district">
          <div className="rank-heading">
            <div><span className="section-kicker">সেরা খাবারের জেলা</span><h2>🏆 জেলা ধরে স্বাদের র‍্যাঙ্কিং</h2></div>
            <span className="rank-tag">{bn(districtRows.length)}টি</span>
          </div>
          <ol className="rank-list">
            {districtRows.map((r, i) => (
              <li key={r.district.id}>
                <div className="rank-row">
                  <span className="rank-num">{bn(i + 1)}</span>
                  <span className="rank-art" aria-hidden="true">📍</span>
                  <span className="rank-body">
                    <strong>{r.district.nameBn}</strong>
                    <small>{r.district.nameEn} · {r.district.division}</small>
                  </span>
                  <span className="rank-score">
                    <b>{pct(r.loved, r.votes)}%</b>
                    <span className="rank-bar"><span style={{ width: `${pctNum(r.loved, r.votes)}%` }} /></span>
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
