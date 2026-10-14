'use client';
import { useRouter } from 'next/navigation';
import { Check, Undo2, X } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from './ui';

export default function ModerateButtons({ id, status }: { id: number; status: 'pending' | 'approved' }) {
  const router = useRouter();

  async function set(next: 'pending' | 'approved' | 'rejected') {
    await fetch('/api/admin/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: next }),
    });
    router.refresh();
  }

  return status === 'pending' ? (
    <div className="adm-row-acts">
      <PrimaryButton onClick={() => set('approved')}>
        <Check className="icon" aria-hidden="true" /> Approve
      </PrimaryButton>
      <SecondaryButton onClick={() => set('rejected')}>
        <X className="icon" aria-hidden="true" /> Reject
      </SecondaryButton>
    </div>
  ) : (
    <div className="adm-row-acts">
      <SecondaryButton onClick={() => set('pending')}>
        <Undo2 className="icon" aria-hidden="true" /> Move back to pending
      </SecondaryButton>
    </div>
  );
}