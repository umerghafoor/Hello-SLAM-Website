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
      <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
        Chapter {chapter.number}
      </div>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
        {chapter.title}
      </h1>
      <p className="mt-4 text-[var(--text-muted)]">{chapter.summary}</p>

      <ol className="mt-10 grid gap-3">
        {chapter.lessons.map((lesson, i) => (
          <li key={lesson.slug} className="list-none">
            <Link
              href={`/chapters/${chapter.slug}/${lesson.slug}`}
              className="group flex items-start gap-4 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] p-5 no-underline transition-colors hover:border-[var(--accent)]"
            >
              <div className="text-3xl font-semibold text-[var(--text-faint)] tabular-nums">
                {chapter.number}.{i + 1}
              </div>
              <div className="min-w-0">
                <div className="text-lg font-semibold text-white group-hover:text-[var(--accent)]">
                  {lesson.title}
                </div>
                {lesson.blurb && (
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{lesson.blurb}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
