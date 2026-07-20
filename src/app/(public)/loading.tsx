import { ProductGridSkeleton, Skeleton } from '@/shared/components/Skeleton';

export default function PublicLoading() {
  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-10">
      <section className="mb-8 sm:mb-10">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        <Skeleton className="mt-2 h-4 w-2/3 max-w-md" />
      </section>
      <section className="mb-6 space-y-4 sm:mb-8">
        <Skeleton className="h-11 w-full rounded-element" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />
          ))}
        </div>
      </section>
      <ProductGridSkeleton />
    </div>
  );
}
