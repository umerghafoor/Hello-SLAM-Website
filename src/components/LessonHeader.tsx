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
    <header className="mb-10 border-b border-md-outline-variant pb-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="md-chip">
          Chapter {chapterNumber} · {chapterTitle}
        </span>
        <span className="md-chip" style={{ background: 'var(--md-tertiary-container)', color: 'var(--md-on-tertiary-container)' }}>
          Lesson {chapterNumber}.{lessonIndex + 1}
        </span>
      </div>
      <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-md-on-surface">
        {title}
      </h1>
      {blurb && <p className="mt-4 text-md-on-surface-variant">{blurb}</p>}
    </header>
  );
}
