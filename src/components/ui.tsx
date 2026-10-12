'use client';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * The Khabar Book's small set of shared paper pieces (design pass §0):
 * one place per look, so class lists don't repeat across components and every
 * variant stays token-driven. Plain wrappers — behaviour stays with the caller.
 */

/** A cream paper card with the nakshi-kantha dashed stitch and an optional tilt. */
export function Piece({
  className,
  tilt,
  children,
  style,
  ...rest
}: {
  className?: string;
  /** CSS `rotate`, e.g. "-2deg". */
  tilt?: string;
  children: ReactNode;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className ? `piece ${className}` : 'piece'}
      style={{ ...(tilt ? { rotate: tilt } : null), ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}

/** A reaction / filter pill. `over` switches to the dashed ওভাররেটেড look. */
export function Chip({
  on,
  over,
  children,
  ...rest
}: { on?: boolean; over?: boolean; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`chip${on ? ' on' : ''}${over ? ' over' : ''}`}
      aria-pressed={on}
      {...rest}
    >
      {children}
    </button>
  );
}

/** The tomato paper pill — the one primary action per zone. */
export function PrimaryButton({ children, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={className ? `btn ${className}` : 'btn'} {...rest}>
      {children}
    </button>
  );
}

/** The outlined paper pill — secondary actions. */
export function SecondaryButton({ children, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={className ? `btn alt ${className}` : 'btn alt'} {...rest}>
      {children}
    </button>
  );
}

/** One passport counter: big Bangla number over a small labelled icon. */
export function StatTile({ value, label, icon }: { value: string; label: string; icon: ReactNode }) {
  return (
    <div className="stat">
      <b>{value}</b>
      <span>
        {icon}
        {label}
      </span>
    </div>
  );
}
