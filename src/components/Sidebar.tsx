'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { chapters } from '@/lib/chapters';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-72 shrink-0 border-r border-[var(--border)] bg-[var(--bg-elev)]">
      <div className="sticky top-0 max-h-screen overflow-y-auto px-5 py-8">
        <Link href="/" className="block no-underline">
          <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
            Course
          </div>
          <div className="mt-1 text-lg font-semibold text-white">
            Hello <span className="text-[var(--accent)]">SLAM</span>
          </div>
        </Link>

        <nav className="mt-8 space-y-6">
          {chapters.map((chapter) => {
            const chapterHref = `/chapters/${chapter.slug}`;
            const inChapter = pathname?.startsWith(chapterHref);
            return (
              <div key={chapter.slug}>
                <Link
                  href={chapterHref}
                  className={`block no-underline ${
                    inChapter ? 'text-white' : 'text-[var(--text-muted)] hover:text-white'
                  }`}
                >
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-faint)]">
                    Chapter {chapter.number}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold">{chapter.title}</div>
                </Link>
                <ul className="mt-2 space-y-1 border-l border-[var(--border)] pl-3">
                  {chapter.lessons.map((lesson, i) => {
                    const href = `/chapters/${chapter.slug}/${lesson.slug}`;
                    const active = pathname === href;
                    return (
                      <li key={lesson.slug}>
                        <Link
                          href={href}
                          className={`block rounded px-2 py-1 text-[13px] no-underline transition-colors ${
                            active
                              ? 'bg-[var(--bg-soft)] text-white'
                              : 'text-[var(--text-muted)] hover:bg-[var(--bg-soft)] hover:text-white'
                          }`}
                        >
                          <span className="mr-2 text-[var(--text-faint)]">
                            {chapter.number}.{i + 1}
                          </span>
                          {lesson.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="mt-10 border-t border-[var(--border)] pt-5 text-xs text-[var(--text-faint)]">
          Built from the <span className="text-[var(--text-muted)]">hello-slam</span> notebooks.
        </div>
      </div>
    </aside>
  );
}
