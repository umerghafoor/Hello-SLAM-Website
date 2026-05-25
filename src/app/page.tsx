import type { Metadata } from 'next';
import Link from 'next/link';
import { chapters, flatLessons } from '@/lib/chapters';
import { OverallProgress } from '@/components/OverallProgress';

export const metadata: Metadata = {
  title: 'Hello SLAM — Free Interactive Course on Robot Localization & Mapping',
  description:
    'Learn Simultaneous Localization and Mapping from scratch. Covers Bayes filters, Kalman filters, EKF-SLAM, particle filters, FastSLAM, and graph-based SLAM with interactive visualisations.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Hello SLAM — Free Interactive Course on Robot Localization & Mapping',
    description:
      'Learn SLAM from scratch: Bayes filters, Kalman filters, EKF-SLAM, particle filters, FastSLAM, and graph-based SLAM. Free, interactive, browser-based.',
    url: '/',
  },
};

export default function HomePage() {
  const first = flatLessons[0];
  return (
    <div className="prose-slam">
      {/* Hero — Expressive uses bold display type + tonal hero surface */}
      <section className="relative overflow-hidden rounded-md-xl bg-md-primary-container px-8 py-12 md:px-12 md:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-md-full bg-md-tertiary-container opacity-60 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-md-full bg-md-secondary-container opacity-50 blur-3xl"
        />
        <div className="relative">
          <span className="md-chip">
            A course on Simultaneous Localization and Mapping
          </span>
          <h1 className="mt-5 font-display text-5xl font-medium tracking-tight text-md-on-primary-container md:text-6xl">
            Hello SLAM
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-md-on-primary-container/90">
            A hands-on tour through the algorithms a robot uses to figure out
            where it is and what the world looks like — from Bayes filters,
            through Kalman and particle filters, to modern graph-based SLAM.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {first && (
              <Link href={first.href} className="md-btn-filled">
                Start with {first.title}
                <span aria-hidden="true">→</span>
              </Link>
            )}
            <a href="https://github.com/" className="md-btn-outlined">
              Source notebooks
            </a>
          </div>
        </div>
      </section>

      <OverallProgress />

      <h2 className="mt-16 font-display text-3xl font-medium text-md-primary">
        Chapters
      </h2>
      <div className="mt-6 grid gap-4">
        {chapters.map((chapter, idx) => {
          // Expressive: alternate accent tints across cards
          const tints = [
            'group-hover:border-md-primary',
            'group-hover:border-md-tertiary',
            'group-hover:border-md-secondary',
          ];
          const numberBg = [
            'bg-md-primary-container text-md-on-primary-container',
            'bg-md-tertiary-container text-md-on-tertiary-container',
            'bg-md-secondary-container text-md-on-secondary-container',
          ];
          return (
            <Link
              key={chapter.slug}
              href={`/chapters/${chapter.slug}`}
              className={`group md-card block p-6 no-underline ${tints[idx % tints.length]}`}
            >
              <div className="flex items-center justify-between gap-4">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-md-full font-display text-base font-semibold ${numberBg[idx % numberBg.length]}`}
                >
                  {chapter.number}
                </span>
                <div className="text-[11px] uppercase tracking-[0.18em] text-md-on-surface-variant">
                  {chapter.lessons.length} lesson
                  {chapter.lessons.length === 1 ? '' : 's'}
                </div>
              </div>
              <div className="mt-4 font-display text-xl font-medium text-md-on-surface group-hover:text-md-primary">
                {chapter.title}
              </div>
              <p className="mt-2 text-sm text-md-on-surface-variant">
                {chapter.summary}
              </p>
              <ul className="mt-4 grid gap-1.5 text-sm text-md-on-surface-variant sm:grid-cols-2">
                {chapter.lessons.map((lesson, i) => (
                  <li key={lesson.slug} className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md-full bg-md-surface-container-high text-[10px] font-medium text-md-on-surface">
                      {i + 1}
                    </span>
                    <span>{lesson.title}</span>
                  </li>
                ))}
              </ul>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
