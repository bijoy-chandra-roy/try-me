import { Skeleton } from '@/shared/components/Skeleton';

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-form px-4 py-8 sm:px-6 sm:py-10">
      <Skeleton className="mb-2 h-8 w-40" />
      <Skeleton className="mb-8 h-4 w-64" />
      <div className="mb-8 flex gap-1 border-b border-subtle pb-px">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-12" />
        ))}
      </div>
      <div className="glass-card space-y-4 p-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}
