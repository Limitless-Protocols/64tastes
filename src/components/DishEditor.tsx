'use client';
import { useState } from 'react';
import type { DishContent } from '@/lib/dishContent';

type Spot = { name: string; area: string; note: string };

async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);

  const toBlob = (type: string, q: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, q));

  let quality = 0.8;
  let blob = await toBlob('image/webp', quality);
  if (!blob || blob.type !== 'image/webp') blob = await toBlob('image/jpeg', 0.82); // older Safari
  while (blob && blob.size > 550_000 && quality > 0.4) {
    quality -= 0.15;
    blob = await toBlob(blob.type, quality);
  }
  if (!blob) throw new Error('Could not process image');
  return blob;
}

const input = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900';
const label = 'mt-4 block text-sm font-medium text-gray-900';
const section = 'mt-8 border-t border-gray-200 pt-4 text-lg font-semibold text-gray-900';

export default function DishEditor({ dishId, initial }: { dishId: number; initial: DishContent }) {
  const [descBn, setDescBn] = useState(initial.descriptionBn);
  const [descEn, setDescEn] = useState(initial.descriptionEn);
  const [servings, setServings] = useState(initial.servings?.toString() ?? '');
  const [minutes, setMinutes] = useState(initial.minutes?.toString() ?? '');
  const [ingredients, setIngredients] = useState(initial.ingredients.join('\n'));
  const [steps, setSteps] = useState(initial.steps.join('\n'));
  const [spots, setSpots] = useState<Spot[]>(
    initial.spots.map(({ name, area, note }) => ({ name, area, note }))
  );
  const [credit, setCredit] = useState(initial.photo?.credit ?? '');
  const [photoV, setPhotoV] = useState<number | null>(initial.photo?.v ?? null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function uploadPhoto(file: File) {
    setBusy(true);
    setStatus('Processing photo…');
    try {
      const blob = await compress(file);
      const form = new FormData();
      form.append('dishId', String(dishId));
      form.append('credit', credit);
      form.append('file', blob, blob.type === 'image/webp' ? 'photo.webp' : 'photo.jpg');
      const res = await fetch('/api/admin/dish-photo', { method: 'POST', body: form });
      if (!res.ok) throw new Error(String(res.status));
      setPhotoV(Math.floor(Date.now() / 1000));
      setStatus('Photo uploaded ✓');
    } catch {
      setStatus('Photo upload failed. Try a smaller image.');
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto() {
    if (!confirm('Remove this photo?')) return;
    setBusy(true);
    const res = await fetch('/api/admin/dish-photo', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dishId }),
    });
    setBusy(false);
    if (res.ok) {
      setPhotoV(null);
      setCredit('');
      setStatus('Photo removed ✓');
    } else {
      setStatus('Could not remove the photo.');
    }
  }

  async function save() {
    setBusy(true);
    setStatus('Saving…');
    try {
      const res = await fetch('/api/admin/dish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishId,
          descriptionBn: descBn,
          descriptionEn: descEn,
          servings,
          minutes,
          ingredients,
          steps,
          spots,
          photoCredit: credit,
        }),
      });
      setStatus(res.ok ? 'Saved ✓' : `Save failed (${res.status})`);
    } catch {
      setStatus('Save failed. Check your connection.');
    } finally {
      setBusy(false);
    }
  }

  function updateSpot(i: number, patch: Partial<Spot>) {
    setSpots((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function moveSpot(i: number, dir: -1 | 1) {
    setSpots((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  return (
    <div className="pb-24">
      <h2 className={section}>📝 Description</h2>
      <label className={label}>Bangla</label>
      <textarea className={input} rows={5} maxLength={1500} value={descBn} onChange={(e) => setDescBn(e.target.value)} />
      <label className={label}>English (optional)</label>
      <textarea className={input} rows={4} maxLength={1500} value={descEn} onChange={(e) => setDescEn(e.target.value)} />

      <h2 className={section}>📷 Photo</h2>
      {photoV && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/dish-photo/${dishId}?v=${photoV}`} alt="" className="mt-2 max-h-52 rounded-lg border border-gray-200" />
      )}
      <label className={label}>{photoV ? 'Replace photo' : 'Upload photo'}</label>
      <input
        type="file"
        accept="image/*"
        disabled={busy}
        className="text-sm text-gray-900"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) uploadPhoto(f);
          e.target.value = '';
        }}
      />
      <label className={label}>Photo credit</label>
      <input className={input} maxLength={120} placeholder="e.g. Photo: Rahim Uddin (used with permission)" value={credit} onChange={(e) => setCredit(e.target.value)} />
      <p className="mt-1 text-xs text-gray-500">
        Only use photos you took or have permission to use. The credit is saved with the Save button.
      </p>
      {photoV && (
        <button disabled={busy} onClick={removePhoto} className="mt-2 text-sm text-red-600 underline">Remove photo</button>
      )}

      <h2 className={section}>📍 Popular spots</h2>
      <p className="mt-1 text-xs text-gray-500">Shown before the community-picked spots. Up to 8.</p>
      <ul className="mt-2 space-y-3">
        {spots.map((s, i) => (
          <li key={i} className="rounded-lg border border-gray-200 p-3">
            <input className={input} placeholder="Place name" maxLength={80} value={s.name} onChange={(e) => updateSpot(i, { name: e.target.value })} />
            <div className="mt-2 flex gap-2">
              <input className={input} placeholder="Area / address" maxLength={80} value={s.area} onChange={(e) => updateSpot(i, { area: e.target.value })} />
              <input className={input} placeholder="Short note" maxLength={160} value={s.note} onChange={(e) => updateSpot(i, { note: e.target.value })} />
            </div>
            <div className="mt-2 flex gap-3 text-sm text-gray-600">
              <button onClick={() => moveSpot(i, -1)} className="underline">↑ Up</button>
              <button onClick={() => moveSpot(i, 1)} className="underline">↓ Down</button>
              <button onClick={() => setSpots((p) => p.filter((_, idx) => idx !== i))} className="text-red-600 underline">Remove</button>
            </div>
          </li>
        ))}
      </ul>
      {spots.length < 8 && (
        <button onClick={() => setSpots((p) => [...p, { name: '', area: '', note: '' }])} className="mt-3 text-sm text-emerald-700 underline">
          + Add a spot
        </button>
      )}

      <h2 className={section}>🍳 Recipe</h2>
      <div className="mt-2 flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900">Servings</label>
          <input className={input} inputMode="numeric" value={servings} onChange={(e) => setServings(e.target.value)} />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-900">Total minutes</label>
          <input className={input} inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </div>
      </div>
      <label className={label}>Ingredients (one per line)</label>
      <textarea className={input} rows={8} value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
      <label className={label}>Steps (one per line, in order)</label>
      <textarea className={input} rows={10} value={steps} onChange={(e) => setSteps(e.target.value)} />
      <p className="mt-1 text-xs text-gray-500">Write the recipe in your own words rather than copying another site&apos;s text.</p>

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white p-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button disabled={busy} onClick={save} className="rounded-lg bg-emerald-600 px-5 py-2 font-medium text-white disabled:opacity-50">
            Save
          </button>
          {status && <span className="text-sm text-gray-700">{status}</span>}
        </div>
      </div>
    </div>
  );
}