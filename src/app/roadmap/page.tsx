'use client';

import Link from 'next/link';
import { chapters, flatLessons, type Chapter, type Lesson } from '@/lib/chapters';
import { useProgressContext } from '@/components/ProgressContext';

const CHAPTER_COLORS = [
  {
    track: 'bg-md-primary',
    node: 'bg-md-primary text-md-on-primary',
    nodeDone: 'bg-md-primary text-md-on-primary ring-4 ring-md-primary/30',
    nodeEmpty: 'bg-md-surface-container-high text-md-on-surface-variant border-2 border-md-primary/40',
    header: 'bg-md-primary-container text-md-on-primary-container',
    bar: 'bg-md-primary',
    connector: 'border-md-primary/40',
  },
  {
    track: 'bg-md-tertiary',
    node: 'bg-md-tertiary text-md-on-tertiary',
    nodeDone: 'bg-md-tertiary text-md-on-tertiary ring-4 ring-md-tertiary/30',
    nodeEmpty: 'bg-md-surface-container-high text-md-on-surface-variant border-2 border-md-tertiary/40',
    header: 'bg-md-tertiary-container text-md-on-tertiary-container',
    bar: 'bg-md-tertiary',
    connector: 'border-md-tertiary/40',
  },
  {
    track: 'bg-md-secondary',
    node: 'bg-md-secondary text-md-on-secondary',
    nodeDone: 'bg-md-secondary text-md-on-secondary ring-4 ring-md-secondary/30',
    nodeEmpty: 'bg-md-surface-container-high text-md-on-surface-variant border-2 border-md-secondary/40',
    header: 'bg-md-secondary-container text-md-on-secondary-container',
    bar: 'bg-md-secondary',
    connector: 'border-md-secondary/40',
  },
  {
    track: 'bg-md-primary',
    node: 'bg-md-primary text-md-on-primary',
    nodeDone: 'bg-md-primary text-md-on-primary ring-4 ring-md-primary/30',
    nodeEmpty: 'bg-md-surface-container-high text-md-on-surface-variant border-2 border-md-primary/40',
    header: 'bg-md-primary-container text-md-on-primary-container',
    bar: 'bg-md-primary',
    connector: 'border-md-primary/40',
  },
];

