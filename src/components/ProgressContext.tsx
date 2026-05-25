'use client';

import { createContext, useContext } from 'react';
import { useProgress } from '@/lib/progress';

type ProgressCtx = ReturnType<typeof useProgress>;

const ProgressContext = createContext<ProgressCtx | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const progress = useProgress();
  return (
    <ProgressContext.Provider value={progress}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgressContext() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgressContext must be used inside ProgressProvider');
  return ctx;
}
