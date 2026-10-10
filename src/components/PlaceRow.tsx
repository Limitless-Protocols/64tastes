'use client';
import { useState } from 'react';

type Props = {
  name?: string;
  onSave: (name: string) => void;
  onClear: () => void;
};

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
        className="mt-2 flex items-center gap-2"
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
          className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
        />
        <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white">সেভ</button>
        <button type="button" onClick={() => setEditing(false)} className="text-sm text-gray-500 underline">বাতিল</button>
      </form>
    );
  }

  if (name) {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-2 px-1 text-sm text-gray-900">
        <span>📍 {name}</span>
        <button
          onClick={() => {
            setValue(name);
            setEditing(true);
          }}
          className="text-gray-500 underline"
        >
          বদলাও
        </button>
        <button onClick={onClear} className="text-gray-500 underline">মুছো</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setValue('');
        setEditing(true);
      }}
      className="mt-2 rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700"
    >
      📍 কোথায় সেরাটা খেয়েছ? (ঐচ্ছিক)
    </button>
  );
}