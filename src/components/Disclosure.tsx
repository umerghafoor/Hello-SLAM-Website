'use client';

import { ReactNode, useState } from 'react';

export function Disclosure({
  summary,
  defaultOpen = false,
  variant = 'default',
  children,
}: {
  summary: ReactNode;
  defaultOpen?: boolean;
  variant?: 'default' | 'warn';
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bg =
    variant === 'warn'
      ? 'var(--md-error-container)'
      : 'var(--md-surface-container)';
  const fg =
    variant === 'warn'
      ? 'var(--md-on-error-container)'
      : 'var(--md-on-surface)';

  return (
    <div
      className="my-6 overflow-hidden rounded-md-lg border border-md-outline-variant"
      style={{ background: bg, color: fg }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm font-medium"
      >
        <span className="min-w-0">{summary}</span>
        <svg
          viewBox="0 0 24 24"
          className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41Z" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-md-outline-variant px-5 py-4 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          {children}
        </div>
      )}
    </div>
  );
}
