'use client';

import { useProgressContext } from './ProgressContext';
import { flatLessons } from '@/lib/chapters';

export function OverallProgress() {
  const { completed } = useProgressContext();
  const total = flatLessons.length;
  const done = completed.size;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  if (done === 0) return null;

  return (
    <div className="mt-8 rounded-md-xl border border-md-outline-variant bg-md-surface-container-low px-6 py-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-md-on-surface">Your progress</span>
        <span className="text-md-on-surface-variant">
          {done} / {total} lessons
        </span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-md-full bg-md-surface-container-highest">
        <div
          className="h-full rounded-md-full bg-md-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={done}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`${pct}% complete`}
        />
      </div>
      {pct === 100 && (
        <p className="mt-3 text-center text-sm font-medium text-md-primary">
          All lessons complete!
        </p>
      )}
    </div>
  );
}
