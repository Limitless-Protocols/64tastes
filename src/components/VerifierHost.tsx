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
    <div
      className="mb fix"
      role="dialog"
      aria-modal="true"
      aria-label="যাচাই"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) finish(false);
      }}
    >
      <div className="modal" style={{ textAlign: 'center' }}>
        <p className="note">একটু যাচাই করছি…</p>
        <Verifier onToken={onToken} />
        <button onClick={() => finish(false)} className="link">
          বাতিল
        </button>
      </div>
    </div>
  );
}