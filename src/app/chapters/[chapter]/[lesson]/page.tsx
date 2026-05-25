import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { chapters, getChapter, getLesson } from '@/lib/chapters';
import { LessonHeader } from '@/components/LessonHeader';
import { LessonNav } from '@/components/LessonNav';

const SITE_URL = 'https://hello-slam.vercel.app';

export function generateStaticParams() {
  return chapters.flatMap((c) =>
    c.lessons.map((l) => ({ chapter: c.slug, lesson: l.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string; lesson: string }>;
}): Promise<Metadata> {
  const { chapter: chapterSlug, lesson: lessonSlug } = await params;
  const chapter = getChapter(chapterSlug);
  const lesson = getLesson(chapterSlug, lessonSlug);
  if (!chapter || !lesson) return {};
  const title = lesson.title;
  const description =
    lesson.blurb ??
    `${lesson.title} — part of Chapter ${chapter.number}: ${chapter.title} in the Hello SLAM course on Simultaneous Localization and Mapping.`;
  const url = `/chapters/${chapterSlug}/${lessonSlug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
    },
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ chapter: string; lesson: string }>;
}) {
  const { chapter: chapterSlug, lesson: lessonSlug } = await params;
  const chapter = getChapter(chapterSlug);
  const lesson = getLesson(chapterSlug, lessonSlug);
  if (!chapter || !lesson) notFound();

  const lessonIndex = chapter.lessons.findIndex((l) => l.slug === lessonSlug);

  let Content: React.ComponentType;
  try {
    const mod = await import(`@/content/${chapterSlug}/${lessonSlug}.mdx`);
    Content = mod.default;
  } catch {
    Content = PlaceholderContent;
  }

  const lessonUrl = `${SITE_URL}/chapters/${chapterSlug}/${lessonSlug}`;
  const description =
    lesson.blurb ??
    `${lesson.title} — part of Chapter ${chapter.number}: ${chapter.title} in the Hello SLAM course.`;

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LearningResource',
            name: lesson.title,
            description,
            url: lessonUrl,
            isPartOf: {
              '@type': 'Course',
              name: 'Hello SLAM',
              url: SITE_URL,
            },
            educationalLevel: 'advanced',
            inLanguage: 'en',
            isAccessibleForFree: true,
            provider: {
              '@type': 'Person',
              name: 'Nikolaos Stathoulopoulos',
              url: 'https://github.com/nstathou',
            },
          }),
        }}
      />
      <LessonHeader
        chapterNumber={chapter.number}
        chapterTitle={chapter.title}
        lessonIndex={lessonIndex}
        title={lesson.title}
        blurb={lesson.blurb}
      />
      <div className="prose-slam">
        <Content />
      </div>
      <LessonNav chapterSlug={chapterSlug} lessonSlug={lessonSlug} />
    </article>
  );
}

function PlaceholderContent() {
  return (
    <div className="rounded-md-xl border border-dashed border-md-outline-variant bg-md-surface-container-low p-8 text-center text-md-on-surface-variant">
      <span className="md-chip" style={{ background: 'var(--md-tertiary-container)', color: 'var(--md-on-tertiary-container)' }}>
        Coming soon
      </span>
      <p className="mt-3">
        This lesson hasn’t been written yet. The full content will be ported
        from the source Jupyter notebook.
      </p>
    </div>
  );
}
