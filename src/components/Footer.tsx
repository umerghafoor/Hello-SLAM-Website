import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-md-outline-variant bg-md-surface-container-low">
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-10 md:grid-cols-3 md:px-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md-full bg-md-primary text-md-on-primary">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M12 2 4 6v6c0 5 3.4 9.6 8 10 4.6-.4 8-5 8-10V6l-8-4Z" />
              </svg>
            </span>
            <span className="font-display text-base font-medium text-md-on-surface">
              Hello <span className="text-md-primary">SLAM</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-md-on-surface-variant">
            A web companion to the{' '}
            <a
              href="https://github.com/nstathou/hello-slam"
              target="_blank"
              rel="noopener noreferrer"
            >
              hello-slam
            </a>{' '}
            notebooks by Nikolaos Stathoulopoulos.
          </p>
        </div>

        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-md-on-surface-variant">
            Course
          </div>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <Link href="/" className="text-md-on-surface no-underline hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/chapters/introduction"
                className="text-md-on-surface no-underline hover:underline"
              >
                Introduction
              </Link>
            </li>
            <li>
              <Link
                href="/chapters/kalman-filters"
                className="text-md-on-surface no-underline hover:underline"
              >
                Kalman Filters
              </Link>
            </li>
            <li>
              <Link
                href="/chapters/particle-filters"
                className="text-md-on-surface no-underline hover:underline"
              >
                Particle Filters
              </Link>
            </li>
            <li>
              <Link
                href="/chapters/graph-slam"
                className="text-md-on-surface no-underline hover:underline"
              >
                Graph SLAM
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-md-on-surface-variant">
            Project
          </div>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <Link href="/about" className="text-md-on-surface no-underline hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/credits" className="text-md-on-surface no-underline hover:underline">
                Credits
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/nstathou/hello-slam"
                target="_blank"
                rel="noopener noreferrer"
                className="text-md-on-surface no-underline hover:underline"
              >
                Source notebooks ↗
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-md-outline-variant">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-2 px-6 py-4 text-xs text-md-on-surface-variant md:flex-row md:items-center md:px-10">
          <div>
            Original notebooks © Nikolaos Stathoulopoulos — used with attribution.
          </div>
          <div>Web port adapted with the Material 3 Expressive design system.</div>
        </div>
      </div>
    </footer>
  );
}
