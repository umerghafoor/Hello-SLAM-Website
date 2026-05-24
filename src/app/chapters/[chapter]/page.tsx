import Link from 'next/link';
import { notFound } from 'next/navigation';
import { chapters, getChapter } from '@/lib/chapters';
import type { Metadata } from 'next';

export function generateStaticParams() {
  return chapters.map((c) => ({ chapter: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string }>;
}): Promise<Metadata> {
  const { chapter: slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) return {};
  return { title: `Chapter ${chapter.number} · ${chapter.title}` };
}

export default async function ChapterIndex({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter: slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();

  return (
    <div className="prose-slam">
      <span className="md-chip">Chapter {chapter.number}</span>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-md-on-surface">
        {chapter.title}
      </h1>
      <p className="mt-4 text-md-on-surface-variant">{chapter.summary}</p>

      <ol className="mt-10 grid gap-3">
        {chapter.lessons.map((lesson, i) => (
          <li key={lesson.slug} className="list-none">
            <Link
              href={`/chapters/${chapter.slug}/${lesson.slug}`}
              className="group md-card flex items-start gap-4 p-5 no-underline"
            >
              <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md-full bg-md-primary-container font-display text-base font-semibold text-md-on-primary-container tabular-nums">
                {chapter.number}.{i + 1}
              </div>
              <div className="min-w-0">
                <div className="font-display text-lg font-medium text-md-on-surface group-hover:text-md-primary">
                  {lesson.title}
                </div>
                {lesson.blurb && (
                  <p className="mt-1 text-sm text-md-on-surface-variant">
                    {lesson.blurb}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
