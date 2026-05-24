export function LessonHeader({
  chapterNumber,
  chapterTitle,
  lessonIndex,
  title,
  blurb,
}: {
  chapterNumber: string;
  chapterTitle: string;
  lessonIndex: number;
  title: string;
  blurb?: string;
}) {
  return (
    <header className="mb-10 border-b border-[var(--border)] pb-8">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
        Chapter {chapterNumber} · {chapterTitle} · Lesson {chapterNumber}.{lessonIndex + 1}
      </div>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">{title}</h1>
      {blurb && <p className="mt-4 text-[var(--text-muted)]">{blurb}</p>}
    </header>
  );
}
