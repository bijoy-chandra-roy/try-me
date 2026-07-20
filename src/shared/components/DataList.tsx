'use client';

import { type ReactNode } from 'react';

export function DataList({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`data-list ${className}`.trim()}>{children}</div>;
}

export function ListRow({
  children,
  className = '',
  dimmed = false,
}: {
  children: ReactNode;
  className?: string;
  dimmed?: boolean;
}) {
  return (
    <div
      className={`data-list-row group ${dimmed ? 'row-dimmed' : ''} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
