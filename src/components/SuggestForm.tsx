'use client';
import { useState } from 'react';
import { postJson } from '@/lib/api';

export default function SuggestForm({ districtId }: { districtId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function submit() {
    if (name.trim().length < 2) return;
    setState('sending');
    try {
      const res = await postJson('/api/suggest', { districtId, name, note });
      if (res.ok) {
        setState('done');
        setName('');
        setNote('');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-4 text-sm text-emerald-700 underline">
        + এই জেলার আরেকটি খাবারের নাম জানাও
      </button>
    );
  }

  const input = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900';

  return (
    <form
      className="mt-4 space-y-2 rounded-xl border border-gray-200 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input className={input} placeholder="খাবারের নাম" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
      <input className={input} placeholder="কোথায় বিখ্যাত? (ঐচ্ছিক)" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={state === 'sending'} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          পাঠাও
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-500 underline">বন্ধ করো</button>
      </div>
      {state === 'done' && <p className="text-sm text-emerald-700">ধন্যবাদ! আমরা দেখে যোগ করব।</p>}
      {state === 'error' && <p className="text-sm text-red-600">পাঠানো গেল না। আবার চেষ্টা করো।</p>}
    </form>
  );
}