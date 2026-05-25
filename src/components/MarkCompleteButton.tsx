'use client';

import { useProgressContext } from './ProgressContext';

export function MarkCompleteButton({
  chapterSlug,
  lessonSlug,
}: {
  chapterSlug: string;
  lessonSlug: string;
}) {
  const { isComplete, markComplete, markIncomplete } = useProgressContext();
  const done = isComplete(chapterSlug, lessonSlug);

  return (
    <button
      type="button"
      onClick={() =>
        done
          ? markIncomplete(chapterSlug, lessonSlug)
          : markComplete(chapterSlug, lessonSlug)
      }
      className={`inline-flex items-center gap-2 rounded-md-full px-5 py-2 text-sm font-medium transition-colors ${
        done
          ? 'bg-md-primary text-md-on-primary hover:bg-md-primary/80'
          : 'border border-md-outline text-md-on-surface-variant hover:bg-md-surface-container hover:text-md-on-surface'
      }`}
    >
      {done ? (
        <>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" />
          </svg>
          Completed
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 16H5V5h14v14Z" />
          </svg>
          Mark as complete
        </>
      )}
    </button>
  );
}
