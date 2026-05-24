import { ReactNode } from 'react';

type Variant = 'note' | 'todo' | 'tip' | 'warn';

const styles: Record<Variant, { border: string; bg: string; label: string; tag: string }> = {
  note: {
    border: 'border-[var(--accent)]',
    bg: 'bg-[var(--accent)]/5',
    label: 'text-[var(--accent)]',
    tag: 'Note',
  },
  todo: {
    border: 'border-[var(--accent-2)]',
    bg: 'bg-[var(--accent-2)]/5',
    label: 'text-[var(--accent-2)]',
    tag: 'In progress',
  },
  tip: {
    border: 'border-[var(--link)]',
    bg: 'bg-[var(--link)]/5',
    label: 'text-[var(--link)]',
    tag: 'Tip',
  },
  warn: {
    border: 'border-red-400',
    bg: 'bg-red-400/5',
    label: 'text-red-300',
    tag: 'Heads up',
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
    <aside className={`my-6 rounded-lg border-l-2 ${s.border} ${s.bg} px-5 py-4`}>
      <div className={`text-[11px] uppercase tracking-[0.18em] ${s.label}`}>
        {title ?? s.tag}
      </div>
      <div className="mt-2 text-[var(--text)] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}
