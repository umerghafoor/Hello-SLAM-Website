import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: {
    default: 'Hello SLAM',
    template: '%s · Hello SLAM',
  },
  description:
    'A hands-on course on Simultaneous Localization and Mapping — Kalman filters, particle filters, and graph-based SLAM.',
};

// Prevent theme flash by setting the class before paint.
const noFlashScript = `(() => {
  try {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'light');
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    root.style.colorScheme = theme;
  } catch (_) {}
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&family=Google+Sans+Display:wght@400;500;600;700&family=Google+Sans+Text:wght@400;500;600&family=Roboto+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="min-h-screen font-sans">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-md-outline-variant bg-md-surface/80 px-6 py-3 backdrop-blur-md md:px-10">
              <div className="text-xs uppercase tracking-[0.18em] text-md-on-surface-variant">
                Hello SLAM
              </div>
              <ThemeToggle />
            </div>
            <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-10 md:py-14">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
