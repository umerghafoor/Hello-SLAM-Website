import { ReactNode } from 'react';

export function Algorithm({
  name,
  inputs,
  children,
}: {
  name: string;
  inputs?: string;
  children: ReactNode;
}) {
  return (
    <figure className="my-6 overflow-hidden rounded-md-lg border border-md-outline-variant bg-md-surface-container-low">
      <header className="border-b border-md-outline-variant bg-md-surface-container-high px-4 py-2">
        <span className="font-mono text-xs uppercase tracking-[0.12em] text-md-on-surface-variant">
          algorithm
        </span>
        <span className="ml-2 font-display text-sm font-medium text-md-on-surface">
          {name}
          {inputs && (
            <span className="font-mono text-md-tertiary">({inputs})</span>
          )}
        </span>
      </header>
      <div className="px-5 py-4 font-mono text-[13px] leading-7 text-md-on-surface [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-0 [&_li]:my-0 [&_li::marker]:text-md-primary [&_li::marker]:font-semibold">
        {children}
      </div>
    </figure>
  );
}

export function Step({
  comment,
  children,
}: {
  comment?: string;
  children: ReactNode;
}) {
  return (
    <li>
      <span>{children}</span>
      {comment && (
        <span className="ml-2 text-md-on-surface-variant"># {comment}</span>
      )}
    </li>
  );
}
