'use client';
import { useEffect, useRef, useState } from 'react';
import { ClipboardCheck, Download, Link2, Share2, X } from 'lucide-react';
import ShareCard, { FORMATS, type Format } from './ShareCard';
import { renderPng } from '@/lib/shareImage';
import { encodeProgress } from '@/lib/share';
import { getTier } from '@/lib/tiers';
import { totalDishes } from '@/lib/data';
import { bn } from '@/lib/format';
import { PrimaryButton, SecondaryButton } from './ui';

type Shot = { url: string; blob: Blob } | { error: true };

/**
 * The share modal: pick a size (Bangla tabs), then share / download / copy
 * the link. The card is rendered off-screen with html-to-image and shown as a
 * PNG preview — each size is rendered once and cached. Download produces the
 * real PNG for all three sizes; Share uses the Web Share API with the file and
 * falls back to download + copy link.
 */
export default function SharePanel({ eaten, onClose }: { eaten: Set<number>; onClose: () => void }) {
  const [format, setFormat] = useState<Format>('landscape');
  const [shots, setShots] = useState<Partial<Record<Format, Shot>>>({});
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const tier = getTier(eaten.size, totalDishes);
  const link = typeof window === 'undefined' ? '' : `${window.location.origin}/r/${encodeProgress(eaten)}`;

  useEffect(() => {
    let cancelled = false;
    if (shots[format]) return;
    (async () => {
      const node = cardRef.current;
      if (!node) return;
      const { w, h } = FORMATS[format];
      try {
        const url = await renderPng(node, w, h);
        const blob = await (await fetch(url)).blob();
        if (!cancelled) setShots((prev) => ({ ...prev, [format]: { url, blob } }));
      } catch {
        if (!cancelled) setShots((prev) => ({ ...prev, [format]: { error: true } }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [format, shots]);

  useEffect(
    () => () => {
      for (const t of timers.current) clearTimeout(t);
    },
    []
  );

  const shot = shots[format];
  const ready = shot && 'url' in shot ? shot : null;

  function download() {
    if (!ready) return;
    const a = document.createElement('a');
    a.href = ready.url;
    a.download = `khabar-book-${format}.png`;
    a.click();
  }

  async function share() {
    if (!ready) return;
    const file = new File([ready.blob], 'khabar-book.png', { type: 'image/png' });
    const text = `আমি ${bn(eaten.size)}টি খাবার চেখে দেখেছি — ${tier.bn}! তুমি কতটা চেখেছ? ${link}`;
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text });
      } catch {
        // user closed the share sheet
      }
    } else {
      // no file-share support: download the PNG, then copy the link
      download();
      copyLink();
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    timers.current.push(setTimeout(() => setCopied(false), 2000));
  }

  return (
    <div
      className="mb"
      role="dialog"
      aria-modal="true"
      aria-label="শেয়ার করো"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal share">
        <h2>
          শেয়ার করো
          <button className="x" onClick={onClose} aria-label="বন্ধ করো">
            <X className="icon" aria-hidden="true" />
          </button>
        </h2>

        <div className="seg">
          {(Object.keys(FORMATS) as Format[]).map((f) => (
            <button
              key={f}
              className={`chip${format === f ? ' on' : ''}`}
              aria-pressed={format === f}
              onClick={() => setFormat(f)}
            >
              {FORMATS[f].label}
            </button>
          ))}
        </div>

        <div className="preview">
          {shot && 'error' in shot ? (
            <p className="note">কার্ড বানানো যায়নি — আবার চেষ্টা করো।</p>
          ) : ready ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ready.url} alt={`তোমার ফুড ম্যাপ কার্ড — ${FORMATS[format].label}`} />
          ) : (
            <p className="note">কার্ড বানানো হচ্ছে…</p>
          )}
        </div>

        <div className="acts">
          <PrimaryButton onClick={share} disabled={!ready}>
            <Share2 className="icon" aria-hidden="true" /> শেয়ার
          </PrimaryButton>
          <SecondaryButton onClick={download} disabled={!ready}>
            <Download className="icon" aria-hidden="true" /> ডাউনলোড
          </SecondaryButton>
          <SecondaryButton onClick={copyLink}>
            {copied ? (
              <>
                <ClipboardCheck className="icon" aria-hidden="true" /> কপি হয়েছে!
              </>
            ) : (
              <>
                <Link2 className="icon" aria-hidden="true" /> লিংক কপি
              </>
            )}
          </SecondaryButton>
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
