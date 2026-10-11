'use client';
import { useState } from 'react';

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
        <span>📍 {name}</span>
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
      📍 কোথায় সেরাটা খেয়েছ? (ঐচ্ছিক)
    </button>
  );
}
