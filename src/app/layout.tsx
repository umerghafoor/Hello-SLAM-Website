import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: {
    default: 'Hello SLAM',
    template: '%s · Hello SLAM',
  },
  description:
    'A hands-on course on Simultaneous Localization and Mapping — Kalman filters, particle filters, and graph-based SLAM.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0">
            <div className="mx-auto w-full max-w-3xl px-6 py-10 md:px-10 md:py-14">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
