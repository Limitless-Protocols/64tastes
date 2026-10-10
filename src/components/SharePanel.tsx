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
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-4 text-gray-900 sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Share your map</h2>
          <button onClick={onClose} aria-label="Close" className="p-2 text-2xl leading-none">×</button>
        </div>

        <div className="mt-2 flex gap-2">
          {(Object.keys(FORMATS) as Format[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`rounded-full border px-3 py-1 text-sm ${
                format === f ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-gray-300 text-gray-700'
              }`}
            >
              {FORMATS[f].label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex min-h-40 items-center justify-center rounded-lg bg-gray-50">
          {error ? (
            <p className="p-4 text-sm text-red-600">Couldn&apos;t create the image. Please try again.</p>
          ) : dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt="Your food map card" className="max-h-[45vh] rounded-lg" />
          ) : (
            <p className="text-sm text-gray-500">Preparing your card…</p>
          )}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <button onClick={share} disabled={!blob} className="rounded-lg bg-emerald-600 py-2 font-medium text-white disabled:opacity-40">
            Share
          </button>
          <button onClick={download} disabled={!dataUrl} className="rounded-lg border border-gray-300 py-2 disabled:opacity-40">
            Download
          </button>
          <button onClick={copyLink} className="rounded-lg border border-gray-300 py-2">
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