export default function RoadmapPage() {
  const { isComplete, completed, markComplete, markIncomplete } = useProgressContext();

  const totalLessons = flatLessons.length;
  const doneLessons = completed.size;
  const pct = totalLessons === 0 ? 0 : Math.round((doneLessons / totalLessons) * 100);

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-8">
        <span className="md-chip">Course Roadmap</span>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-md-on-surface">
          Learning Roadmap
        </h1>
        <p className="mt-2 text-md-on-surface-variant">
          {totalLessons} lessons across {chapters.length} chapters — click any node to open it,
          or toggle completion directly on the map.
        </p>
      </div>

      {/* ── Overall progress strip ── */}
      <div className="mb-10 flex flex-wrap items-center gap-6 rounded-md-xl border border-md-outline-variant bg-md-surface-container-low px-6 py-4">
        <div className="flex-1 min-w-48">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-semibold text-md-on-surface">{pct}%</span>
            <span className="text-sm text-md-on-surface-variant">{doneLessons} / {totalLessons} lessons done</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-md-full bg-md-surface-container-highest">
            <div
              className="h-full rounded-md-full bg-md-primary transition-all duration-700"
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={doneLessons}
              aria-valuemin={0}
              aria-valuemax={totalLessons}
            />
          </div>
        </div>
        {doneLessons > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset all progress?')) {
                flatLessons.forEach((l) => markIncomplete(l.chapter.slug, l.slug));
              }
            }}
            className="shrink-0 text-xs text-md-on-surface-variant underline underline-offset-2 hover:text-md-error"
          >
            Reset all
          </button>
        )}
      </div>

      {/* ── Visual map ── */}
      <div className="relative space-y-0">
        {chapters.map((chapter, ci) => {
          const color = CHAPTER_COLORS[ci % CHAPTER_COLORS.length];
          const chapterDone = chapter.lessons.filter((l) => isComplete(chapter.slug, l.slug)).length;
          const allDone = chapterDone === chapter.lessons.length;
          // Even chapters flow left→right, odd chapters flow right→left
          const reversed = ci % 2 === 1;

          return (
            <ChapterTrack
              key={chapter.slug}
              chapter={chapter}
              chapterIndex={ci}
              color={color}
              reversed={reversed}
              allDone={allDone}
              chapterDone={chapterDone}
              isComplete={isComplete}
              markComplete={markComplete}
              markIncomplete={markIncomplete}
              isLastChapter={ci === chapters.length - 1}
            />
          );
        })}

        {/* Finish node */}
        <div className="flex justify-center pt-6 pb-2">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-md-full border-4 font-display text-xs font-bold transition-all duration-500 ${
              pct === 100
                ? 'border-md-primary bg-md-primary text-md-on-primary shadow-lg scale-110'
                : 'border-md-outline-variant bg-md-surface-container text-md-on-surface-variant'
            }`}
          >
            {pct === 100 ? <StarIcon /> : 'END'}
          </div>
        </div>
        {pct === 100 && (
          <p className="text-center text-sm font-medium text-md-primary pb-4">
            Course complete — excellent work!
          </p>
        )}
      </div>
    </div>
  );
}

function ChapterTrack({
  chapter,
  chapterIndex,
  color,
  reversed,
  allDone,
  chapterDone,
  isComplete,
  markComplete,
  markIncomplete,
  isLastChapter,
}: {
  chapter: Chapter;
  chapterIndex: number;
  color: (typeof CHAPTER_COLORS)[0];
  reversed: boolean;
  allDone: boolean;
  chapterDone: number;
  isComplete: (c: string, l: string) => boolean;
  markComplete: (c: string, l: string) => void;
  markIncomplete: (c: string, l: string) => void;
  isLastChapter: boolean;
}) {
  const cpct = chapter.lessons.length === 0 ? 0 : Math.round((chapterDone / chapter.lessons.length) * 100);

  return (
    <div className="relative">
      {/* Chapter label band */}
      <div className={`mb-4 mt-6 flex items-center gap-3 rounded-md-xl px-5 py-3 ${color.header}`}>
        <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md-full font-display text-sm font-bold ${allDone ? 'bg-white/30' : 'bg-black/10'}`}>
          {allDone ? <CheckIcon /> : chapter.number}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-display text-base font-semibold">{chapter.title}</div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-md-full bg-black/10">
            <div
              className="h-full rounded-md-full bg-white/60 transition-all duration-700"
              style={{ width: `${cpct}%` }}
            />
          </div>
        </div>
        <span className="shrink-0 text-xs font-medium opacity-80">
          {chapterDone}/{chapter.lessons.length}
        </span>
      </div>

      {/* Lesson nodes row */}
      <div className={`relative flex items-start gap-0 ${reversed ? 'flex-row-reverse' : 'flex-row'}`}>
        {chapter.lessons.map((lesson, li) => {
          const isFirst = li === 0;
          const isLast = li === chapter.lessons.length - 1;
          const done = isComplete(chapter.slug, lesson.slug);
          const href = `/chapters/${chapter.slug}/${lesson.slug}`;

          // Determine if connector to next node should be "lit"
          const nextDone = li + 1 < chapter.lessons.length
            ? isComplete(chapter.slug, chapter.lessons[li + 1].slug)
            : false;
          const connectorLit = done && nextDone;

          return (
            <div key={lesson.slug} className="flex flex-1 items-center">
              {/* Node */}
              <div className="flex flex-col items-center">
                <LessonNode
                  lesson={lesson}
                  chapterSlug={chapter.slug}
                  lessonIndex={li}
                  chapterNumber={chapter.number}
                  href={href}
                  done={done}
                  color={color}
                  markComplete={markComplete}
                  markIncomplete={markIncomplete}
                />
              </div>

              {/* Horizontal connector to next node */}
              {!isLast && (
                <div className="relative h-1 flex-1 mx-1">
                  <div className="absolute inset-0 rounded-md-full bg-md-outline-variant/40" />
                  <div
                    className={`absolute inset-0 rounded-md-full transition-all duration-500 ${color.track}`}
                    style={{ width: connectorLit ? '100%' : done ? '50%' : '0%' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Vertical connector down to next chapter (snaking turn) */}
      {!isLastChapter && (
        <div className={`flex ${reversed ? 'justify-start pl-[calc(100%/12)]' : 'justify-end pr-[calc(100%/12)]'} mt-1`}>
          <div className={`w-1 h-10 rounded-md-full bg-md-outline-variant/40 relative overflow-hidden`}>
            <div
              className={`absolute inset-x-0 top-0 rounded-md-full transition-all duration-500 ${color.track}`}
              style={{
                height: allDone ? '100%' : '0%',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function LessonNode({
  lesson,
  chapterSlug,
  lessonIndex,
  chapterNumber,
  href,
  done,
  color,
  markComplete,
  markIncomplete,
}: {
  lesson: Lesson;
  chapterSlug: string;
  lessonIndex: number;
  chapterNumber: string;
  href: string;
  done: boolean;
  color: (typeof CHAPTER_COLORS)[0];
  markComplete: (c: string, l: string) => void;
  markIncomplete: (c: string, l: string) => void;
}) {
  return (
    <div className="group relative flex flex-col items-center">
      {/* The node circle */}
      <Link
        href={href}
        title={lesson.title}
        className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-md-full font-display text-sm font-bold shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg no-underline ${
          done ? color.node + ' ring-4 ring-offset-2 ring-offset-md-background' + ` ring-${color.track.replace('bg-', '')}` : color.nodeEmpty
        }`}
        style={done ? { boxShadow: undefined } : undefined}
      >
        {done ? <CheckIcon /> : `${chapterNumber}.${lessonIndex + 1}`}
      </Link>

      {/* Label below the node */}
      <div className="mt-2 w-20 text-center text-[10px] leading-tight text-md-on-surface-variant line-clamp-2">
        {lesson.title}
      </div>

      {/* Hover tooltip / toggle */}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-48 -translate-x-1/2 rounded-md-lg border border-md-outline-variant bg-md-surface-container-high px-3 py-2 opacity-0 shadow-md-3 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="text-xs font-semibold text-md-on-surface">{lesson.title}</div>
        {lesson.blurb && (
          <div className="mt-0.5 text-[11px] text-md-on-surface-variant">{lesson.blurb}</div>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            done
              ? markIncomplete(chapterSlug, lesson.slug)
              : markComplete(chapterSlug, lesson.slug);
          }}
          className={`mt-2 w-full rounded-md-full py-1 text-[11px] font-medium transition-colors ${
            done
              ? 'bg-md-primary/10 text-md-primary hover:bg-md-primary/20'
              : 'bg-md-surface-container-highest text-md-on-surface hover:bg-md-primary hover:text-md-on-primary'
          }`}
        >
          {done ? 'Mark incomplete' : 'Mark complete'}
        </button>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z" />
    </svg>
  );
}
