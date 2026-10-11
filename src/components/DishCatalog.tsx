'use client';
import { useState } from 'react';
import { districtById, districts, dishes, dishesByDistrict, totalDishes } from '@/lib/data';
import { bn } from '@/lib/format';
import type { Dish } from '@/lib/types';
import PhotoSlot from './PhotoSlot';

type Props = {
  /** Dish cards open the detail modal (no map jump from this tab). */
  onOpenDish: (dish: Dish) => void;
  onSuggest: () => void;
};

/**
 * The খাবার tab: every dish in the book as one flat grid of vertical cards —
 * big square image on top, dish name + district underneath. Search matches
 * dish OR district names (Bangla or English); the dropdown narrows to a
 * single district. Picking a card opens the dish detail modal.
 */
export default function DishCatalog({ onOpenDish, onSuggest }: Props) {
  const [q, setQ] = useState('');
  const [dist, setDist] = useState('');

  const withDishes = districts.filter((d) => (dishesByDistrict[d.id] ?? []).length > 0);

  const needle = q.trim().toLowerCase();
  const rows = dishes.filter((dish) => {
    if (dist && dish.districtId !== dist) return false;
    if (!needle) return true;
    const d = districtById[dish.districtId];
    return (
      dish.nameBn.includes(needle) ||
      dish.nameEn.toLowerCase().includes(needle) ||
      (d?.nameBn ?? '').includes(needle) ||
      (d?.nameEn ?? '').toLowerCase().includes(needle)
    );
  });

  const clear = () => {
    setQ('');
    setDist('');
  };

  return (
    <>
      <div className="cat-h">
        <div>
          <div className="eyebrow">খাবারের তালিকা</div>
          <h1>বইয়ের <em>সব</em> খাবার</h1>
          <div className="sub">
            {bn(totalDishes)}টি খাবার · {bn(withDishes.length)}টি জেলা
          </div>
        </div>
        <button className="btn" onClick={onSuggest}>🍽️ খাবার পরামর্শ দাও</button>
      </div>

      <div className="cat-tools">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍 খাবার বা জেলা খোঁজো…"
          aria-label="খাবার বা জেলা খোঁজো"
        />
        <select
          value={dist}
          onChange={(e) => setDist(e.target.value)}
          aria-label="জেলা বাছো"
        >
          <option value="">সব জেলা</option>
          {withDishes.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nameBn} ({d.nameEn})
            </option>
          ))}
        </select>
        {(q || dist) && (
          <button className="link" onClick={clear}>
            মুছো ✕
          </button>
        )}
      </div>

      <p className="cat-count">
        {rows.length === totalDishes
          ? `${bn(totalDishes)}টি খাবার`
          : `${bn(rows.length)}টি খাবার দেখানো হচ্ছে · ${bn(totalDishes)}টের মধ্যে`}
      </p>

      {rows.length === 0 ? (
        <div className="piece pane-note">
          <p className="note">কোনো খাবার পাওয়া যায়নি — নাম বা জেলা বদলে দেখো।</p>
          <button className="link" onClick={clear}>ফিল্টার মুছো</button>
        </div>
      ) : (
        <div className="cat-grid">
          {rows.map((dish) => {
            const d = districtById[dish.districtId];
            return (
              <button
                key={dish.id}
                className="cat-card"
                onClick={() => onOpenDish(dish)}
                title={`${dish.nameBn} — ${d?.nameBn}`}
              >
                <PhotoSlot dish={dish} />
                <span className="cat-meta">
                  {dish.nameBn}
                  <small className="dist">📍 {d?.nameBn}</small>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
