'use client';
import { useRouter } from 'next/navigation';

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

  const btn = 'rounded-lg border px-3 py-1 text-sm';
  return status === 'pending' ? (
    <div className="mt-2 flex gap-2">
      <button onClick={() => set('approved')} className={`${btn} border-emerald-600 text-emerald-800`}>Approve</button>
      <button onClick={() => set('rejected')} className={`${btn} border-red-400 text-red-700`}>Reject</button>
    </div>
  ) : (
    <div className="mt-2">
      <button onClick={() => set('pending')} className={`${btn} border-gray-300 text-gray-700`}>Move back to pending</button>
    </div>
  );
}