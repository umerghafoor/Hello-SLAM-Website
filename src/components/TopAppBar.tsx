'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useSidebar } from './SidebarContext';
import { chapters, getChapter, getLesson } from '@/lib/chapters';

function useBreadcrumb() {
  const pathname = usePathname() ?? '/';
  // /chapters/[chapter]/[lesson]?
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'chapters' && parts[1]) {
    const chapter = getChapter(parts[1]);
    if (chapter && parts[2]) {
      const lesson = getLesson(parts[1], parts[2]);
      if (lesson) {
        return {
          eyebrow: `Chapter ${chapter.number} · ${chapter.title}`,
          title: lesson.title,
        };
      }
    }
    if (chapter) {
      return {
        eyebrow: `Chapter ${chapter.number}`,
        title: chapter.title,
      };
    }
  }
  if (pathname === '/about') return { eyebrow: 'About', title: 'About this course' };
  if (pathname === '/credits') return { eyebrow: 'Credits', title: 'Credits & attribution' };
  return { eyebrow: 'Course', title: 'Hello SLAM' };
}

export function TopAppBar() {
  const { collapsed, toggleCollapsed, openMobile } = useSidebar();
  const { eyebrow, title } = useBreadcrumb();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-200 ${
        scrolled
          ? 'border-b border-md-outline-variant bg-md-surface-container/95 backdrop-blur-md shadow-md-1'
          : 'border-b border-transparent bg-md-surface'
      }`}
    >
      <div className="flex h-16 items-center gap-2 px-3 md:px-6">
        {/* Mobile: open drawer */}
        <button
          type="button"
          onClick={openMobile}
          aria-label="Open navigation"
          className="md-icon-btn md:hidden"
        >
          <MenuIcon />
        </button>

        {/* Desktop: toggle rail */}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          aria-pressed={collapsed}
          className="md-icon-btn hidden md:inline-flex"
        >
          {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
        </button>

        <Link
          href="/"
          className="ml-1 flex min-w-0 items-center gap-2 rounded-md-sm px-1.5 py-1 no-underline hover:bg-md-surface-container"
        >
          <LogoMark />
          <div className="min-w-0">
            <div className="truncate font-display text-base font-medium text-md-on-surface md:text-lg">
              Hello <span className="text-md-primary">SLAM</span>
            </div>
            <div className="hidden text-[10px] uppercase tracking-[0.18em] text-md-on-surface-variant md:block">
              {eyebrow}
            </div>
          </div>
        </Link>

        {/* Center title (large screens) */}
        <div className="hidden min-w-0 flex-1 lg:block">
          <div className="mx-6 truncate text-sm text-md-on-surface-variant">
            {title}
          </div>
        </div>
        <div className="flex-1 lg:hidden" />

        {/* Trailing actions */}
        <nav className="hidden items-center gap-1 sm:flex">
          <HeaderLink href="/">Home</HeaderLink>
          <HeaderMenu />
          <HeaderLink href="/about">About</HeaderLink>
          <HeaderLink href="/credits">Credits</HeaderLink>
        </nav>
        <a
          href="https://github.com/nstathou/hello-slam"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Source on GitHub"
          className="md-icon-btn"
        >
          <GitHubIcon />
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}

function HeaderLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`rounded-md-full px-3 py-1.5 text-sm no-underline transition-colors ${
        active
          ? 'bg-md-secondary-container text-md-on-secondary-container font-medium'
          : 'text-md-on-surface-variant hover:bg-md-surface-container hover:text-md-on-surface'
      }`}
    >
      {children}
    </Link>
  );
}

function HeaderMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? '';

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('[data-chapters-menu]')) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Close when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const inChapters = pathname.startsWith('/chapters');

  return (
    <div className="relative" data-chapters-menu>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`inline-flex items-center gap-1 rounded-md-full px-3 py-1.5 text-sm no-underline transition-colors ${
          inChapters
            ? 'bg-md-secondary-container text-md-on-secondary-container font-medium'
            : 'text-md-on-surface-variant hover:bg-md-surface-container hover:text-md-on-surface'
        }`}
      >
        Chapters
        <ChevronDownIcon className={open ? 'rotate-180' : ''} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-md-md border border-md-outline-variant bg-md-surface-container-high shadow-md-3"
        >
          <ul className="py-1">
            {chapters.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/chapters/${c.slug}`}
                  role="menuitem"
                  className="flex items-center gap-3 px-3 py-2 no-underline hover:bg-md-surface-container-highest"
                >
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md-full bg-md-primary-container text-xs font-semibold text-md-on-primary-container">
                    {c.number}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-md-on-surface">
                      {c.title}
                    </span>
                    <span className="block truncate text-xs text-md-on-surface-variant">
                      {c.lessons.length} lesson
                      {c.lessons.length === 1 ? '' : 's'}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------- icons ---------- */

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
    </svg>
  );
}

function MenuOpenIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M3 6h18v2H3V6Zm0 5h12v2H3v-2Zm0 5h18v2H3v-2Zm15.71-1.29L21 13.41 18.41 11l-1.42 1.41L18.59 14l-1.6 1.59L18.4 17l1.31-1.29Z" />
    </svg>
  );
}

function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 transition-transform duration-200 ${className}`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.1c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.69.08-.69 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.44-2.7 5.4-5.27 5.69.41.35.78 1.05.78 2.12v3.14c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function LogoMark() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md-full bg-md-primary text-md-on-primary"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 2 4 6v6c0 5 3.4 9.6 8 10 4.6-.4 8-5 8-10V6l-8-4Zm0 4 5 2.5V12c0 3.6-2.3 7-5 7.6-2.7-.6-5-4-5-7.6V8.5L12 6Z" />
      </svg>
    </span>
  );
}
