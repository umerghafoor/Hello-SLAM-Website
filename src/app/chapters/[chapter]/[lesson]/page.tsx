import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { chapters, getChapter, getLesson } from '@/lib/chapters';
import { LessonHeader } from '@/components/LessonHeader';
import { LessonNav } from '@/components/LessonNav';

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
  const { chapter, lesson } = await params;
  const l = getLesson(chapter, lesson);
  if (!l) return {};
  return { title: l.title };
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

  return (
    <article>
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
    <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-elev)] p-8 text-center text-[var(--text-muted)]">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--accent-2)]">
        Coming soon
      </div>
      <p className="mt-3">
        This lesson hasn’t been written yet. The full content will be ported from the
        source Jupyter notebook.
      </p>
    </div>
  );
}
