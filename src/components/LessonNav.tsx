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
    <nav className="mt-16 grid grid-cols-1 gap-3 border-t border-md-outline-variant pt-8 sm:grid-cols-2">
      <div>
        {prev && (
          <Link href={prev.href} className="group md-card block p-4 no-underline">
            <div className="text-[11px] uppercase tracking-[0.18em] text-md-on-surface-variant">
              ← Previous
            </div>
            <div className="mt-1 font-display text-base font-medium text-md-on-surface group-hover:text-md-primary">
              {prev.title}
            </div>
            <div className="text-xs text-md-on-surface-variant">
              Chapter {prev.chapter.number} · {prev.chapter.title}
            </div>
          </Link>
        )}
      </div>
      <div>
        {next && (
          <Link
            href={next.href}
            className="group md-card block p-4 text-right no-underline"
          >
            <div className="text-[11px] uppercase tracking-[0.18em] text-md-on-surface-variant">
              Next →
            </div>
            <div className="mt-1 font-display text-base font-medium text-md-on-surface group-hover:text-md-primary">
              {next.title}
            </div>
            <div className="text-xs text-md-on-surface-variant">
              Chapter {next.chapter.number} · {next.chapter.title}
            </div>
          </Link>
        )}
      </div>
    </nav>
  );
}
