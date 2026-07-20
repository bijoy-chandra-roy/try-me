import { DashboardContentSkeleton, Skeleton } from '@/shared/components/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-content items-start gap-4 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8">
      <aside className="glass-card sticky top-24 hidden w-[var(--layout-sidenav-width)] shrink-0 flex-col gap-1 p-4 md:flex">
        <Skeleton className="mb-2 h-3 w-20" />
        <Skeleton className="mb-1 h-5 w-28" />
        <Skeleton className="mb-4 h-6 w-16" />
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </aside>
      <div className="min-w-0 flex-1">
        <header className="mb-6 sm:mb-8">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="mt-2 h-4 w-72" />
        </header>
        <DashboardContentSkeleton />
      </div>
    </div>
  );
}
