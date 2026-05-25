'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { chapters } from '@/lib/chapters';
import { useSidebar } from './SidebarContext';
import { useProgressContext } from './ProgressContext';

export function Sidebar() {
  const { collapsed, mobileOpen, closeMobile } = useSidebar();
  const pathname = usePathname();

  // Close mobile drawer on navigation
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  return (
    <>
      {/* Mobile scrim */}
      <div
        aria-hidden="true"
        onClick={closeMobile}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 md:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Desktop rail / drawer (md+) */}
      <aside
        aria-label="Course navigation"
        className={`hidden shrink-0 border-r border-md-outline-variant bg-md-surface-container-low transition-[width] duration-300 ease-out md:block ${
          collapsed ? 'w-[76px]' : 'w-72'
        }`}
      >
        <SidebarInner collapsed={collapsed} pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      <aside
        aria-label="Course navigation"
        aria-hidden={!mobileOpen}
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-md-outline-variant bg-md-surface-container-low shadow-md-3 transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-md-outline-variant">
          <span className="font-display text-base font-medium text-md-on-surface">
            Navigation
          </span>
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close navigation"
            className="md-icon-btn"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z" />
            </svg>
          </button>
        </div>
        <SidebarInner collapsed={false} pathname={pathname} />
      </aside>
    </>
  );
}

function SidebarInner({
  collapsed,
  pathname,
}: {
  collapsed: boolean;
  pathname: string | null;
}) {
  const { isComplete } = useProgressContext();
  return (
    <div className="sticky top-0 max-h-screen overflow-y-auto px-3 py-4">
      <nav className="space-y-1">
        {chapters.map((chapter) => {
          const chapterHref = `/chapters/${chapter.slug}`;
          const inChapter = pathname?.startsWith(chapterHref);
          const completedCount = chapter.lessons.filter((l) =>
            isComplete(chapter.slug, l.slug)
          ).length;
          const allDone = completedCount === chapter.lessons.length;
          return (
            <div key={chapter.slug}>
              <Link
                href={chapterHref}
                title={collapsed ? `Chapter ${chapter.number}: ${chapter.title}` : undefined}
                className={`group flex items-center gap-3 rounded-md-md px-2 py-2 no-underline transition-colors ${
                  inChapter
                    ? 'bg-md-secondary-container text-md-on-secondary-container'
                    : 'text-md-on-surface-variant hover:bg-md-surface-container'
                }`}
              >
                <span
                  className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md-full font-display text-sm font-semibold ${
                    allDone
                      ? 'bg-md-primary text-md-on-primary'
                      : inChapter
                      ? 'bg-md-primary text-md-on-primary'
                      : 'bg-md-surface-container-high text-md-on-surface group-hover:bg-md-surface-container-highest'
                  }`}
                >
                  {allDone ? <CheckIcon /> : chapter.number}
                </span>
                {!collapsed && (
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] uppercase tracking-[0.18em] opacity-80">
                      Chapter {chapter.number}
                    </span>
                    <span className="flex items-center gap-2 truncate text-sm font-semibold">
                      {chapter.title}
                      {completedCount > 0 && !allDone && (
                        <span className="shrink-0 text-[10px] font-normal opacity-60">
                          {completedCount}/{chapter.lessons.length}
                        </span>
                      )}
                    </span>
                  </span>
                )}
              </Link>

              {!collapsed && (
                <ul className="mb-3 mt-1 space-y-0.5 pl-2">
                  {chapter.lessons.map((lesson, i) => {
                    const href = `/chapters/${chapter.slug}/${lesson.slug}`;
                    const active = pathname === href;
                    const done = isComplete(chapter.slug, lesson.slug);
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
                              done
                                ? 'bg-md-primary text-md-on-primary'
                                : active
                                ? 'bg-md-primary text-md-on-primary'
                                : 'bg-md-surface-container-high text-md-on-surface-variant group-hover:bg-md-surface-container-highest'
                            }`}
                          >
                            {done ? <CheckIcon size="xs" /> : i + 1}
                          </span>
                          <span className={`truncate ${done ? 'line-through opacity-60' : ''}`}>
                            {lesson.title}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-md-outline-variant pt-3">
        <SidebarLink href="/about" collapsed={collapsed} active={pathname === '/about'} icon={<InfoIcon />}>
          About
        </SidebarLink>
        <SidebarLink href="/credits" collapsed={collapsed} active={pathname === '/credits'} icon={<HeartIcon />}>
          Credits
        </SidebarLink>
        <SidebarLink
          href="https://github.com/nstathou/hello-slam"
          external
          collapsed={collapsed}
          active={false}
          icon={<GitHubIcon />}
        >
          Source
        </SidebarLink>
      </div>

      {!collapsed && (
        <div className="mt-4 px-2 text-xs text-md-on-surface-variant">
          Built from the{' '}
          <a
            href="https://github.com/nstathou/hello-slam"
            target="_blank"
            rel="noopener noreferrer"
            className="text-md-on-surface"
          >
            hello-slam
          </a>{' '}
          notebooks.
        </div>
      )}
    </div>
  );
}

function SidebarLink({
  href,
  children,
  icon,
  collapsed,
  active,
  external,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  collapsed: boolean;
  active: boolean;
  external?: boolean;
}) {
  const className = `group flex items-center gap-3 rounded-md-md px-2 py-2 no-underline transition-colors ${
    active
      ? 'bg-md-secondary-container text-md-on-secondary-container'
      : 'text-md-on-surface-variant hover:bg-md-surface-container hover:text-md-on-surface'
  }`;
  const inner = (
    <>
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md-full bg-md-surface-container-high text-md-on-surface group-hover:bg-md-surface-container-highest">
        {icon}
      </span>
      {!collapsed && <span className="text-sm font-medium">{children}</span>}
    </>
  );
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={collapsed ? String(children) : undefined}
        className={className}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} title={collapsed ? String(children) : undefined} className={className}>
      {inner}
    </Link>
  );
}

function CheckIcon({ size = 'sm' }: { size?: 'xs' | 'sm' }) {
  const cls = size === 'xs' ? 'h-3 w-3' : 'h-4 w-4';
  return (
    <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden="true">
      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M11 7h2v2h-2V7Zm0 4h2v6h-2v-6Zm1-9a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 21s-7-4.5-9.3-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.3 6c-2.3 4.5-9.3 9-9.3 9Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.1c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.69.08-.69 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.44-2.7 5.4-5.27 5.69.41.35.78 1.05.78 2.12v3.14c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}
