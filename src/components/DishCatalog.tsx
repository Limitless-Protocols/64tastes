'use client';
import { districts, dishesByDistrict, totalDishes } from '@/lib/data';
import { bn } from '@/lib/format';
import PhotoSlot from './PhotoSlot';

type Props = {
  onSelectDistrict: (districtId: string) => void;
  onSuggest: () => void;
};

/**
 * The খাবার tab: every dish in the book, grouped by district. Picking a dish
 * jumps back to the map tab with its district selected. The suggest button
 * opens the form with a district dropdown (the map's entry point is locked
 * to the tapped district instead).
 */
export default function DishCatalog({ onSelectDistrict, onSuggest }: Props) {
  const withDishes = districts.filter((d) => (dishesByDistrict[d.id] ?? []).length > 0);

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

      {withDishes.map((d) => (
        <section className="cat-sec" key={d.id}>
          <h3>
            {d.nameBn}
            <small>{d.nameEn}</small>
          </h3>
          <div className="cat-row">
            {(dishesByDistrict[d.id] ?? []).map((dish) => (
              <button
                key={dish.id}
                className="cat-card"
                onClick={() => onSelectDistrict(d.id)}
                title={`${dish.nameBn} — ${d.nameBn}`}
              >
                <PhotoSlot dish={dish} />
                <span>
                  {dish.nameBn}
                  <small>{dish.nameEn}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
