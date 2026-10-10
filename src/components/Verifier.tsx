'use client';
import { useEffect, useRef } from 'react';

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export default function Verifier({ onToken }: { onToken: (token: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const cb = useRef(onToken);
  useEffect(() => {
    cb.current = onToken;
  });

  useEffect(() => {
    let widgetId: string | undefined;
    let cancelled = false;

    function mount() {
      if (cancelled || !box.current || !window.turnstile) return;
      widgetId = window.turnstile.render(box.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        callback: (token: string) => cb.current(token),
      });
    }

    if (window.turnstile) {
      mount();
    } else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
      if (!script) {
        script = document.createElement('script');
        script.src = SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', mount);
    }

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, []);

  return <div ref={box} />;
}