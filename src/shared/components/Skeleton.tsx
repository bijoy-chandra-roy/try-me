import type { HTMLAttributes } from 'react';

export function Skeleton({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-inner bg-[var(--color-overlay-hover)] ${className}`}
      aria-hidden
      {...props}
    />
  );
}

export function PageSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-24 ${className}`} role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent-fill)] border-t-transparent" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function ProductCardSkeleton({ layout = 'grid' }: { layout?: 'grid' | 'compact' | 'list' }) {
  if (layout === 'list') {
    return (
      <div className="flex overflow-hidden rounded-container border border-subtle">
        <Skeleton className="aspect-[3/4] w-28 shrink-0 rounded-none sm:w-36" />
        <div className="flex flex-1 flex-col justify-center space-y-2 p-3 sm:p-4">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-container border border-subtle">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className={`space-y-2 ${layout === 'compact' ? 'p-2.5 sm:p-3' : 'p-3 sm:p-4'}`}>
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({
  count = 6,
  layout = 'grid',
}: {
  count?: number;
  layout?: 'grid' | 'compact' | 'list';
}) {
  const gridClass =
    layout === 'compact'
      ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4'
      : layout === 'list'
        ? 'flex flex-col gap-3 sm:gap-4'
        : 'grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3';

  return (
    <div className={gridClass} aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} layout={layout} />
      ))}
    </div>
  );
}

export function StatCardsSkeleton({
  count = 4,
  className = 'grid grid-cols-2 gap-4 sm:grid-cols-4',
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className} aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="glass-card space-y-2 p-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-7 w-12" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-container border border-subtle p-4"
        >
          <Skeleton className="h-12 w-12 shrink-0 rounded-element" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function CartLineSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-4 border-b border-subtle pb-4">
          <Skeleton className="h-24 w-20 shrink-0 rounded-element" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-4 w-14" />
        </div>
      ))}
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <ListSkeleton rows={3} />
      <div className="glass-card space-y-3 p-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

export function DashboardContentSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true">
      <StatCardsSkeleton count={4} />
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <ListSkeleton rows={3} />
      </div>
    </div>
  );
}
