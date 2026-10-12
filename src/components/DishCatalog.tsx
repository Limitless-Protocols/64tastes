'use client';
import { useMemo, useState } from 'react';
import { ChefHat, MapPin, Search } from 'lucide-react';
import { districtById, districts, dishes, dishesByDistrict, totalDishes } from '@/lib/data';
import { bn } from '@/lib/format';
import type { Dish } from '@/lib/types';
import PhotoSlot from './PhotoSlot';
import { Chip, PrimaryButton } from './ui';

type Props = {
  /** Dish cards open the detail modal (no map jump from this tab). */
  onOpenDish: (dish: Dish) => void;
  onSuggest: () => void;
};

/** Category chips — Bangla labels for the `category` values in dishes.json. */
const CATEGORIES: { v: string; label: string }[] = [
  { v: 'sweet', label: 'মিষ্টি' },
  { v: 'savory', label: 'মাংস' },
  { v: 'seafood', label: 'মাছ' },
  { v: 'drink', label: 'পানীয়' },
  { v: 'main', label: 'মূল খাবার' },
  { v: 'staple', label: 'রুটি ও শস্য' },
  { v: 'sour', label: 'টক' },
];

/**
 * The খাবার tab: every dish in the book as one flat grid of vertical cards —
 * big square image on top, dish name + district underneath. Sticky filter bar:
 * search matches dish OR district names (Bangla or English), category chips
 * narrow the kind, the dropdown narrows to a single district. Picking a card
 * opens the dish detail modal.
 */
export default function DishCatalog({ onOpenDish, onSuggest }: Props) {
  const [q, setQ] = useState('');
  const [dist, setDist] = useState('');
  const [cat, setCat] = useState('');

  const withDishes = useMemo(
    () => districts.filter((d) => (dishesByDistrict[d.id] ?? []).length > 0),
    []
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const d of dishes) {
      const k = d.category.trim();
      c[k] = (c[k] ?? 0) + 1;
    }
    return c;
  }, []);

  const needle = q.trim().toLowerCase();
  const rows = dishes.filter((dish) => {
    if (dist && dish.districtId !== dist) return false;
    if (cat && dish.category.trim() !== cat) return false;
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
    setCat('');
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
        <PrimaryButton onClick={onSuggest}>
          <ChefHat className="icon" aria-hidden="true" /> খাবার পরামর্শ দাও
        </PrimaryButton>
      </div>

      <div className="cat-tools">
        <span style={{ position: 'relative', flex: 1, minWidth: 200, display: 'inline-flex' }}>
          <Search className="icon" aria-hidden="true" style={{ position: 'absolute', left: 14, top: '50%', translate: '0 -50%', color: 'var(--muted)' }} />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="খাবার বা জেলা খোঁজো…"
            aria-label="খাবার বা জেলা খোঁজো"
          />
        </span>
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
        {(q || dist || cat) && (
          <button className="link" onClick={clear}>
            মুছো ✕
          </button>
        )}
      </div>

      <div className="cat-chips" role="group" aria-label="ধরন বাছো">
        <Chip on={!cat} onClick={() => setCat('')}>
          সব ({bn(dishes.length)})
        </Chip>
        {CATEGORIES.filter((c) => counts[c.v]).map((c) => (
          <Chip key={c.v} on={cat === c.v} onClick={() => setCat(cat === c.v ? '' : c.v)}>
            {c.label} ({bn(counts[c.v])})
          </Chip>
        ))}
      </div>

      <p className="cat-count">
        {rows.length === totalDishes
          ? `${bn(totalDishes)}টি খাবার`
          : `${bn(rows.length)}টি খাবার দেখানো হচ্ছে · ${bn(totalDishes)}টের মধ্যে`}
      </p>

      {rows.length === 0 ? (
        <div className="piece pane-note">
          <p className="note big">কোনো খাবার পাওয়া যায়নি — নাম বা জেলা বদলে দেখো।</p>
          <button className="link" onClick={clear}>ফিল্টার মুছো</button>
        </div>
      ) : (
        <div className="cat-grid grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {rows.map((dish) => {
            const d = districtById[dish.districtId];
            return (
              <button
                key={dish.id}
                className="cat-card"
                onClick={() => onOpenDish(dish)}
              >
                <PhotoSlot dish={dish} tag />
                <span className="cat-meta">
                  {dish.nameBn}
                  <small className="dist">
                    <MapPin className="icon" aria-hidden="true" /> {d?.nameBn}
                  </small>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
