import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { TopAppBar } from '@/components/TopAppBar';
import { Footer } from '@/components/Footer';
import { SidebarProvider } from '@/components/SidebarContext';
import { ProgressProvider } from '@/components/ProgressContext';

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
        <ProgressProvider>
        <SidebarProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md-full focus:bg-md-primary focus:px-4 focus:py-2 focus:text-md-on-primary"
          >
            Skip to content
          </a>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <TopAppBar />
              <main id="main" className="flex-1">
                <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-10 md:py-14">
                  {children}
                </div>
              </main>
              <Footer />
            </div>
          </div>
        </SidebarProvider>
        </ProgressProvider>
      </body>
    </html>
  );
}
