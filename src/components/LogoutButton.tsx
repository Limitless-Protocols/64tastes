'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.refresh();
      }}
      className="text-sm text-gray-500 underline"
    >
      Log out
    </button>
  );
}