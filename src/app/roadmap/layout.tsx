import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Course Roadmap',
  description:
    'Visual roadmap for the Hello SLAM course. See all 12 lessons across 4 chapters, track your progress, and navigate directly to any lesson.',
  alternates: { canonical: '/roadmap' },
  openGraph: {
    title: 'Course Roadmap · Hello SLAM',
    description:
      'Visual roadmap for Hello SLAM — see all lessons, track your progress, and jump to any chapter.',
    url: '/roadmap',
  },
};

export default function RoadmapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
