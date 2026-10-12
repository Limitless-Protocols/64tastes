'use client';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

type Item = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  items: Item[];
};

/**
 * Accessible hamburger drawer (mobile navigation).
 * - Focus trap
 * - Esc to close
 * - Click outside to close
 * - Locks body scroll
 * - Closes on route change (handled by caller)
 */
export default function HamburgerDrawer({ open, onClose, items }: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActive = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousActive.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
      previousActive.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab') {
        const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[var(--z-drawer)] flex"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 bg-ink/60"
        aria-hidden="true"
      />
      <aside
        ref={drawerRef}
        className="relative w-full max-w-sm bg-paper border-r border-l-0 border-t-0 border-b-0 border-ink shadow-lift flex flex-col"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="মেনু"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h2 className="font-serif text-[var(--text-title)] font-medium">মেনু</h2>
          <button
            className="icon-btn p-2"
            onClick={onClose}
            aria-label="বন্ধ করো"
          >
            <X className="icon" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
          {items.map((item, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-4 px-3 py-3 text-left rounded-[var(--radius-paper)] bg-transparent border-0 text-ink font-semibold text-[var(--text-ui)] hover:bg-mango transition-colors"
              onClick={() => { item.onClick(); onClose(); }}
            >
              <span className="flex items-center justify-center w-10 h-10 text-ink" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </div>
  );
}