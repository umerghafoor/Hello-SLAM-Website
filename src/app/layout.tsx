import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { TopAppBar } from '@/components/TopAppBar';
import { Footer } from '@/components/Footer';
import { SidebarProvider } from '@/components/SidebarContext';
import { ProgressProvider } from '@/components/ProgressContext';

const SITE_URL = 'https://hello-slam.optikflows.com';
const SITE_NAME = 'Hello SLAM';
const SITE_DESCRIPTION =
  'A free, hands-on course on Simultaneous Localization and Mapping (SLAM). Learn Kalman filters, particle filters, EKF-SLAM, FastSLAM, and graph-based SLAM with interactive visualisations.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'SLAM',
    'Simultaneous Localization and Mapping',
    'Kalman filter',
    'Extended Kalman Filter',
    'particle filter',
    'Monte Carlo Localization',
    'FastSLAM',
    'graph-based SLAM',
    'robotics',
    'probabilistic robotics',
    'Bayes filter',
    'occupancy grid',
    'EKF-SLAM',
    'robot localization',
    'mapping algorithms',
  ],
  authors: [{ name: 'Nikolaos Stathoulopoulos', url: 'https://github.com/nstathou' }],
  creator: 'Nikolaos Stathoulopoulos',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Hello SLAM — a free interactive course on robot localization and mapping',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: 'education',
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
        {/* Favicon chain */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Structured data — Course */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Course',
              name: 'Hello SLAM',
              description: SITE_DESCRIPTION,
              url: SITE_URL,
              provider: {
                '@type': 'Person',
                name: 'Nikolaos Stathoulopoulos',
                url: 'https://github.com/nstathou',
              },
              educationalLevel: 'advanced',
              teaches: [
                'Simultaneous Localization and Mapping',
                'Kalman Filters',
                'Particle Filters',
                'Graph-based SLAM',
                'Probabilistic Robotics',
              ],
              inLanguage: 'en',
              isAccessibleForFree: true,
              hasCourseInstance: {
                '@type': 'CourseInstance',
                courseMode: 'online',
              },
            }),
          }}
        />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-FK8M9RWRQ8" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-FK8M9RWRQ8');`,
          }}
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
