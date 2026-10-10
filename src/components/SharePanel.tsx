'use client';
import { useEffect, useRef, useState } from 'react';
import ShareCard, { FORMATS, type Format } from './ShareCard';
import { renderPng } from '@/lib/shareImage';
import { encodeProgress } from '@/lib/share';
import { getTier } from '@/lib/tiers';
import { totalDishes } from '@/lib/data';
import { bn } from '@/lib/format';

export default function SharePanel({ eaten, onClose }: { eaten: Set<number>; onClose: () => void }) {
  const [format, setFormat] = useState<Format>('landscape');
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const tier = getTier(eaten.size, totalDishes);
  const link = `${window.location.origin}/r/${encodeProgress(eaten)}`;

  useEffect(() => {
    let cancelled = false;
    setDataUrl(null);
    setBlob(null);
    setError(false);
    (async () => {
      const node = cardRef.current;
      if (!node) return;
      const { w, h } = FORMATS[format];
      const url = await renderPng(node, w, h);
      const b = await (await fetch(url)).blob();
      if (!cancelled) {
        setDataUrl(url);
        setBlob(b);
      }
    })().catch(() => {
      if (!cancelled) setError(true);
    });
    return () => {
      cancelled = true;
    };
  }, [format, eaten]);

  function download() {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'bangladesh-food-map.png';
    a.click();
  }

  async function share() {
    if (!blob) return;
    const file = new File([blob], 'bangladesh-food-map.png', { type: 'image/png' });
    const text = `আমি ${bn(eaten.size)}টি খাবার চেখে দেখেছি — ${tier.bn}! তুমি কতটা চেখেছ? ${link}`;
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text });
      } catch {
        // user closed the share sheet
      }
    } else {
      download();
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-label="Share your map">
        <div className="flex items-center justify-between">
          <h2>Share your map</h2>
          <button onClick={onClose} aria-label="Close" className="close">×</button>
        </div>

        <div className="mt-2 flex flex-wrap">
          {(Object.keys(FORMATS) as Format[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className="chip"
              aria-pressed={format === f}
            >
              {FORMATS[f].label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex min-h-40 items-center justify-center rounded bg-brand-50">
          {error ? (
            <p className="p-4 caption text-error">Couldn&apos;t create the image. Please try again.</p>
          ) : dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt="Your food map card" className="max-h-[45vh] rounded" />
          ) : (
            <p className="caption">Preparing your card…</p>
          )}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <button onClick={share} disabled={!blob} className="btn btn-primary btn-sm">
            Share
          </button>
          <button onClick={download} disabled={!dataUrl} className="btn btn-ghost btn-sm">
            Download
          </button>
          <button onClick={copyLink} className="btn btn-ghost btn-sm">
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </div>

      {/* Off-screen card used to make the image. Capture the inner div, not this wrapper. */}
      <div style={{ position: 'fixed', left: -10000, top: 0 }} aria-hidden="true">
        <div ref={cardRef}>
          <ShareCard eaten={eaten} format={format} />
        </div>
      </div>
    </div>
  );
}
