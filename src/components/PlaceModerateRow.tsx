'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  placeId: string;
  initialName: string;
  detail: string;
  approved?: boolean;
};

export default function PlaceModerateRow({ placeId, initialName, detail, approved }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);

  async function act(action: 'approve' | 'reject' | 'reset') {
    setBusy(true);
    await fetch('/api/admin/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeId, action, displayName: name }),
    });
    setBusy(false);
    router.refresh();
  }

  const btn = 'rounded-lg border px-3 py-1 text-sm disabled:opacity-50';

  return (
    <li className="rounded-xl border border-gray-200 p-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={60}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
      />
      <p className="mt-1 text-xs text-gray-500">{detail}</p>
      <div className="mt-2 flex gap-2">
        <button disabled={busy} onClick={() => act('approve')} className={`${btn} border-emerald-600 text-emerald-800`}>
          {approved ? 'Save name' : 'Approve'}
        </button>
        <button disabled={busy} onClick={() => act('reject')} className={`${btn} border-red-400 text-red-700`}>
          Reject
        </button>
        {approved && (
          <button disabled={busy} onClick={() => act('reset')} className={`${btn} border-gray-300 text-gray-700`}>
            Move back to pending
          </button>
        )}
      </div>
    </li>
  );
}