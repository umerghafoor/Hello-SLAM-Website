import Link from 'next/link';
import { chapters, flatLessons } from '@/lib/chapters';

export default function HomePage() {
  const first = flatLessons[0];
  return (
    <div className="prose-slam">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
        A course on Simultaneous Localization and Mapping
      </div>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-white">
        Hello <span className="text-[var(--accent)]">SLAM</span>
      </h1>
      <p className="mt-5 text-lg text-[var(--text-muted)]">
        A hands-on tour through the algorithms a robot uses to figure out where it is and
        what the world looks like — from Bayes filters, through Kalman and particle
        filters, to modern graph-based SLAM.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {first && (
          <Link
            href={first.href}
            className="inline-flex items-center rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#0b0d10] no-underline hover:bg-[var(--accent)]/90"
          >
            Start with {first.title} →
          </Link>
        )}
        <a
          href="https://github.com/"
          className="inline-flex items-center rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-muted)] no-underline hover:border-[var(--accent)] hover:text-white"
        >
          Source notebooks
        </a>
      </div>

      <h2 className="mt-16 text-2xl font-semibold text-[var(--accent)]">Chapters</h2>
      <div className="mt-6 grid gap-4">
        {chapters.map((chapter) => (
          <Link
            key={chapter.slug}
            href={`/chapters/${chapter.slug}`}
            className="group block rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] p-6 no-underline transition-colors hover:border-[var(--accent)]"
          >
            <div className="flex items-baseline justify-between gap-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
                Chapter {chapter.number}
              </div>
              <div className="text-[11px] text-[var(--text-faint)]">
                {chapter.lessons.length} lesson{chapter.lessons.length === 1 ? '' : 's'}
              </div>
            </div>
            <div className="mt-1 text-xl font-semibold text-white group-hover:text-[var(--accent)]">
              {chapter.title}
            </div>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{chapter.summary}</p>
            <ul className="mt-4 grid gap-1 text-sm text-[var(--text-muted)] sm:grid-cols-2">
              {chapter.lessons.map((lesson, i) => (
                <li key={lesson.slug} className="flex gap-2">
                  <span className="text-[var(--text-faint)]">
                    {chapter.number}.{i + 1}
                  </span>
                  <span>{lesson.title}</span>
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </div>
  );
}
