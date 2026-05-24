import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="prose-slam">
      <span className="md-chip" style={{ background: 'var(--md-error-container)', color: 'var(--md-on-error-container)' }}>
        404
      </span>
      <h1 className="mt-4 font-display text-4xl font-medium text-md-on-surface">
        Page not found
      </h1>
      <p className="mt-3 text-md-on-surface-variant">
        That route doesn’t exist (yet).{' '}
        <Link href="/">Head back to the course index.</Link>
      </p>
    </div>
  );
}
