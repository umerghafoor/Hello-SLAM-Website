import { ReactNode } from 'react';

type Variant = 'note' | 'todo' | 'tip' | 'warn';

const styles: Record<
  Variant,
  { bg: string; on: string; accent: string; tag: string; icon: string }
> = {
  note: {
    bg: 'var(--md-primary-container)',
    on: 'var(--md-on-primary-container)',
    accent: 'var(--md-primary)',
    tag: 'Note',
    icon: 'M11 9h2V7h-2v2Zm0 8h2v-6h-2v6Zm1-15a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z',
  },
  todo: {
    bg: 'var(--md-tertiary-container)',
    on: 'var(--md-on-tertiary-container)',
    accent: 'var(--md-tertiary)',
    tag: 'In progress',
    icon: 'M12 2a10 10 0 1 0 10 10h-2a8 8 0 1 1-8-8V2Z',
  },
  tip: {
    bg: 'var(--md-secondary-container)',
    on: 'var(--md-on-secondary-container)',
    accent: 'var(--md-secondary)',
    tag: 'Tip',
    icon: 'M9 21h6v-1H9v1Zm3-19a7 7 0 0 0-4 12.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26A7 7 0 0 0 12 2Z',
  },
  warn: {
    bg: 'var(--md-error-container)',
    on: 'var(--md-on-error-container)',
    accent: 'var(--md-error)',
    tag: 'Heads up',
    icon: 'M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z',
  },
};

export function Callout({
  variant = 'note',
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: ReactNode;
}) {
  const s = styles[variant];
  return (
    <aside
      className="my-6 flex gap-3 rounded-md-lg px-5 py-4"
      style={{ background: s.bg, color: s.on }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="mt-0.5 h-5 w-5 shrink-0"
        fill="currentColor"
        style={{ color: s.accent }}
        aria-hidden="true"
      >
        <path d={s.icon} />
      </svg>
      <div className="min-w-0 flex-1">
        <div
          className="text-[11px] font-medium uppercase tracking-[0.18em]"
          style={{ color: s.accent }}
        >
          {title ?? s.tag}
        </div>
        <div className="mt-1 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          {children}
        </div>
      </div>
    </aside>
  );
}
