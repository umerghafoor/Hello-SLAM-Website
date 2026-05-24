'use client';

import { ReactNode, useState } from 'react';

export type TimelineEntry = {
  period: string;
  headline: string;
  body: ReactNode;
  references?: string[];
};

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div className="my-8">
      <ol className="relative ml-3 space-y-6 border-l-2 border-md-outline-variant pl-6">
        {entries.map((e, i) => (
          <TimelineItem key={i} entry={e} />
        ))}
      </ol>
    </div>
  );
}

function TimelineItem({ entry }: { entry: TimelineEntry }) {
  const [open, setOpen] = useState(false);
  const hasRefs = entry.references && entry.references.length > 0;
  return (
    <li className="relative">
      <span
        aria-hidden="true"
        className="absolute -left-[34px] top-1.5 inline-flex h-4 w-4 items-center justify-center rounded-md-full bg-md-primary ring-4 ring-md-surface"
      />
      <div className="font-display text-sm font-semibold text-md-primary">
        {entry.period}
      </div>
      <div className="mt-1 text-md-on-surface">{entry.headline}</div>
      <div className="mt-2 text-sm text-md-on-surface-variant">{entry.body}</div>
      {hasRefs && (
        <div className="mt-3">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md-full bg-md-surface-container px-3 py-1 text-xs font-medium text-md-on-surface-variant hover:bg-md-surface-container-high"
          >
            <span>
              {open ? 'Hide' : 'Show'} {entry.references!.length} reference
              {entry.references!.length === 1 ? '' : 's'}
            </span>
            <svg
              viewBox="0 0 24 24"
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                open ? 'rotate-180' : ''
              }`}
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41Z" />
            </svg>
          </button>
          {open && (
            <ul className="mt-3 space-y-2 rounded-md-md border border-md-outline-variant bg-md-surface-container-low p-4 text-xs italic text-md-on-surface-variant">
              {entry.references!.map((r, i) => (
                <li key={i} className="leading-relaxed">
                  {r}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}
