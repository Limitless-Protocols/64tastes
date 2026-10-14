'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Piece } from './ui';

type GoogleId = {
  initialize: (options: Record<string, unknown>) => void;
  renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
};
declare global {
  interface Window {
    google?: { accounts?: { id: GoogleId } };
  }
}

const SRC = 'https://accounts.google.com/gsi/client';

export default function AdminLogin() {
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function onCredential(response: { credential: string }) {
      setMessage(null);
      const res = await fetch('/api/admin/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      if (res.ok) router.refresh();
      else if (res.status === 403) setMessage('This Google account is not on the admin list.');
      else setMessage('Sign-in failed. Please try again.');
    }

    function setup() {
      const gid = window.google?.accounts?.id;
      if (cancelled || !box.current || !gid) return;
      gid.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: onCredential,
      });
      gid.renderButton(box.current, { theme: 'outline', size: 'large', text: 'signin_with' });
    }

    if (window.google?.accounts?.id) {
      setup();
    } else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
      if (!script) {
        script = document.createElement('script');
        script.src = SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', setup);
    }

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <Piece className="admin-login">
      <h2>Admin sign-in</h2>
      <p className="note">Sign in with an admin Google account.</p>
      <div ref={box} />
      {message && <p className="adm-err">{message}</p>}
    </Piece>
  );
}