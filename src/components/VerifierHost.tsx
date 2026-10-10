'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Verifier from './Verifier';
import { setVerifyListener } from '@/lib/api';
import { getDeviceId } from '@/lib/deviceId';

export default function VerifierHost() {
  const [open, setOpen] = useState(false);
  const waiters = useRef<Array<(ok: boolean) => void>>([]);

  useEffect(() => {
    setVerifyListener((resolve) => {
      waiters.current.push(resolve);
      setOpen(true);
    });
    return () => setVerifyListener(null);
  }, []);

  const finish = useCallback((ok: boolean) => {
    const list = waiters.current;
    waiters.current = [];
    setOpen(false);
    list.forEach((resolve) => resolve(ok));
  }, []);

  const onToken = useCallback(
    async (token: string) => {
      try {
        const res = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: getDeviceId(), token }),
        });
        finish(res.ok);
      } catch {
        finish(false);
      }
    },
    [finish]
  );

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/40 p-4">
      <div className="rounded-xl bg-white p-4 text-center text-gray-900">
        <p className="mb-2 text-sm">একটু যাচাই করছি…</p>
        <Verifier onToken={onToken} />
        <button onClick={() => finish(false)} className="mt-2 text-xs text-gray-500 underline">
          বাতিল
        </button>
      </div>
    </div>
  );
}