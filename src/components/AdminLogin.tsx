'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [error, setError] = useState(false);

  async function login() {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (res.ok) router.refresh();
    else setError(true);
  }

  return (
    <form
      className="mt-4 space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        login();
      }}
    >
      <input
        type="password"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Admin token"
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900"
      />
      <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white">Log in</button>
      {error && <p className="text-sm text-red-600">Wrong token or too many attempts.</p>}
    </form>
  );
}