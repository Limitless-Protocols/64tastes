'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Undo2, X } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from './ui';

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

  return (
    <li className="adm-row">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={60}
        className="adm-input"
      />
      <p className="note">{detail}</p>
      <div className="adm-row-acts">
        <PrimaryButton disabled={busy} onClick={() => act('approve')}>
          <Check className="icon" aria-hidden="true" /> {approved ? 'Save name' : 'Approve'}
        </PrimaryButton>
        <SecondaryButton disabled={busy} onClick={() => act('reject')}>
          <X className="icon" aria-hidden="true" /> Reject
        </SecondaryButton>
        {approved && (
          <SecondaryButton disabled={busy} onClick={() => act('reset')}>
            <Undo2 className="icon" aria-hidden="true" /> Move back to pending
          </SecondaryButton>
        )}
      </div>
    </li>
  );
}