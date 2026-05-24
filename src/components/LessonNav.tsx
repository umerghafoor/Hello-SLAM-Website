import Link from 'next/link';
import { neighbors } from '@/lib/chapters';

export function LessonNav({
  chapterSlug,
  lessonSlug,
}: {
  chapterSlug: string;
  lessonSlug: string;
}) {
  const { prev, next } = neighbors(chapterSlug, lessonSlug);
  return (
    <nav className="mt-16 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-8">
      <div>
        {prev && (
          <Link
            href={prev.href}
            className="group block rounded-lg border border-[var(--border)] p-4 no-underline transition-colors hover:border-[var(--accent)]"
          >
            <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
              ← Previous
            </div>
            <div className="mt-1 text-sm text-white group-hover:text-[var(--accent)]">
              {prev.title}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              Chapter {prev.chapter.number} · {prev.chapter.title}
            </div>
          </Link>
        )}
      </div>
      <div>
        {next && (
          <Link
            href={next.href}
            className="group block rounded-lg border border-[var(--border)] p-4 text-right no-underline transition-colors hover:border-[var(--accent)]"
          >
            <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
              Next →
            </div>
            <div className="mt-1 text-sm text-white group-hover:text-[var(--accent)]">
              {next.title}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              Chapter {next.chapter.number} · {next.chapter.title}
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
}
