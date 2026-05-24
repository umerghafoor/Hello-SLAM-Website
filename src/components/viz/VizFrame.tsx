'use client';

import { ReactNode } from 'react';

export function VizFrame({
  title,
  caption,
  children,
  controls,
}: {
  title?: string;
  caption?: ReactNode;
  children: ReactNode;
  controls?: ReactNode;
}) {
  return (
    <figure className="my-8 overflow-hidden rounded-md-lg border border-md-outline-variant bg-md-surface-container-low">
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-md-outline-variant bg-md-surface-container px-4 py-2">
          <span className="font-display text-xs font-medium uppercase tracking-[0.14em] text-md-on-surface-variant">
            Visualization
          </span>
          <span className="truncate text-sm font-medium text-md-on-surface">
            {title}
          </span>
        </div>
      )}
      <div className="px-3 py-4 sm:px-6 sm:py-6">{children}</div>
      {controls && (
        <div className="border-t border-md-outline-variant bg-md-surface-container px-4 py-3">
          {controls}
        </div>
      )}
      {caption && (
        <figcaption className="border-t border-md-outline-variant px-4 py-2 text-center text-xs text-md-on-surface-variant">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function VizSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="flex items-center gap-3 text-xs">
      <span className="min-w-[110px] text-md-on-surface-variant">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 accent-[var(--md-primary)]"
      />
      <span className="min-w-[60px] text-right font-mono text-md-on-surface">
        {format ? format(value) : value.toFixed(2)}
      </span>
    </label>
  );
}

export function VizButton({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'bg-md-primary text-md-on-primary'
          : 'bg-md-surface-container-high text-md-on-surface hover:bg-md-surface-container-highest'
      }`}
    >
      {children}
    </button>
  );
}
