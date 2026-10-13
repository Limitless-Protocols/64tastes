'use client';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '@/lib/focus';

type Props = {
  /** Accessible dialog name. */
  label: string;
  /** Visible heading; omit for content that brings its own. */
  title?: string;
  onClose: () => void;
  children: ReactNode;
  /** Extra classes (e.g. `pass-sheet`). */
  className?: string;
};

/**
 * The shared sheet shell (design pass § overlay system): scrim + bottom
 * paper sheet on phones (≥768px it is a centred card — CSS decides),
 * focus-trapped with focus returned on close, backdrop click closes.
 * Esc is handled once by the overlay owner in FoodMap.
 */
export default function Sheet({ label, title, onClose, children, className }: Props) {
  const ref = useFocusTrap<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`mb sheet-mb${className ? ` ${className}` : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        {title && (
          <h2>
            {title}
            <button className="x" onClick={onClose} aria-label="বন্ধ করো">
              <X className="icon" aria-hidden="true" />
            </button>
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
