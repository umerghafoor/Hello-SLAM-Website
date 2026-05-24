'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { chapters } from '@/lib/chapters';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-72 shrink-0 border-r border-md-outline-variant bg-md-surface-container-low">
      <div className="sticky top-0 max-h-screen overflow-y-auto px-4 py-6">
        <Link
          href="/"
          className="block rounded-md-lg px-3 py-2 no-underline transition-colors hover:bg-md-surface-container"
        >
          <div className="text-[11px] uppercase tracking-[0.18em] text-md-on-surface-variant">
            Course
          </div>
          <div className="mt-0.5 font-display text-xl font-medium text-md-on-surface">
            Hello <span className="text-md-primary">SLAM</span>
          </div>
        </Link>

        <nav className="mt-6 space-y-5">
          {chapters.map((chapter) => {
            const chapterHref = `/chapters/${chapter.slug}`;
            const inChapter = pathname?.startsWith(chapterHref);
            return (
              <div key={chapter.slug}>
                <Link
                  href={chapterHref}
                  className={`block rounded-md-md px-3 py-2 no-underline transition-colors ${
                    inChapter
                      ? 'bg-md-secondary-container text-md-on-secondary-container'
                      : 'text-md-on-surface-variant hover:bg-md-surface-container'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-[0.18em] opacity-80">
                    Chapter {chapter.number}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold">
                    {chapter.title}
                  </div>
                </Link>
                <ul className="mt-2 space-y-1 pl-2">
                  {chapter.lessons.map((lesson, i) => {
                    const href = `/chapters/${chapter.slug}/${lesson.slug}`;
                    const active = pathname === href;
                    return (
                      <li key={lesson.slug}>
                        <Link
                          href={href}
                          className={`group flex items-center gap-2 rounded-md-full px-3 py-2 text-[13px] no-underline transition-all ${
                            active
                              ? 'bg-md-primary-container text-md-on-primary-container font-medium'
                              : 'text-md-on-surface-variant hover:bg-md-surface-container hover:text-md-on-surface'
                          }`}
                        >
                          <span
                            className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md-full text-[10px] font-medium ${
                              active
                                ? 'bg-md-primary text-md-on-primary'
                                : 'bg-md-surface-container-high text-md-on-surface-variant group-hover:bg-md-surface-container-highest'
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className="truncate">{lesson.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="mt-8 border-t border-md-outline-variant pt-4 text-xs text-md-on-surface-variant">
          Built from the{' '}
          <span className="text-md-on-surface">hello-slam</span> notebooks.
        </div>
      </div>
    </aside>
  );
}
