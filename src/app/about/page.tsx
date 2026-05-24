import type { Metadata } from 'next';
import Link from 'next/link';
import { chapters, flatLessons } from '@/lib/chapters';

export const metadata: Metadata = {
  title: 'About',
  description:
    'About Hello SLAM — a web companion to the hello-slam notebooks by Nikolaos Stathoulopoulos.',
};

export default function AboutPage() {
  const first = flatLessons[0];
  return (
    <div className="prose-slam">
      <section className="relative overflow-hidden rounded-md-xl bg-md-secondary-container px-8 py-12 md:px-12 md:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-md-full bg-md-tertiary-container opacity-60 blur-3xl"
        />
        <div className="relative">
          <span className="md-chip">About</span>
          <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-md-on-secondary-container md:text-5xl">
            A web companion to a great SLAM tutorial.
          </h1>
          <p className="mt-4 max-w-2xl text-md-on-secondary-container/90">
            Hello SLAM is a hands-on tour through the algorithms a robot uses to
            figure out where it is and what the world looks like — Bayes
            filters, Kalman and particle filters, and modern graph-based SLAM.
          </p>
        </div>
      </section>

      <h2>What this site is</h2>
      <p>
        This site is a web rendering of the{' '}
        <a
          href="https://github.com/nstathou/hello-slam"
          target="_blank"
          rel="noopener noreferrer"
        >
          hello-slam
        </a>{' '}
        Jupyter-notebook course by{' '}
        <a
          href="https://github.com/nstathou"
          target="_blank"
          rel="noopener noreferrer"
        >
          Nikolaos Stathoulopoulos
        </a>
        . It is built as a Next.js MDX site so the notebooks can be read in the
        browser, on any device, with consistent typography, math rendering, and
        cross-linking between chapters.
      </p>

      <h2>What you will learn</h2>
      <p>
        Across {chapters.length} chapters and {flatLessons.length} lessons, the
        course covers the probabilistic foundations of SLAM and then walks
        through three major families of algorithms:
      </p>
      <ul>
        {chapters.map((c) => (
          <li key={c.slug}>
            <Link href={`/chapters/${c.slug}`}>
              <strong>
                {c.number}. {c.title}
              </strong>
            </Link>{' '}
            — {c.summary}
          </li>
        ))}
      </ul>

      <h2>Credits</h2>
      <p>
        All course content — explanations, derivations, figures, and the
        underlying notebooks — is the work of <strong>Nikolaos Stathoulopoulos</strong>.
        This site is an unofficial web port intended to make the material easier
        to read. See the{' '}
        <Link href="/credits">credits page</Link> for full attribution and
        licensing notes.
      </p>

      <div className="not-prose mt-10 flex flex-wrap gap-3">
        {first && (
          <Link href={first.href} className="md-btn-filled">
            Start the course
            <span aria-hidden="true">→</span>
          </Link>
        )}
        <a
          href="https://github.com/nstathou/hello-slam"
          target="_blank"
          rel="noopener noreferrer"
          className="md-btn-tonal"
        >
          View original notebooks ↗
        </a>
        <Link href="/credits" className="md-btn-outlined">
          Credits
        </Link>
      </div>
    </div>
  );
}
