'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'slam-progress';

export function lessonKey(chapterSlug: string, lessonSlug: string) {
  return `${chapterSlug}/${lessonSlug}`;
}

function readStorage(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function writeStorage(completed: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  } catch {
    // ignore quota errors
  }
}

export function useProgress() {
  const [completed, setCompleted] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setCompleted(readStorage());

    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setCompleted(readStorage());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const markComplete = useCallback((chapterSlug: string, lessonSlug: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(lessonKey(chapterSlug, lessonSlug));
      writeStorage(next);
      return next;
    });
  }, []);

  const markIncomplete = useCallback((chapterSlug: string, lessonSlug: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.delete(lessonKey(chapterSlug, lessonSlug));
      writeStorage(next);
      return next;
    });
  }, []);

  const isComplete = useCallback(
    (chapterSlug: string, lessonSlug: string) =>
      completed.has(lessonKey(chapterSlug, lessonSlug)),
    [completed]
  );

  return { completed, isComplete, markComplete, markIncomplete };
}
