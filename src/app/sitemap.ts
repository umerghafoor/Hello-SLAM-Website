import type { MetadataRoute } from 'next';
import { chapters, flatLessons } from '@/lib/chapters';

const SITE_URL = 'https://hello-slam.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${SITE_URL}/roadmap`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/credits`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
  ];

  const chapterRoutes: MetadataRoute.Sitemap = chapters.map((c) => ({
    url: `${SITE_URL}/chapters/${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  const lessonRoutes: MetadataRoute.Sitemap = flatLessons.map((l) => ({
    url: `${SITE_URL}${l.href}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...chapterRoutes, ...lessonRoutes];
}
