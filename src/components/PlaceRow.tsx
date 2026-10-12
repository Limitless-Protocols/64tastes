'use client';
import { useState } from 'react';
import { MapPin } from 'lucide-react';

type Props = {
  name?: string;
  onSave: (name: string) => void;
  onClear: () => void;
};

/** Where did you eat this best? A tiny optional place pick (paper style). */
export default function PlaceRow({ name, onSave, onClear }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');

  function save() {
    const v = value.trim();
    if (v.length < 2) return;
    onSave(v);
    setEditing(false);
  }

  if (editing) {
    return (
      <form
        className="place-edit"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <input
          autoFocus
          maxLength={60}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="দোকানের নাম, এলাকা"
        />
        <button type="submit" className="btn">সেভ</button>
        <button type="button" onClick={() => setEditing(false)} className="link">বাতিল</button>
      </form>
    );
  }

  if (name) {
    return (
      <div className="place-view">
        <span>
          <MapPin className="icon" aria-hidden="true" style={{ width: 15, height: 15 }} /> {name}
        </span>
        <button
          onClick={() => {
            setValue(name);
            setEditing(true);
          }}
        >
          বদলাও
        </button>
        <button onClick={onClear}>মুছো</button>
      </div>
    );
  }

  return (
    <button
      className="place-add"
      onClick={() => {
        setValue('');
        setEditing(true);
      }}
    >
      <MapPin className="icon" aria-hidden="true" style={{ width: 15, height: 15 }} />
      কোথায় পাবেন? — জানলে লিখো
    </button>
  );
}
