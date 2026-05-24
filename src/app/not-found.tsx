import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="prose-slam">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--accent-2)]">
        404
      </div>
      <h1 className="mt-2 text-3xl font-semibold text-white">Page not found</h1>
      <p className="mt-3 text-[var(--text-muted)]">
        That route doesn’t exist (yet).{' '}
        <Link href="/">Head back to the course index.</Link>
      </p>
    </div>
  );
}
