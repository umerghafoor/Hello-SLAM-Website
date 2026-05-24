'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', t === 'dark');
  root.classList.toggle('light', t === 'light');
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
    applyTheme(t);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    try {
      window.localStorage.setItem('theme', next);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      aria-label={
        mounted
          ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`
          : 'Toggle theme'
      }
      onClick={toggle}
      className="md-icon-btn"
    >
      {/* Sun icon shown when in dark mode (click to go light) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={`h-5 w-5 transition-transform duration-300 ${
          theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0 absolute'
        }`}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 4.5a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5.5a1 1 0 0 1 1-1Zm0 12a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm0 1.5a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V19a1 1 0 0 1 1-1Zm7.5-6a1 1 0 0 1 1 1 1 1 0 0 1-1 1H18a1 1 0 1 1 0-2h1.5Zm-15 0a1 1 0 0 1 1 1 1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h1.5Zm12.02-5.52a1 1 0 0 1 1.41 0 1 1 0 0 1 0 1.41l-1.06 1.06a1 1 0 0 1-1.41-1.41l1.06-1.06ZM6.53 16.46a1 1 0 0 1 1.41 0 1 1 0 0 1 0 1.41l-1.06 1.06a1 1 0 0 1-1.41-1.41l1.06-1.06Zm10.99 0 1.06 1.06a1 1 0 0 1-1.41 1.41l-1.06-1.06a1 1 0 0 1 1.41-1.41ZM7.94 7.94 6.88 6.88a1 1 0 0 1 1.41-1.41L9.35 6.53a1 1 0 0 1-1.41 1.41Z" />
      </svg>
      {/* Moon icon shown when in light mode (click to go dark) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={`h-5 w-5 transition-transform duration-300 ${
          theme === 'light' ? 'rotate-0 scale-100' : 'rotate-90 scale-0 absolute'
        }`}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.742 13.045A8.088 8.088 0 0 1 19.5 13.5a8.5 8.5 0 0 1-8.5-8.5c0-.428.034-.85.1-1.262A1 1 0 0 0 9.74 2.687 10 10 0 1 0 21.313 14.26a1 1 0 0 0-.571-1.215Z" />
      </svg>
    </button>
  );
}
