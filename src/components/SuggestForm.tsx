'use client';
import { useState } from 'react';
import { districts } from '@/lib/data';
import { postJson } from '@/lib/api';

type Props = {
  /** Locked to one district (the map's entry point). Without it the form
   *  renders a district dropdown (the খাবার tab's entry point). */
  districtId?: string;
  /** Render the form open (used inside modals) instead of behind a link. */
  standalone?: boolean;
};

/**
 * Suggest a dish. Styled to the Khabar Book (paper + ink) design; submits
 * through the shared postJson (deviceId + Turnstile retry on 401).
 */
export default function SuggestForm({ districtId, standalone = false }: Props) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState('');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const forDistrict = districtId ?? picked;

  async function submit() {
    if (name.trim().length < 2 || !forDistrict) return;
    setState('sending');
    try {
      const res = await postJson('/api/suggest', { districtId: forDistrict, name, note });
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

  if (!open && !standalone) {
    return (
      <button className="link" onClick={() => setOpen(true)}>
        + এই জেলার আরেকটি খাবারের নাম জানাও
      </button>
    );
  }

  return (
    <form
      className="sf"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {!districtId && (
        <label className="sf-l">
          কোন জেলার খাবার?
          <select value={picked} onChange={(e) => setPicked(e.target.value)}>
            <option value="">— জেলা বেছে নাও —</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameBn} ({d.nameEn})
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="sf-l">
        খাবারের নাম
        <input placeholder="যেমন: কাচ্চি বিরিয়ানি" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="sf-l">
        কোথায় বিখ্যাত? <em>(ঐচ্ছিক)</em>
        <input placeholder="রেস্তোরাঁ / এলাকার নাম" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <div className="sf-acts">
        <button
          type="submit"
          className="btn"
          disabled={state === 'sending' || !forDistrict || name.trim().length < 2}
        >
          পাঠাও
        </button>
        {!standalone && (
          <button type="button" className="link" onClick={() => setOpen(false)}>
            বন্ধ করো
          </button>
        )}
      </div>
      {state === 'done' && <p className="sf-ok">ধন্যবাদ! আমরা দেখে যোগ করব।</p>}
      {state === 'error' && <p className="sf-err">পাঠানো গেল না। আবার চেষ্টা করো।</p>}
    </form>
  );
}
